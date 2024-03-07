package webui_context

import (
	"fmt"

	"github.com/free5gc/openapi/Nnrf_NFManagement"
	"github.com/free5gc/openapi/models"
	"github.com/free5gc/webconsole/backend/billing"
	"github.com/free5gc/webconsole/backend/factory"
	"github.com/free5gc/webconsole/backend/logger"
	"github.com/google/uuid"
)

var webuiContext WEBUIContext

type WEBUIContext struct {
	NfInstanceID   string
	NFProfiles     []models.NfProfile
	NFOamInstances []NfOamInstance
	BillingServer  *billing.BillingDomain

	NrfUri             string
	NrfCertPem         string
	NFManagementClient *Nnrf_NFManagement.APIClient
	OAuth2Required     bool
}

type NfOamInstance struct {
	NfId   string
	NfType models.NfType
	Uri    string
}

func Init() {
	webuiContext.NfInstanceID = uuid.New().String()
	webuiContext.NrfUri = factory.WebuiConfig.Configuration.NrfUri
	webuiContext.NrfCertPem = factory.WebuiConfig.Configuration.NrfCertPem

	ManagementConfig := Nnrf_NFManagement.NewConfiguration()
	ManagementConfig.SetBasePath(GetSelf().NrfUri)
	webuiContext.NFManagementClient = Nnrf_NFManagement.NewAPIClient(ManagementConfig)
}

func NrfAmfUri() string {
	return GetSelf().NrfUri + "/nnrf-disc/v1/nf-instances?target-nf-type=AMF&requester-nf-type=AMF"
}

func NrfSmfUri() string {
	return GetSelf().NrfUri + "/nnrf-disc/v1/nf-instances?target-nf-type=SMF&requester-nf-type=AMF"
}

func (context *WEBUIContext) UpdateNfProfiles() {
	var nfProfiles []models.NfProfile

	nfProfiles, err := NrfGetNfProfiles(NrfAmfUri())
	if err != nil {
		logger.CtxLog.Error(err)
		return
	}
	context.NFProfiles = append(context.NFProfiles, nfProfiles...)

	nfProfiles, err = NrfGetNfProfiles(NrfSmfUri())
	if err != nil {
		logger.CtxLog.Error(err)
		return
	}
	context.NFProfiles = append(context.NFProfiles, nfProfiles...)

	for _, nfProfile := range context.NFProfiles {
		if nfProfile.NfServices == nil || context.NfProfileAlreadyExists(nfProfile) {
			continue
		}

		var uri string
		switch nfProfile.NfType {
		case models.NfType_AMF:
			uri = getNfOamUri(nfProfile, models.ServiceName("namf-oam"))
		case models.NfType_SMF:
			uri = getNfOamUri(nfProfile, models.ServiceName("nsmf-oam"))
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

func (context *WEBUIContext) NfProfileAlreadyExists(nfProfile models.NfProfile) bool {
	for _, instance := range context.NFOamInstances {
		if instance.NfId == nfProfile.NfInstanceId {
			return true
		}
	}
	return false
}

func getNfOamUri(nfProfile models.NfProfile, serviceName models.ServiceName) (nfOamUri string) {
	for _, service := range *nfProfile.NfServices {
		if service.ServiceName == serviceName && service.NfServiceStatus == models.NfServiceStatus_REGISTERED {
			if nfProfile.Fqdn != "" {
				nfOamUri = nfProfile.Fqdn
			} else if service.Fqdn != "" {
				nfOamUri = service.Fqdn
			} else if service.ApiPrefix != "" {
				nfOamUri = service.ApiPrefix
			} else if service.IpEndPoints != nil {
				point := (*service.IpEndPoints)[0]
				if point.Ipv4Address != "" {
					nfOamUri = getSbiUri(service.Scheme, point.Ipv4Address, point.Port)
				} else if len(nfProfile.Ipv4Addresses) != 0 {
					nfOamUri = getSbiUri(service.Scheme, nfProfile.Ipv4Addresses[0], point.Port)
				}
			}
		}
		if nfOamUri != "" {
			break
		}
	}
	return
}

func (context *WEBUIContext) GetOamUris(targetNfType models.NfType) (uris []string) {
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

func getSbiUri(scheme models.UriScheme, ipv4Address string, port int32) (uri string) {
	if port != 0 {
		uri = fmt.Sprintf("%s://%s:%d", scheme, ipv4Address, port)
	} else {
		switch scheme {
		case models.UriScheme_HTTP:
			uri = fmt.Sprintf("%s://%s:80", scheme, ipv4Address)
		case models.UriScheme_HTTPS:
			uri = fmt.Sprintf("%s://%s:443", scheme, ipv4Address)
		}
	}
	return
}
