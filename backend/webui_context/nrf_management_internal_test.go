package webui_context

import (
	"context"
	"errors"
	"net/http"
	"testing"
	"testing/synctest"
	"time"

	"github.com/h2non/gock"

	"github.com/free5gc/openapi"
	"github.com/free5gc/openapi/models"
	"github.com/free5gc/util/nfheartbeat"
	"github.com/free5gc/webconsole/backend/factory"
)

const (
	testNrfUri   = "http://127.0.0.10:8000"
	testNfId     = "6ba7b810-9dad-41d1-80b4-00c04fd430c8"
	testNfIdPath = "/nnrf-nfm/v1/nf-instances/" + testNfId

	causeNotFound      = "RESOURCE_URI_STRUCTURE_NOT_FOUND"
	causeSystemFailure = "SYSTEM_FAILURE"

	// testDeadline bounds calls that may reach a retry loop, decoupled from
	// RetryInterval so tuning production timing cannot break tests.
	testDeadline = 2 * time.Second
)

// newTestContext points the package globals at a test configuration and resets
// them afterwards. The NRF calls of this package read those globals directly, so
// the test has to own them rather than pass a context around.
func newTestContext(t *testing.T, nrfUri string) {
	t.Helper()

	savedConfig := factory.WebuiConfig
	t.Cleanup(func() {
		// A zero value rather than a saved copy: the context holds atomics, which must not be copied.
		factory.WebuiConfig, webuiContext = savedConfig, WEBUIContext{}
	})

	factory.WebuiConfig = &factory.Config{
		Configuration: &factory.Configuration{
			NfInstanceId: testNfId,
			NrfUri:       nrfUri,
		},
	}
	if err := Init(); err != nil {
		t.Fatalf("Init: %v", err)
	}
}

// newNrfTestContext is newTestContext with the openapi cleartext HTTP/2 client
// intercepted by gock.
func newNrfTestContext(t *testing.T) {
	t.Helper()

	newTestContext(t, testNrfUri)

	openapi.InterceptInnerHttp2Client(t, false)
	t.Cleanup(func() {
		gock.OffAll()
	})
}

// testCtx bounds every call that may reach the SendNFRegistration retry loop, so
// that an unmatched mock fails the test instead of retrying forever.
func testCtx(t *testing.T) context.Context {
	t.Helper()

	ctx, cancel := context.WithTimeout(t.Context(), testDeadline)
	t.Cleanup(cancel)
	return ctx
}

// synctestCtx is testCtx for synctest bubbles: the deadline is fake time, so a minute costs nothing and does not
// tie with the retry interval, yet a mock mismatch still fails fast instead of spinning until the test timeout.
func synctestCtx(t *testing.T) context.Context {
	t.Helper()

	ctx, cancel := context.WithTimeout(t.Context(), time.Minute)
	t.Cleanup(cancel)
	return ctx
}

// nfProfileJSON is an NRF NF profile reply body. It omits heartBeatTimer when
// timer is 0 and customInfo when it is nil.
func nfProfileJSON(timer int32, customInfo map[string]any) map[string]any {
	body := map[string]any{
		"nfInstanceId": testNfId,
		"nfType":       "AF",
		"nfStatus":     "REGISTERED",
	}
	if timer > 0 {
		body["heartBeatTimer"] = timer
	}
	if customInfo != nil {
		body["customInfo"] = customInfo
	}
	return body
}

func problemJSON(status int, cause string) map[string]any {
	return map[string]any{"status": status, "cause": cause}
}

func TestSendUpdateNFInstance(t *testing.T) {
	tests := []struct {
		name      string
		status    int
		body      map[string]any
		wantTimer int32
		wantErr   bool
	}{
		{
			name:      "200 returns the updated profile",
			status:    http.StatusOK,
			body:      nfProfileJSON(20, nil),
			wantTimer: 20,
		},
		{
			name:   "204 returns an empty profile",
			status: http.StatusNoContent,
		},
		{
			name:    "404 reports the unknown profile",
			status:  http.StatusNotFound,
			body:    problemJSON(http.StatusNotFound, causeNotFound),
			wantErr: true,
		},
		{
			name:    "500 reports the NRF failure",
			status:  http.StatusInternalServerError,
			body:    problemJSON(http.StatusInternalServerError, causeSystemFailure),
			wantErr: true,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			newNrfTestContext(t)

			reply := gock.New(testNrfUri).
				Patch(testNfIdPath).
				MatchHeader("Content-Type", "application/json-patch+json").
				JSON([]map[string]any{
					{"op": "replace", "path": "/nfStatus", "value": "REGISTERED"},
				}).
				Reply(tt.status)
			if tt.body != nil {
				reply.JSON(tt.body)
			}

			nf, pd, err := SendUpdateNFInstance(t.Context(), nfheartbeat.PatchItems())

			if !gock.IsDone() {
				t.Fatal("the heartbeat PATCH was not sent as expected")
			}
			if !tt.wantErr {
				if err != nil {
					t.Fatalf("SendUpdateNFInstance: pd=%+v err=%v", pd, err)
				}
				if nf.HeartBeatTimer != tt.wantTimer {
					t.Errorf("HeartBeatTimer = %d, want %d", nf.HeartBeatTimer, tt.wantTimer)
				}
				return
			}

			var apiErr openapi.GenericOpenAPIError
			if !errors.As(err, &apiErr) {
				t.Fatalf("err = %T (%v), want openapi.GenericOpenAPIError", err, err)
			}
			if apiErr.ErrorStatus != tt.status {
				t.Errorf("ErrorStatus = %d, want %d", apiErr.ErrorStatus, tt.status)
			}
			if pd == nil || pd.Status != int32(tt.status) {
				t.Errorf("ProblemDetails = %+v, want status %d", pd, tt.status)
			}
		})
	}
}

// TestSendUpdateNFInstanceTimesOut proves a stalled NRF cannot hold the PATCH past
// heartbeatRequestTimeout, well inside the 10s the shared openapi client allows.
func TestSendUpdateNFInstanceTimesOut(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		newNrfTestContext(t)

		gock.New(testNrfUri).
			Patch(testNfIdPath).
			Reply(http.StatusNoContent).
			Delay(5 * time.Second)

		start := time.Now()
		_, _, err := SendUpdateNFInstance(t.Context(), nfheartbeat.PatchItems())
		if !errors.Is(err, context.DeadlineExceeded) {
			t.Fatalf("err = %v, want context.DeadlineExceeded", err)
		}
		if elapsed := time.Since(start); elapsed != heartbeatRequestTimeout {
			t.Errorf("PATCH gave up after %v, want %v", elapsed, heartbeatRequestTimeout)
		}
	})
}

func TestSendUpdateNFInstanceRejectsEmptyNrfUri(t *testing.T) {
	newTestContext(t, "")

	if _, _, err := SendUpdateNFInstance(t.Context(), nfheartbeat.PatchItems()); err == nil {
		t.Error("SendUpdateNFInstance must fail when no NRF URI is configured")
	}
}

func TestSendDeregisterNFInstance(t *testing.T) {
	tests := []struct {
		name       string
		status     int
		body       map[string]any
		wantErr    bool
		wantDetail bool
	}{
		{
			name:   "204 deregisters the profile",
			status: http.StatusNoContent,
		},
		{
			name:       "404 reports the unknown profile",
			status:     http.StatusNotFound,
			body:       problemJSON(http.StatusNotFound, causeNotFound),
			wantErr:    true,
			wantDetail: true,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			newNrfTestContext(t)

			reply := gock.New(testNrfUri).
				Delete(testNfIdPath).
				Reply(tt.status)
			if tt.body != nil {
				reply.JSON(tt.body)
			}

			pd, err := SendDeregisterNFInstance()

			if !gock.IsDone() {
				t.Fatal("the deregistration DELETE was not sent as expected")
			}
			if gotErr := err != nil; gotErr != tt.wantErr {
				t.Errorf("SendDeregisterNFInstance err = %v, want error %v", err, tt.wantErr)
			}
			if gotDetail := pd != nil; gotDetail != tt.wantDetail {
				t.Errorf("ProblemDetails = %+v, want detail %v", pd, tt.wantDetail)
			}
			if tt.wantDetail && pd.Status != int32(tt.status) {
				t.Errorf("ProblemDetails.Status = %d, want %d", pd.Status, tt.status)
			}
		})
	}
}

// TestSendNFRegistrationRetriesUntilSuccess drives the retry loop: the first
// PUT fails on the NRF, the retry one interval later succeeds.
func TestSendNFRegistrationRetriesUntilSuccess(t *testing.T) {
	const assignedTimer = 15

	synctest.Test(t, func(t *testing.T) {
		newNrfTestContext(t)

		gock.New(testNrfUri).
			Put(testNfIdPath).
			Reply(http.StatusInternalServerError).
			JSON(problemJSON(http.StatusInternalServerError, causeSystemFailure))
		gock.New(testNrfUri).
			Put(testNfIdPath).
			Reply(http.StatusCreated).
			JSON(nfProfileJSON(assignedTimer, nil))

		if err := SendNFRegistration(t.Context(), false); err != nil {
			t.Fatalf("SendNFRegistration: %v", err)
		}
		if !gock.IsDone() {
			t.Fatal("expected a failed PUT followed by a successful retry")
		}
		if GetSelf().heartbeatTimer != assignedTimer {
			t.Errorf("heartbeatTimer = %d, want %d from the retry", GetSelf().heartbeatTimer, assignedTimer)
		}
	})
}

// TestSendNFRegistrationStopsOnCancel proves the retry loop gives up once the
// context is done, mid retry pause, instead of running to the attempt limit.
func TestSendNFRegistrationStopsOnCancel(t *testing.T) {
	const deadline = 3 * time.Second

	synctest.Test(t, func(t *testing.T) {
		newNrfTestContext(t)

		gock.New(testNrfUri).
			Put(testNfIdPath).
			Persist().
			Reply(http.StatusInternalServerError).
			JSON(problemJSON(http.StatusInternalServerError, causeSystemFailure))

		ctx, cancel := context.WithTimeout(t.Context(), deadline)
		defer cancel()

		start := time.Now()
		err := SendNFRegistration(ctx, false)
		if !errors.Is(err, context.DeadlineExceeded) {
			t.Fatalf("err = %v, want context.DeadlineExceeded", err)
		}
		if elapsed := time.Since(start); elapsed != deadline {
			t.Errorf("gave up after %v, want %v", elapsed, deadline)
		}
	})
}

// TestSendNFRegistrationGivesUp proves the attempt limit bounds a re-registration
// when the context stays alive, without a retry pause after the last attempt.
func TestSendNFRegistrationGivesUp(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		newNrfTestContext(t)

		gock.New(testNrfUri).
			Put(testNfIdPath).
			Persist().
			Reply(http.StatusInternalServerError).
			JSON(problemJSON(http.StatusInternalServerError, causeSystemFailure))

		start := time.Now()
		if err := SendNFRegistration(t.Context(), false); err == nil {
			t.Fatal("SendNFRegistration must report the exhausted attempt limit")
		}
		if elapsed, want := time.Since(start), (MaxRetryAttempts-1)*RetryInterval; elapsed != want {
			t.Errorf("gave up after %v, want %v", elapsed, want)
		}
	})
}

// TestSendNFRegistrationStartupOutlastsLimit proves the startup registration keeps
// retrying past MaxRetryAttempts, so an NRF that comes up late still gets the AF.
func TestSendNFRegistrationStartupOutlastsLimit(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		newNrfTestContext(t)

		gock.New(testNrfUri).
			Put(testNfIdPath).
			Times(MaxRetryAttempts).
			Reply(http.StatusInternalServerError).
			JSON(problemJSON(http.StatusInternalServerError, causeSystemFailure))
		gock.New(testNrfUri).
			Put(testNfIdPath).
			Reply(http.StatusCreated).
			JSON(nfProfileJSON(0, nil))

		if err := SendNFRegistration(synctestCtx(t), true); err != nil {
			t.Fatalf("SendNFRegistration: %v", err)
		}
		if !gock.IsDone() {
			t.Fatal("expected MaxRetryAttempts failed PUTs followed by a successful one")
		}
	})
}

func TestSendNFRegistration(t *testing.T) {
	tests := []struct {
		name       string
		status     int
		body       map[string]any
		startup    bool
		wantTimer  int32
		wantOAuth2 bool
	}{
		{
			name:       "201 adopts the returned timer",
			status:     http.StatusCreated,
			body:       nfProfileJSON(15, map[string]any{"oauth2": true}),
			startup:    true,
			wantTimer:  15,
			wantOAuth2: true,
		},
		{
			name:      "200 on an existing profile adopts the returned timer",
			status:    http.StatusOK,
			body:      nfProfileJSON(25, nil),
			wantTimer: 25,
		},
		{
			name:       "re-registration leaves the oauth2 setting untouched",
			status:     http.StatusCreated,
			body:       nfProfileJSON(0, map[string]any{"oauth2": true}),
			startup:    false,
			wantOAuth2: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			newNrfTestContext(t)

			gock.New(testNrfUri).
				Put(testNfIdPath).
				Reply(tt.status).
				JSON(tt.body)

			if err := SendNFRegistration(testCtx(t), tt.startup); err != nil {
				t.Fatalf("SendNFRegistration: %v", err)
			}
			if !gock.IsDone() {
				t.Fatal("the registration PUT was not sent as expected")
			}
			if GetSelf().heartbeatTimer != tt.wantTimer {
				t.Errorf("heartbeatTimer = %d, want %d", GetSelf().heartbeatTimer, tt.wantTimer)
			}
			if got := GetSelf().OAuth2Required.Load(); got != tt.wantOAuth2 {
				t.Errorf("OAuth2Required = %v, want %v", got, tt.wantOAuth2)
			}
			// The webconsole keeps the instance ID it chose, whatever the NRF echoes back.
			if got := GetSelf().NfInstanceID; got != testNfId {
				t.Errorf("NfInstanceID = %q, want %q", got, testNfId)
			}
		})
	}
}

// TestStartupRegistrationAlongsideTokenLookup is for -race: the startup registration
// writes OAuth2Required while UpdateNfProfiles and the handlers read it.
func TestStartupRegistrationAlongsideTokenLookup(t *testing.T) {
	newNrfTestContext(t)

	gock.New(testNrfUri).
		Put(testNfIdPath).
		Reply(http.StatusCreated).
		JSON(nfProfileJSON(0, nil))

	ctx := testCtx(t)
	registered := make(chan error, 1)
	go func() {
		registered <- SendNFRegistration(ctx, true)
	}()

	_, _, err := GetSelf().GetTokenCtx(models.Nrf_NFMgmt_ServiceName_NNRF_DISC, models.Nrf_NFMgmt_NFType_NRF)
	if err != nil {
		t.Errorf("GetTokenCtx: %v", err)
	}
	if err = <-registered; err != nil {
		t.Fatalf("SendNFRegistration: %v", err)
	}
}
