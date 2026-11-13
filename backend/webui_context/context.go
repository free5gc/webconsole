package webui_context

import (
	"context"
	"net/http"
	"sync/atomic"

	"golang.org/x/oauth2"

	"github.com/free5gc/openapi"
	"github.com/free5gc/openapi/models"
	Nnrf_NFDiscovery "github.com/free5gc/openapi/nrf/NFDisc"
	Nnrf_NFManagement "github.com/free5gc/openapi/nrf/NFMgmt"
	"github.com/free5gc/openapi/oauth"
	"github.com/free5gc/util/nfheartbeat"
	"github.com/free5gc/util/serviceuri"
	"github.com/free5gc/webconsole/backend/factory"
	"github.com/free5gc/webconsole/backend/logger"
)

var webuiContext WEBUIContext

type WEBUIContext struct {
	NfInstanceID   string
	NFProfiles     []models.Nrf_NFDisc_NFProfile
	NFOamInstances []NfOamInstance

	// is registered to NRF as AF
	IsRegistered bool

	NrfUri string
	// Set by the startup registration while UpdateNfProfiles and the handlers may already read it.
	OAuth2Required atomic.Bool

	NFManagementClient *Nnrf_NFManagement.APIClient
	NFDiscoveryClient  *Nnrf_NFDiscovery.APIClient

	heartbeat *nfheartbeat.Runner

	// Interval in seconds from the last registration response.
	// Written before the heartbeat starts, then only on its goroutine.
	heartbeatTimer int32
}

type NfOamInstance struct {
	NfId   string
	NfType models.Nrf_NFMgmt_NFType
	Uri    string
}

func Init() error {
	webuiContext.NfInstanceID = factory.WebuiConfig.GetNfInstanceId()
	webuiContext.NrfUri = factory.WebuiConfig.Configuration.NrfUri

	webuiContext.IsRegistered = false

	ManagementConfig := Nnrf_NFManagement.NewConfiguration()
	ManagementConfig.SetBasePath(GetSelf().NrfUri)
	webuiContext.NFManagementClient = Nnrf_NFManagement.NewAPIClient(ManagementConfig)

	NFDiscovryConfig := Nnrf_NFDiscovery.NewConfiguration()
	NFDiscovryConfig.SetBasePath(GetSelf().NrfUri)
	webuiContext.NFDiscoveryClient = Nnrf_NFDiscovery.NewAPIClient(NFDiscovryConfig)

	heartbeat, err := nfheartbeat.NewRunner(
		nrfRegistrar{},
		func() int32 { return factory.WebuiConfig.GetNfHeartBeatTimer() },
		logger.ConsumerLog,
	)
	if err != nil {
		return err
	}
	webuiContext.heartbeat = heartbeat

	return nil
}

func (context *WEBUIContext) UpdateNfProfiles() {
	var nfProfiles []models.Nrf_NFDisc_NFProfile

	nfProfiles, err := SendSearchNFInstances(models.Nrf_NFMgmt_NFType_AMF)
	if err != nil {
		logger.CtxLog.Error(err)
		return
	}
	context.NFProfiles = append(context.NFProfiles, nfProfiles...)

	nfProfiles, err = SendSearchNFInstances(models.Nrf_NFMgmt_NFType_SMF)
	if err != nil {
		logger.CtxLog.Error(err)
		return
	}
	context.NFProfiles = append(context.NFProfiles, nfProfiles...)

	for idx := 0; idx < len(context.NFProfiles); idx++ {
		nfProfile := &context.NFProfiles[idx]

		if nfProfile.NfServices == nil || context.NfProfileAlreadyExists(nfProfile) {
			continue
		}

		var uri string
		switch nfProfile.NfType {
		case models.Nrf_NFMgmt_NFType_AMF:
			uri = getNfOamUri(nfProfile, models.Nrf_NFMgmt_ServiceName("namf-oam"))
		case models.Nrf_NFMgmt_NFType_SMF:
			uri = getNfOamUri(nfProfile, models.Nrf_NFMgmt_ServiceName("nsmf-oam"))
		}
		if uri != "" {
			context.NFOamInstances = append(context.NFOamInstances, NfOamInstance{
				NfId:   nfProfile.NfInstanceId,
				NfType: nfProfile.NfType,
				Uri:    uri,
			})
		}
	}
}

func (context *WEBUIContext) NfProfileAlreadyExists(nfProfile *models.Nrf_NFDisc_NFProfile) bool {
	for _, instance := range context.NFOamInstances {
		if instance.NfId == nfProfile.NfInstanceId {
			return true
		}
	}
	return false
}

// getNfOamUri returns the API root of the OAM service in nfProfile, or "".
func getNfOamUri(nfProfile *models.Nrf_NFDisc_NFProfile, serviceName models.Nrf_NFMgmt_ServiceName) string {
	// NFs that still register a full URL as apiPrefix remain reachable.
	uri, err := serviceuri.ResolveNFServiceURI(nfProfile, serviceName,
		serviceuri.Options{AllowLegacyAbsoluteAPIPrefix: true})
	if err != nil {
		logger.CtxLog.Warnf("NF service %s API root resolution failed: %v", serviceName, err)
		return ""
	}
	return uri
}

func (context *WEBUIContext) GetOamUris(targetNfType models.Nrf_NFMgmt_NFType) (uris []string) {
	for _, oamInstance := range context.NFOamInstances {
		if oamInstance.NfType == targetNfType {
			uris = append(uris, oamInstance.Uri)
			break
		}
	}
	return
}

func GetSelf() *WEBUIContext {
	return &webuiContext
}

func (c *WEBUIContext) GetTokenCtx(
	serviceName models.Nrf_NFMgmt_ServiceName,
	targetNF models.Nrf_NFMgmt_NFType,
) (
	context.Context, *models.ProblemDetails, error,
) {
	if !c.OAuth2Required.Load() {
		return context.TODO(), nil, nil
	}

	logger.ConsumerLog.Debugln("GetTokenCtx:", targetNF, serviceName)

	return oauth.GetTokenCtx(oauth.TokenRequest{
		ConsumerNFType:       models.Nrf_NFMgmt_NFType_AF,
		ConsumerNFInstanceID: c.NfInstanceID,
		TargetNFType:         targetNF,
		NRFURI:               c.NrfUri,
		Scope:                string(serviceName),
	})
}

// NewRequestWithContext() will not apply header in ctx
// so httpsClient.Do(req) will not have token in header if OAuth2 enable
func (c *WEBUIContext) RequestBindToken(req *http.Request, ctx context.Context) error {
	if tok, ok := ctx.Value(openapi.ContextOAuth2).(oauth2.TokenSource); ok {
		// We were able to grab an oauth2 token from the context
		var latestToken *oauth2.Token
		var err error
		if latestToken, err = tok.Token(); err != nil {
			logger.ConsumerLog.Error(err)
			return err
		}
		latestToken.SetAuthHeader(req)
	}
	return nil
}
