package webui_context

import (
	"testing"

	"github.com/free5gc/openapi/models"
)

// The OAM URI must be a complete API root, also for an NF that registers its
// hostname as fqdn (free5gc/free5gc#1173).
func TestGetNfOamUri(t *testing.T) {
	const oam = models.Nrf_NFMgmt_ServiceName("namf-oam")
	service := func(s models.Nrf_NFDisc_NFService) []models.Nrf_NFDisc_NFService {
		s.ServiceName = oam
		s.NfServiceStatus = models.Nrf_NFMgmt_NFServiceStatus_REGISTERED
		s.Scheme = models.UriScheme_HTTP
		return []models.Nrf_NFDisc_NFService{s}
	}

	tests := []struct {
		name    string
		profile models.Nrf_NFDisc_NFProfile
		want    string
	}{
		{
			name: "FQDN",
			profile: models.Nrf_NFDisc_NFProfile{
				Fqdn: "amf.free5gc.org",
				NfServices: service(models.Nrf_NFDisc_NFService{
					Fqdn:        "amf.free5gc.org",
					IpEndPoints: []models.Nrf_NFMgmt_IpEndPoint{{Port: 8000}},
				}),
			},
			want: "http://amf.free5gc.org:8000",
		},
		{
			name: "IPv4",
			profile: models.Nrf_NFDisc_NFProfile{NfServices: service(models.Nrf_NFDisc_NFService{
				IpEndPoints: []models.Nrf_NFMgmt_IpEndPoint{{Ipv4Address: "10.0.0.18", Port: 8000}},
			})},
			want: "http://10.0.0.18:8000",
		},
		{
			name: "Legacy_absolute_apiPrefix",
			profile: models.Nrf_NFDisc_NFProfile{NfServices: service(models.Nrf_NFDisc_NFService{
				ApiPrefix: "http://amf.free5gc.org:8000",
			})},
			want: "http://amf.free5gc.org:8000",
		},
		{
			name:    "No_OAM_service",
			profile: models.Nrf_NFDisc_NFProfile{Fqdn: "amf.free5gc.org"},
			want:    "",
		},
	}

	for i := range tests {
		tt := &tests[i]
		t.Run(tt.name, func(t *testing.T) {
			if got := getNfOamUri(&tt.profile, oam); got != tt.want {
				t.Fatalf("getNfOamUri() = %q, want %q", got, tt.want)
			}
		})
	}
}
