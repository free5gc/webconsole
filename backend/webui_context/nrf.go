package webui_context

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"io"
	"net/http"

	"github.com/free5gc/openapi/models"
	"github.com/free5gc/webconsole/backend/logger"
)

type NfInstance struct {
	ValidityPeriod int                `json:"validityPeriod"`
	NfInstances    []models.NfProfile `json:"nfInstances"`
}

func NrfGetNfProfiles(requestUri string) ([]models.NfProfile, error) {
	var nfProfiles []models.NfProfile

	httpsClient := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}

	req, err := http.NewRequestWithContext(context.Background(), http.MethodGet, requestUri, nil)
	if err != nil {
		return nfProfiles, err
	}
	resp, err := httpsClient.Do(req)
	if err != nil {
		return nfProfiles, err
	}
	defer func() {
		if closeErr := resp.Body.Close(); closeErr != nil {
			logger.CtxLog.Error(err)
		}
	}()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nfProfiles, err
	}

	var nfInstance NfInstance
	err = json.Unmarshal(body, &nfInstance)
	if err != nil {
		return nfProfiles, err
	}

	return nfInstance.NfInstances, nil
}
