package webui_context

import (
	"context"
	"net/http"
	"sync"
	"testing"
	"testing/synctest"
	"time"

	"github.com/h2non/gock"

	"github.com/free5gc/webconsole/backend/factory"
)

// TestHeartbeatWiring drives the runner through the real transport: the
// registration seeds the timer, the loop sends the PATCH and adopts the interval
// it answers, and shutdown waits for the heartbeat goroutine. The runner's own
// behavior is covered in the util nfheartbeat package.
func TestHeartbeatWiring(t *testing.T) {
	// The NRF assigns registerTimer at registration time and answers the first
	// heartbeat with adoptedTimer.
	const (
		registerTimer = 1
		adoptedTimer  = 2
	)

	synctest.Test(t, func(t *testing.T) {
		newNrfTestContext(t)

		gock.New(testNrfUri).
			Put(testNfIdPath).
			Reply(http.StatusCreated).
			JSON(nfProfileJSON(registerTimer, nil))
		gock.New(testNrfUri).
			Patch(testNfIdPath).
			Reply(http.StatusOK).
			JSON(nfProfileJSON(adoptedTimer, nil))
		gock.New(testNrfUri).
			Patch(testNfIdPath).
			Reply(http.StatusNoContent)

		ctx, cancel := context.WithCancel(synctestCtx(t))
		if err := SendNFRegistration(ctx, true); err != nil {
			t.Fatalf("SendNFRegistration: %v", err)
		}

		var wg sync.WaitGroup
		StartHeartbeat(ctx, &wg)

		// Fake clock: Sleep jumps to the tick, then synctest.Wait returns once the loop has served it.
		time.Sleep(registerTimer * time.Second)
		synctest.Wait()
		if len(gock.Pending()) != 1 {
			t.Fatal("the heartbeat loop sent no PATCH")
		}

		// One registration interval later nothing may fire: the adopted one is longer.
		time.Sleep(registerTimer * time.Second)
		synctest.Wait()
		if gock.IsDone() {
			t.Fatal("the loop kept the registration interval after the PATCH answer")
		}

		time.Sleep((adoptedTimer - registerTimer) * time.Second)
		synctest.Wait()
		if !gock.IsDone() {
			t.Fatal("the second PATCH did not land on the adopted interval")
		}

		cancel()
		waitHeartbeatStopped(t)
		wg.Wait()
	})
}

// TestHeartbeatReregistersOnNotFound drives the 404 handshake through the real
// transport: the PATCH answers 404, the adapter re-registers with a PUT, and
// the next heartbeat fires on the interval the re-registration returned.
func TestHeartbeatReregistersOnNotFound(t *testing.T) {
	const (
		initialTimer    = 1
		reregisterTimer = 2
	)

	synctest.Test(t, func(t *testing.T) {
		newNrfTestContext(t)
		GetSelf().heartbeatTimer = initialTimer

		gock.New(testNrfUri).
			Patch(testNfIdPath).
			Reply(http.StatusNotFound).
			JSON(problemJSON(http.StatusNotFound, causeNotFound))
		gock.New(testNrfUri).
			Put(testNfIdPath).
			Reply(http.StatusOK).
			JSON(nfProfileJSON(reregisterTimer, nil))
		gock.New(testNrfUri).
			Patch(testNfIdPath).
			Reply(http.StatusNoContent)

		var wg sync.WaitGroup
		ctx, cancel := context.WithCancel(t.Context())
		StartHeartbeat(ctx, &wg)

		// t=1s: 404 PATCH, then a PUT answered with reregisterTimer. t=2s: no PATCH. t=3s: follow-up PATCH.
		time.Sleep(initialTimer * time.Second)
		synctest.Wait()

		time.Sleep(initialTimer * time.Second)
		synctest.Wait()
		if gock.IsDone() {
			t.Fatal("the loop kept the old interval after re-registration")
		}

		time.Sleep((reregisterTimer - initialTimer) * time.Second)
		synctest.Wait()
		if !gock.IsDone() {
			t.Fatal("expected 404 PATCH, re-registration PUT and follow-up PATCH")
		}

		cancel()
		waitHeartbeatStopped(t)
		wg.Wait()
	})
}

// TestHeartbeatFallbackInterval proves the wiring of the config fallback: the
// NRF assigns no timer, so the loop must tick at the configured interval.
func TestHeartbeatFallbackInterval(t *testing.T) {
	const configTimer = 45

	synctest.Test(t, func(t *testing.T) {
		newNrfTestContext(t)
		factory.WebuiConfig.Configuration.NfHeartBeatTimer = configTimer

		gock.New(testNrfUri).
			Put(testNfIdPath).
			Reply(http.StatusOK).
			JSON(nfProfileJSON(0, nil))
		gock.New(testNrfUri).
			Patch(testNfIdPath).
			Reply(http.StatusNoContent)

		ctx, cancel := context.WithCancel(synctestCtx(t))
		if err := SendNFRegistration(ctx, true); err != nil {
			t.Fatalf("SendNFRegistration: %v", err)
		}

		var wg sync.WaitGroup
		StartHeartbeat(ctx, &wg)

		// One second short of the configured interval nothing may fire; a
		// loop running on the default interval would already have PATCHed.
		time.Sleep((configTimer - 1) * time.Second)
		synctest.Wait()
		if gock.IsDone() {
			t.Fatal("the heartbeat fired before the configured fallback interval")
		}

		time.Sleep(1 * time.Second)
		synctest.Wait()
		if !gock.IsDone() {
			t.Fatal("the heartbeat loop did not tick at the configured fallback interval")
		}

		cancel()
		waitHeartbeatStopped(t)
		wg.Wait()
	})
}

// waitHeartbeatStopped fails the test if WaitHeartbeatStopped still blocks once the
// synctest bubble is idle, so a stuck heartbeat fails at once instead of timing out.
func waitHeartbeatStopped(t *testing.T) {
	t.Helper()

	stopped := make(chan struct{})
	go func() {
		WaitHeartbeatStopped()
		close(stopped)
	}()

	synctest.Wait()
	select {
	case <-stopped:
	default:
		t.Fatal("WaitHeartbeatStopped did not return")
	}
}
