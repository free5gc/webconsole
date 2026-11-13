package webui_context

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"sync/atomic"

	"github.com/google/uuid"
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

// NF instance IDs are UUID version 4 (TS 29.571 NfInstanceId).
const nfInstanceIDUUIDVersion = 4

type WEBUIContext struct {
	NfInstanceID   string
	NFProfiles     []models.Nrf_NFDisc_NFProfile
	NFOamInstances []NfOamInstance

	// is registered to NRF as AF
	IsRegistered bool

	NrfUri     string
	NrfCertPem string
	// NrfNfInstanceID is derived from the NRF certificate URI SAN when OAuth2 is enabled.
	// It is written before OAuth2Required is stored as true and only read after loading true.
	NrfNfInstanceID string
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
	webuiContext.NrfCertPem = factory.WebuiConfig.Configuration.NrfCertPem

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

	return oauth.GetTokenCtx(c.tokenRequest(serviceName, targetNF))
}

// GetTokenCtxForNFInstance requests a token whose audience is the given NF instance.
func (c *WEBUIContext) GetTokenCtxForNFInstance(serviceName models.Nrf_NFMgmt_ServiceName,
	targetNF models.Nrf_NFMgmt_NFType, targetNFInstanceID string,
) (context.Context, *models.ProblemDetails, error) {
	if !c.OAuth2Required.Load() {
		return context.TODO(), nil, nil
	}
	targetID, err := uuid.Parse(strings.TrimSpace(targetNFInstanceID))
	if err != nil {
		return nil, nil, fmt.Errorf("invalid target NF instance ID: %w", err)
	}
	if targetID.Version() != nfInstanceIDUUIDVersion {
		return nil, nil, fmt.Errorf("invalid target NF instance ID: UUID must be version 4")
	}
	return oauth.GetTokenCtx(c.tokenRequestForNFInstance(serviceName, targetNF, targetNFInstanceID))
}

// GetTokenCtxForNRF requests a token whose audience is the trusted NRF instance.
func (c *WEBUIContext) GetTokenCtxForNRF(serviceName models.Nrf_NFMgmt_ServiceName) (
	context.Context, *models.ProblemDetails, error,
) {
	// Load OAuth2Required before NrfNfInstanceID: the startup registration may
	// still be writing the ID, and only a true Load orders that write before us.
	if !c.OAuth2Required.Load() {
		return context.TODO(), nil, nil
	}
	return c.GetTokenCtxForNFInstance(serviceName, models.Nrf_NFMgmt_NFType_NRF, c.NrfNfInstanceID)
}

func (c *WEBUIContext) tokenRequest(serviceName models.Nrf_NFMgmt_ServiceName,
	targetNF models.Nrf_NFMgmt_NFType,
) oauth.TokenRequest {
	return oauth.TokenRequest{
		ConsumerNFType:       models.Nrf_NFMgmt_NFType_AF,
		ConsumerNFInstanceID: c.NfInstanceID,
		TargetNFType:         targetNF,
		NRFURI:               c.NrfUri,
		Scope:                string(serviceName),
	}
}

func (c *WEBUIContext) tokenRequestForNFInstance(serviceName models.Nrf_NFMgmt_ServiceName,
	targetNF models.Nrf_NFMgmt_NFType, targetNFInstanceID string,
) oauth.TokenRequest {
	request := c.tokenRequest(serviceName, targetNF)
	request.TargetNFInstanceID = targetNFInstanceID
	return request
}

// SetOAuth2Required applies the NRF OAuth2 setting. Enabling it requires the NRF
// certificate and URI, and derives the trusted NRF instance ID from the certificate.
func (c *WEBUIContext) SetOAuth2Required(required bool) error {
	if !required {
		c.OAuth2Required.Store(false)
		c.NrfNfInstanceID = ""
		return nil
	}
	if strings.TrimSpace(c.NrfCertPem) == "" {
		return fmt.Errorf("OAuth2 enabled but NRF certificate path is empty")
	}
	if strings.TrimSpace(c.NrfUri) == "" {
		return fmt.Errorf("OAuth2 enabled but NRF URI is empty")
	}
	nrfNfInstanceID, err := oauth.NFInstanceIDFromCertificate(c.NrfCertPem)
	if err != nil {
		return fmt.Errorf("derive trusted NRF instance ID from certificate: %w", err)
	}
	c.NrfNfInstanceID = nrfNfInstanceID
	c.OAuth2Required.Store(true)
	return nil
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
