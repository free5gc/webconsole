package webui_context

import (
	"context"
	"sync"

	"github.com/free5gc/openapi/models"
)

// nrfRegistrar adapts the webui context to nfheartbeat.Registrar. The NRF calls
// of this package are package level, so it carries no state of its own.
type nrfRegistrar struct{}

func (r nrfRegistrar) UpdateNFInstance(ctx context.Context, patchItems []models.PatchItem) (
	models.Nrf_NFMgmt_NFProfile, *models.ProblemDetails, error,
) {
	return SendUpdateNFInstance(ctx, patchItems)
}

func (r nrfRegistrar) RegisterNFInstance(ctx context.Context) (int32, error) {
	if err := SendNFRegistration(ctx, false); err != nil {
		return 0, err
	}
	// Written by processRegisterResponse on this goroutine.
	return GetSelf().heartbeatTimer, nil
}

// StartHeartbeat launches the periodic NF heartbeat toward the NRF.
// It must be called after a successful NF registration.
func StartHeartbeat(ctx context.Context, wg *sync.WaitGroup) {
	GetSelf().heartbeat.Start(ctx, wg, GetSelf().heartbeatTimer)
}

// WaitHeartbeatStopped blocks until the heartbeat goroutine exits, or returns at once if it never started.
func WaitHeartbeatStopped() {
	GetSelf().heartbeat.Wait()
}
