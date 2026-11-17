package factory_test

import (
	"testing"

	"github.com/asaskevich/govalidator"

	"github.com/free5gc/util/nfheartbeat"
	"github.com/free5gc/webconsole/backend/factory"
)

func TestGetNfHeartBeatTimer(t *testing.T) {
	tests := []struct {
		name string
		cfg  *factory.Config
		want int32
	}{
		{
			name: "no configuration section",
			cfg:  &factory.Config{},
			want: nfheartbeat.DefaultTimer,
		},
		{
			name: "option absent",
			cfg:  &factory.Config{Configuration: &factory.Configuration{}},
			want: nfheartbeat.DefaultTimer,
		},
		{
			name: "option set",
			cfg:  &factory.Config{Configuration: &factory.Configuration{NfHeartBeatTimer: 45}},
			want: 45,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := tt.cfg.GetNfHeartBeatTimer(); got != tt.want {
				t.Errorf("GetNfHeartBeatTimer() = %d, want %d", got, tt.want)
			}
		})
	}
}

func TestNfHeartBeatTimerRange(t *testing.T) {
	// The range(1|3600) struct tag cannot reference constants; keep it aligned
	// with the bounds the NRF profile validator enforces.
	if nfheartbeat.MinTimer != 1 || nfheartbeat.MaxTimer != 3600 {
		t.Fatalf("range(1|3600) tag out of sync with nfheartbeat bounds [%d, %d]",
			nfheartbeat.MinTimer, nfheartbeat.MaxTimer)
	}

	tests := []struct {
		name    string
		timer   int32
		wantErr bool
	}{
		{name: "absent is optional", timer: 0},
		{name: "lower bound", timer: nfheartbeat.MinTimer},
		{name: "upper bound of 1 hour", timer: nfheartbeat.MaxTimer},
		{name: "above the upper bound", timer: nfheartbeat.MaxTimer + 1, wantErr: true},
		{name: "negative", timer: -1, wantErr: true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := govalidator.ValidateStruct(&factory.Configuration{NfHeartBeatTimer: tt.timer})

			fieldErr := govalidator.ErrorByField(err, "NfHeartBeatTimer")
			if gotErr := fieldErr != ""; gotErr != tt.wantErr {
				t.Errorf("nfHeartBeatTimer %d: field error = %q, want error %v",
					tt.timer, fieldErr, tt.wantErr)
			}
		})
	}
}
