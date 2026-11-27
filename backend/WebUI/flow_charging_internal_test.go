package WebUI

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestValidateRequiredFlowCharging(t *testing.T) {
	matching := ChargingData{
		Snssai: "01010203", Dnn: "internet", QosRef: 3, Filter: "10.70.0.0/16", ChargingMethod: ChargingOnline,
	}
	otherFlow := matching
	otherFlow.QosRef++
	invalid := matching
	invalid.ChargingMethod = "invalid"

	for _, tc := range []struct {
		name        string
		requirement string
		templates   []ChargingData
		wantError   bool
	}{
		{name: "legacy no template"},
		{name: "explicit free no template", requirement: `,"chargingRequired":false`},
		{
			name:        "required with matching template",
			requirement: `,"chargingRequired":true`, templates: []ChargingData{otherFlow, matching},
		},
		{name: "required with no template", requirement: `,"chargingRequired":true`, wantError: true},
		{
			name:        "required with wrong QoS ref",
			requirement: `,"chargingRequired":true`, templates: []ChargingData{otherFlow}, wantError: true,
		},
		{
			name:        "required with invalid charging method",
			requirement: `,"chargingRequired":true`, templates: []ChargingData{invalid}, wantError: true,
		},
		{
			name:        "required with duplicate templates",
			requirement: `,"chargingRequired":true`, templates: []ChargingData{matching, matching}, wantError: true,
		},
	} {
		t.Run(tc.name, func(t *testing.T) {
			var flow FlowRule
			require.NoError(t, json.Unmarshal([]byte(
				`{"snssai":"01010203","dnn":"internet","qosRef":3,"filter":"10.70.0.0/16"`+tc.requirement+"}",
			), &flow))
			err := validateRequiredFlowCharging(&SubsData{FlowRules: []FlowRule{flow}, ChargingDatas: tc.templates})
			if tc.wantError {
				require.Error(t, err)
				return
			}
			require.NoError(t, err)

			// Subscriber flow documents are built with toBsonM before insertion.
			stored := toBsonM(flow)
			if flow.ChargingRequired == nil {
				require.NotContains(t, stored, "chargingRequired")
			} else {
				require.Equal(t, *flow.ChargingRequired, stored["chargingRequired"])
			}
		})
	}
}
