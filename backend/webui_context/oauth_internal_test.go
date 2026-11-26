package webui_context

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/x509"
	"encoding/pem"
	"math/big"
	"net/url"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/google/uuid"

	"github.com/free5gc/openapi/models"
)

// writeNrfCert writes a self-signed NRF certificate whose URI SAN carries
// nrfID, the way the NRF identifies itself, and returns its path.
func writeNrfCert(t *testing.T, nrfID string) string {
	t.Helper()

	key, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		t.Fatal(err)
	}
	identity, err := url.Parse("urn:uuid:" + nrfID)
	if err != nil {
		t.Fatal(err)
	}
	cert := &x509.Certificate{
		SerialNumber: big.NewInt(1),
		NotBefore:    time.Now().Add(-time.Hour),
		NotAfter:     time.Now().Add(time.Hour),
		URIs:         []*url.URL{identity},
		KeyUsage:     x509.KeyUsageDigitalSignature,
	}
	der, err := x509.CreateCertificate(rand.Reader, cert, cert, &key.PublicKey, key)
	if err != nil {
		t.Fatal(err)
	}
	certPath := filepath.Join(t.TempDir(), "nrf.pem")
	if err = os.WriteFile(certPath, pem.EncodeToMemory(&pem.Block{Type: "CERTIFICATE", Bytes: der}), 0o600); err != nil {
		t.Fatal(err)
	}
	return certPath
}

func TestSetOAuth2Required(t *testing.T) {
	nrfID := uuid.NewString()

	t.Run("enabling derives the NRF instance ID from the certificate", func(t *testing.T) {
		c := &WEBUIContext{NrfUri: testNrfUri, NrfCertPem: writeNrfCert(t, nrfID)}
		if err := c.SetOAuth2Required(true); err != nil {
			t.Fatalf("SetOAuth2Required(true): %v", err)
		}
		if !c.OAuth2Required.Load() {
			t.Error("OAuth2Required = false, want true")
		}
		if c.NrfNfInstanceID != nrfID {
			t.Errorf("NrfNfInstanceID = %q, want %q", c.NrfNfInstanceID, nrfID)
		}

		if err := c.SetOAuth2Required(false); err != nil {
			t.Fatalf("SetOAuth2Required(false): %v", err)
		}
		if c.OAuth2Required.Load() || c.NrfNfInstanceID != "" {
			t.Errorf("disabling left OAuth2Required=%v NrfNfInstanceID=%q", c.OAuth2Required.Load(), c.NrfNfInstanceID)
		}
	})

	for name, c := range map[string]*WEBUIContext{
		"missing NRF certificate": {NrfUri: testNrfUri},
		"missing NRF URI":         {NrfCertPem: writeNrfCert(t, nrfID)},
		"unreadable certificate":  {NrfUri: testNrfUri, NrfCertPem: filepath.Join(t.TempDir(), "absent.pem")},
	} {
		t.Run(name, func(t *testing.T) {
			if err := c.SetOAuth2Required(true); err == nil {
				t.Fatal("SetOAuth2Required(true) must fail")
			}
			if c.OAuth2Required.Load() {
				t.Error("a failed SetOAuth2Required must leave OAuth2 disabled")
			}
		})
	}
}

func TestGetTokenCtxForNFInstance(t *testing.T) {
	c := &WEBUIContext{NrfUri: testNrfUri, NfInstanceID: testNfId}

	// Disabled OAuth2 never reaches the NRF, whatever the target.
	if _, _, err := c.GetTokenCtxForNRF(models.Nrf_NFMgmt_ServiceName_NNRF_NFM); err != nil {
		t.Fatalf("GetTokenCtxForNRF without OAuth2: %v", err)
	}

	c.OAuth2Required.Store(true)
	for _, target := range []string{"", "not-a-uuid", "6ba7b810-9dad-11d1-80b4-00c04fd430c8"} {
		if _, _, err := c.GetTokenCtxForNFInstance(
			models.Nrf_NFMgmt_ServiceName_NNRF_NFM, models.Nrf_NFMgmt_NFType_NRF, target,
		); err == nil {
			t.Errorf("GetTokenCtxForNFInstance(%q) must reject a non-UUIDv4 target", target)
		}
	}

	request := c.tokenRequestForNFInstance(
		models.Nrf_NFMgmt_ServiceName_NNRF_NFM, models.Nrf_NFMgmt_NFType_NRF, testNfId)
	if request.TargetNFInstanceID != testNfId || request.ConsumerNFType != models.Nrf_NFMgmt_NFType_AF ||
		request.ConsumerNFInstanceID != testNfId || request.Scope != string(models.Nrf_NFMgmt_ServiceName_NNRF_NFM) {
		t.Errorf("unexpected token request %+v", request)
	}
}
