package webui_context

import (
	"fmt"

	"github.com/free5gc/openapi/models"
	Nnrf_NFDiscovery "github.com/free5gc/openapi/nrf/NFDisc"
	"github.com/free5gc/webconsole/backend/logger"
)

type NfInstance struct {
	ValidityPeriod int                           `json:"validityPeriod"`
	NfInstances    []models.Nrf_NFDisc_NFProfile `json:"nfInstances"`
}

func SendSearchNFInstances(targetNfType models.Nrf_NFMgmt_NFType) ([]models.Nrf_NFDisc_NFProfile, error) {
	var nfProfiles []models.Nrf_NFDisc_NFProfile

	ctx, _, err := GetSelf().GetTokenCtx(models.Nrf_NFMgmt_ServiceName_NNRF_DISC, models.Nrf_NFMgmt_NFType_NRF)
	if err != nil {
		logger.ConsumerLog.Errorln(err.Error())
		return nfProfiles, err
	}

	client := GetSelf().NFDiscoveryClient
	requestNfType := models.Nrf_NFMgmt_NFType_AF

	req := &Nnrf_NFDiscovery.SearchNFInstancesRequest{
		TargetNfType:    &targetNfType,
		RequesterNfType: &requestNfType,
	}

	res, err := client.NFInstancesStoreApi.SearchNFInstances(ctx, req)
	if err != nil {
		logger.ConsumerLog.Errorf("SearchNFInstances failed: %+v", err)
		return nfProfiles, err
	}
	if res == nil || res.Nrf_NFDisc_SearchResult == nil {
		return nfProfiles, fmt.Errorf("SearchNFInstances resule nil:%+v", err)
	}
	nfProfiles = res.Nrf_NFDisc_SearchResult.NfInstances

	return nfProfiles, nil
}
