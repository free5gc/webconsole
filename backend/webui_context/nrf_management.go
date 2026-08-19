package webui_context

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/free5gc/openapi"
	"github.com/free5gc/openapi/models"
	Nnrf_NFManagement "github.com/free5gc/openapi/nrf/NFMgmt"
	"github.com/free5gc/webconsole/backend/logger"
)

// NF registration constants
const (
	RetryInterval    = 2 * time.Second
	MaxRetryAttempts = 10
)

func SendNFRegistration() error {
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

	var nf models.Nrf_NFMgmt_NFProfile
	var res *Nnrf_NFManagement.RegisterNFInstanceResponse
	var err error

	retryTime := 0
	for {
		res, err = GetSelf().
			NFManagementClient.
			NFInstanceIDDocumentApi.RegisterNFInstance(context.Background(), registrationRequest)
		// RegisterNFInstance(context.TODO(), GetSelf().NfInstanceID, profile)
		if err != nil || res == nil || res.Nrf_NFMgmt_NFProfile == nil {
			if err == nil {
				err = fmt.Errorf("RegisterNFInstance returned an empty NF profile")
			}
			logger.ConsumerLog.Warnf("Webconsole-AF register to NRF Error[%s]", err.Error())
			time.Sleep(RetryInterval)
			retryTime += 1
			if retryTime == MaxRetryAttempts {
				return fmt.Errorf("NF Register retry failed %+v times", retryTime)
			}
			continue
		}
		nf = *res.Nrf_NFMgmt_NFProfile

		if res.Location == "" {
			// NFUpdate
			break
		} else {
			// NFRegister
			resourceUri := res.Location
			GetSelf().NfInstanceID = resourceUri[strings.LastIndex(resourceUri, "/")+1:]

			oauth2 := false
			if customInfo, isMap := nf.CustomInfo.(map[string]interface{}); isMap {
				v, ok := customInfo["oauth2"].(bool)
				if ok {
					oauth2 = v
					logger.MainLog.Infoln("OAuth2 setting receive from NRF:", oauth2)
				}
			}
			GetSelf().OAuth2Required = oauth2
		}
	}

	logger.InitLog.Infof("Webconsole-AF Registration to NRF success")
	return nil
}

func RetrySendNFRegistration(maxRetry int) error {
	retryCount := 0
	for retryCount < maxRetry {
		err := SendNFRegistration()
		if err == nil {
			return nil
		}
		logger.ConsumerLog.Warnf("Send NFRegistration Failed by %v", err)
		retryCount++
	}
	return fmt.Errorf("[AF] Retry NF Registration has meet maximum")
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
