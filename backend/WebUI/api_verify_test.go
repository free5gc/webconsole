package WebUI_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/netip"
	"testing"

	"github.com/free5gc/webconsole/backend/WebUI"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
)

func TestVerifyStaticIpProcedure(t *testing.T) {
	gin.SetMode(gin.TestMode)

	testcases := []struct {
		Name    string
		Scope   WebUI.VerifyScope
		IpPools []string
		Result  bool
	}{
		{
			Name: "One Static Pool - PASS",
			Scope: WebUI.VerifyScope{
				Supi:   "imsi-",
				Sst:    1,
				Sd:     "010203",
				Dnn:    "internet",
				Ipaddr: "10.163.100.100",
			},
			IpPools: []string{"10.163.100.0/24"},
			Result:  true,
		},
	}

	for _, tc := range testcases {
		w := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(w)

		pools := []netip.Prefix{}
		for _, pool := range tc.IpPools {
			net, err := netip.ParsePrefix(pool)
			require.NoError(t, err)

			pools = append(pools, net)
		}

		WebUI.VerifyStaticIpProcedure(ctx, tc.Scope, pools)
		require.Equal(t, http.StatusOK, w.Code)

		var result gin.H
		rawByte := w.Body
		errUnmarshal := json.Unmarshal(rawByte.Bytes(), &result)
		require.NoError(t, errUnmarshal)

		valid, exist := result["valid"]
		require.True(t, exist)

		require.Equal(t, tc.Result, valid)
	}
}
