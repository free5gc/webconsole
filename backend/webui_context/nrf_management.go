package webui_context

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/free5gc/openapi"
	"github.com/free5gc/openapi/models"
	"github.com/free5gc/webconsole/backend/logger"
)

func SendNFRegistration() error {
	profile := models.NfProfile{
		NfInstanceId: GetSelf().NfInstanceID,
		NfType:       models.NfType_AF,
		NfStatus:     models.NfStatus_REGISTERED,
		CustomInfo: map[string]interface{}{
			"AfType": "webconsole",
		},
	}

	var nf models.NfProfile
	var res *http.Response
	var err error

	retryTime := 0
	for {
		nf, res, err = GetSelf().
			NFManagementClient.
			NFInstanceIDDocumentApi.
			RegisterNFInstance(context.TODO(), GetSelf().NfInstanceID, profile)
		if err != nil || res == nil {
			logger.ConsumerLog.Warnf("Webconsole-AF register to NRF Error[%s]", err.Error())
			time.Sleep(2 * time.Second)
			retryTime += 1
			if retryTime == 10 {
				return fmt.Errorf("NF Register retry failed %+v times.", retryTime)
			}
			continue
		}
		defer func() {
			if resCloseErr := res.Body.Close(); resCloseErr != nil {
				logger.ConsumerLog.Errorf("RegisterNFInstance response body cannot close: %+v", resCloseErr)
			}
		}()

		status := res.StatusCode
		if status == http.StatusOK {
			// NFUpdate
			break
		} else if status == http.StatusCreated {
			// NFRegister
			resourceUri := res.Header.Get("Location")
			GetSelf().NfInstanceID = resourceUri[strings.LastIndex(resourceUri, "/")+1:]

			oauth2 := false
			if nf.CustomInfo != nil {
				v, ok := nf.CustomInfo["oauth2"].(bool)
				if ok {
					oauth2 = v
					logger.MainLog.Infoln("OAuth2 setting receive from NRF:", oauth2)
				}
			}
			GetSelf().OAuth2Required = oauth2
			break
		} else {
			logger.ConsumerLog.Infof("handler returned wrong status code %d", status)
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

	ctx, pd, err := GetSelf().GetTokenCtx(models.ServiceName_NNRF_NFM, models.NfType_NRF)
	if err != nil {
		return pd, err
	}

	afSelf := GetSelf()

	res, err := afSelf.
		NFManagementClient.
		NFInstanceIDDocumentApi.
		DeregisterNFInstance(ctx, afSelf.NfInstanceID)
	if err == nil {
		return nil, err
	} else if res != nil {
		defer func() {
			if resCloseErr := res.Body.Close(); resCloseErr != nil {
				logger.ConsumerLog.Errorf("DeregisterNFInstance response body cannot close: %+v", resCloseErr)
			}
		}()
		if res.Status != err.Error() {
			return nil, err
		}
		problem := err.(openapi.GenericOpenAPIError).Model().(models.ProblemDetails)
		return &problem, err
	} else {
		return nil, openapi.ReportError("server no response")
	}
}
