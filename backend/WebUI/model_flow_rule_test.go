package WebUI_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin/binding"
	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/bson"

	"github.com/free5gc/webconsole/backend/WebUI"
)

func TestFlowDirectionBinding(t *testing.T) {
	for _, tc := range []struct {
		name    string
		field   string
		invalid bool
	}{
		{name: "missing"},
		{name: "empty", field: `,"flowDirection":""`},
		{name: "downlink", field: `,"flowDirection":"DOWNLINK"`},
		{name: "uplink", field: `,"flowDirection":"UPLINK"`},
		{name: "bidirectional", field: `,"flowDirection":"BIDIRECTIONAL"`},
		{name: "unsupported", field: `,"flowDirection":"UNSPECIFIED"`, invalid: true},
		{name: "typo", field: `,"flowDirection":"BOTH"`, invalid: true},
		{name: "non-string", field: `,"flowDirection":1`, invalid: true},
	} {
		t.Run(tc.name, func(t *testing.T) {
			for _, body := range []interface{}{&WebUI.SubsData{}, &WebUI.Profile{}} {
				data := `{"FlowRules":[{"filter":"192.0.2.1/32"` + tc.field + `}]}`
				req := httptest.NewRequestWithContext(t.Context(), http.MethodPost, "/", strings.NewReader(data))
				req.Header.Set("Content-Type", "application/json")
				err := binding.JSON.Bind(req, body)
				if tc.invalid {
					require.Error(t, err)
				} else {
					require.NoError(t, err)
				}
			}
		})
	}
}

func TestFlowDirectionStorage(t *testing.T) {
	for _, direction := range []string{"", "DOWNLINK", "UPLINK", "BIDIRECTIONAL"} {
		t.Run(direction, func(t *testing.T) {
			rule := WebUI.FlowRule{Filter: "192.0.2.1/32", FlowDirection: direction}
			encoded, err := bson.Marshal(rule)
			require.NoError(t, err)
			var stored WebUI.FlowRule
			require.NoError(t, bson.Unmarshal(encoded, &stored))
			response, err := json.Marshal(stored)
			require.NoError(t, err)
			var decoded WebUI.FlowRule
			require.NoError(t, json.Unmarshal(response, &decoded))
			require.Equal(t, rule, decoded)
		})
	}
}
