package webui_context

import (
	"net/http"

	"github.com/free5gc/openapi/Nnrf_NFDiscovery"
	"github.com/free5gc/openapi/models"
	"github.com/free5gc/webconsole/backend/logger"
)

type NfInstance struct {
	ValidityPeriod int                `json:"validityPeriod"`
	NfInstances    []models.NfProfile `json:"nfInstances"`
}

func SendSearchNFInstances(targetNfType models.NfType) ([]models.NfProfile, error) {
	var nfProfiles []models.NfProfile

	ctx, _, err := GetSelf().GetTokenCtx(models.ServiceName_NNRF_DISC, models.NfType_NRF)
	if err != nil {
		logger.ConsumerLog.Errorln(err.Error())
		return nfProfiles, err
	}

	client := GetSelf().NFDiscoveryClient
	localVarOptionals := Nnrf_NFDiscovery.SearchNFInstancesParamOpts{}

	result, res, err := client.
		NFInstancesStoreApi.SearchNFInstances(ctx, targetNfType, models.NfType_AF, &localVarOptionals)
	if err != nil {
		logger.ConsumerLog.Errorf("SearchNFInstances failed: %+v", err)
	}
	defer func() {
		if res != nil {
			if resCloseErr := res.Body.Close(); resCloseErr != nil {
				logger.ConsumerLog.Errorf("NFInstancesStoreApi response body cannot close: %+v", resCloseErr)
			}
		}
	}()

	if res != nil && res.StatusCode == http.StatusTemporaryRedirect {
		logger.ConsumerLog.Errorln("Temporary Redirect For Non NRF Consumer")
		return nfProfiles, err
	}
	nfProfiles = result.NfInstances

	return nfProfiles, nil
}
