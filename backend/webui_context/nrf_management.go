package webui_context

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/free5gc/openapi"
	"github.com/free5gc/openapi/models"
	Nnrf_NFManagement "github.com/free5gc/openapi/nrf/NFMgmt"
	"github.com/free5gc/util/nfheartbeat"
	"github.com/free5gc/webconsole/backend/logger"
)

// NF registration constants
const (
	RetryInterval    = 2 * time.Second
	MaxRetryAttempts = 10
)

// nfheartbeat.Registrar asks for a PATCH bound below the interval, which the NRF may set as low as MinTimer.
// The shared openapi client alone allows 10s, the default interval itself.
const heartbeatRequestTimeout = time.Duration(nfheartbeat.MinTimer) * time.Second

// SendNFRegistration registers the AF profile on its own instance ID (3GPP TS 29.510 clause 5.2.2.2.2). The startup
// call retries until ctx is done and adopts the NRF OAuth2 setting; others give up after MaxRetryAttempts.
func SendNFRegistration(ctx context.Context, startup bool) error {
	profile := &models.Nrf_NFMgmt_NFProfile{
		NfInstanceId: GetSelf().NfInstanceID,
		NfType:       models.Nrf_NFMgmt_NFType_AF,
		NfStatus:     models.Nrf_NFMgmt_NFStatus_REGISTERED,
		CustomInfo: map[string]interface{}{
			"AfType": "webconsole",
		},
	}

	registrationRequest := &Nnrf_NFManagement.RegisterNFInstanceRequest{
		NfInstanceID: &GetSelf().NfInstanceID,
		RequestBody:  profile,
	}

	var res *Nnrf_NFManagement.RegisterNFInstanceResponse
	var err error

	for attempt := 1; ctx.Err() == nil; attempt++ {
		res, err = GetSelf().
			NFManagementClient.
			NFInstanceIDDocumentApi.RegisterNFInstance(ctx, registrationRequest)
		if err == nil && res != nil && res.Nrf_NFMgmt_NFProfile != nil {
			processRegisterResponse(res.Nrf_NFMgmt_NFProfile, startup)
			logger.InitLog.Infof("Webconsole-AF Registration to NRF success")
			return nil
		}
		if err == nil {
			err = fmt.Errorf("RegisterNFInstance returned an empty NF profile")
		}
		// A request cut short by shutdown is not an NRF failure worth a warning.
		if ctx.Err() != nil {
			break
		}
		logger.ConsumerLog.Warnf("Webconsole-AF register to NRF Error[%s]", err.Error())
		if !startup && attempt == MaxRetryAttempts {
			return fmt.Errorf("NF Register retry failed %+v times", attempt)
		}
		select {
		case <-ctx.Done():
		case <-time.After(RetryInterval):
		}
	}
	return fmt.Errorf("NFRegister aborted: %w (last error: %v)", ctx.Err(), err)
}

// processRegisterResponse adopts what the NRF answered to the NFRegister PUT: the
// heartbeat interval and the oauth2 custom info.
func processRegisterResponse(nf *models.Nrf_NFMgmt_NFProfile, applyOAuth2 bool) {
	GetSelf().heartbeatTimer = nf.HeartBeatTimer

	oauth2 := false
	if customInfo, isMap := nf.CustomInfo.(map[string]interface{}); isMap {
		if v, ok := customInfo["oauth2"].(bool); ok {
			oauth2 = v
			logger.MainLog.Infoln("OAuth2 setting receive from NRF:", oauth2)
		}
	}
	if applyOAuth2 {
		GetSelf().OAuth2Required.Store(oauth2)
	} else if oauth2 != GetSelf().OAuth2Required.Load() {
		logger.ConsumerLog.Warnf("NRF OAuth2 setting changed to %v, restart the webconsole to apply it", oauth2)
	}
}

// SendUpdateNFInstance sends an NFUpdate PATCH to the NRF, honoring ctx and heartbeatRequestTimeout.
// The raw err comes back alongside any ProblemDetails so callers can read its GenericOpenAPIError status.
func SendUpdateNFInstance(ctx context.Context, patchItems []models.PatchItem) (
	nf models.Nrf_NFMgmt_NFProfile, problemDetails *models.ProblemDetails, err error,
) {
	afSelf := GetSelf()
	tokCtx, pd, err := afSelf.GetTokenCtx(models.Nrf_NFMgmt_ServiceName_NNRF_NFM, models.Nrf_NFMgmt_NFType_NRF)
	if err != nil {
		return nf, pd, err
	}
	// GetTokenCtx takes no parent, so the token request stays uncancelable;
	// transplanting the token lets at least the PATCH honor ctx.
	if tok := tokCtx.Value(openapi.ContextOAuth2); tok != nil {
		ctx = context.WithValue(ctx, openapi.ContextOAuth2, tok)
	}
	ctx, cancel := context.WithTimeout(ctx, heartbeatRequestTimeout)
	defer cancel()

	req := &Nnrf_NFManagement.UpdateNFInstanceRequest{
		NfInstanceID: &afSelf.NfInstanceID,
		RequestBody:  patchItems,
	}

	res, err := afSelf.NFManagementClient.NFInstanceIDDocumentApi.UpdateNFInstance(ctx, req)
	if err != nil {
		var apiErr openapi.GenericOpenAPIError
		if errors.As(err, &apiErr) {
			if updateErr, okModel := apiErr.Model().(Nnrf_NFManagement.UpdateNFInstanceError); okModel {
				return nf, updateErr.ProblemDetails, err
			}
		}
		return nf, nil, err
	}
	if res == nil {
		return nf, nil, fmt.Errorf("empty NFUpdate response")
	}
	if res.Nrf_NFMgmt_NFProfile != nil {
		nf = *res.Nrf_NFMgmt_NFProfile
	}
	return nf, nil, nil
}

func SendDeregisterNFInstance() (*models.ProblemDetails, error) {
	logger.ConsumerLog.Infof("Send Deregister NFInstance")

	ctx, pd, err := GetSelf().GetTokenCtx(models.Nrf_NFMgmt_ServiceName_NNRF_NFM, models.Nrf_NFMgmt_NFType_NRF)
	if err != nil {
		return pd, err
	}

	afSelf := GetSelf()
	req := &Nnrf_NFManagement.DeregisterNFInstanceRequest{
		NfInstanceID: &afSelf.NfInstanceID,
	}

	_, err = afSelf.NFManagementClient.NFInstanceIDDocumentApi.DeregisterNFInstance(ctx, req)
	if err != nil {
		switch apiErr := err.(type) {
		case openapi.GenericOpenAPIError:
			switch errModel := apiErr.Model().(type) {
			case Nnrf_NFManagement.DeregisterNFInstanceError:
				pd = errModel.ProblemDetails
				logger.InitLog.Errorf("Deregister NF instance Failed Problem[%+v]", pd)
				return pd, err
			case error:
				logger.InitLog.Errorf("Deregister NF instance GenericOpenAPIError[%+v]", err)
				return nil, errModel
			}
		default:
			logger.InitLog.Errorf("Deregister NF instance Error[%+v]", err)
			return nil, err
		}
	}
	return nil, nil
}
