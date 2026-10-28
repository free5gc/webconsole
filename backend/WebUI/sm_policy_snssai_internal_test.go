package WebUI

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"

	"github.com/free5gc/openapi/models"
)

func TestSubscriberSMPolicyWriteKeys(t *testing.T) {
	entry := models.Udr_DR_SmPolicySnssaiData{
		Snssai:          &models.Snssai{Sst: 222, Sd: "00007B"},
		SmPolicyDnnData: map[string]models.Udr_DR_SmPolicyDnnData{"default": {Dnn: "default"}},
	}
	for _, key := range []string{"222-00007b", "22200007b", "de00007b", "1-010203"} {
		t.Run(key, func(t *testing.T) {
			subs := SubsData{SmPolicyData: models.Udr_DR_SmPolicyData{
				SmPolicySnssaiData: map[string]models.Udr_DR_SmPolicySnssaiData{key: entry},
			}}
			c, _ := gin.CreateTestContext(httptest.NewRecorder())
			require.True(t, validateSubscriberSMPolicyForWrite(c, &subs))
			require.Equal(t, map[string]models.Udr_DR_SmPolicySnssaiData{"222-00007b": entry},
				subs.SmPolicyData.SmPolicySnssaiData)
		})
	}

	alias := entry
	alias.Snssai = &models.Snssai{Sst: 222, Sd: "00007b"}
	subs := SubsData{SmPolicyData: models.Udr_DR_SmPolicyData{
		SmPolicySnssaiData: map[string]models.Udr_DR_SmPolicySnssaiData{"de00007b": entry, "222-00007b": alias},
	}}
	c, _ := gin.CreateTestContext(httptest.NewRecorder())
	require.True(t, validateSubscriberSMPolicyForWrite(c, &subs))
	require.Len(t, subs.SmPolicyData.SmPolicySnssaiData, 1)

	alias.UeSliceMbr = &models.SliceMbr{Downlink: "1 Gbps"}
	subs.SmPolicyData.SmPolicySnssaiData = map[string]models.Udr_DR_SmPolicySnssaiData{
		"de00007b": entry, "222-00007b": alias,
	}
	recorder := httptest.NewRecorder()
	c, _ = gin.CreateTestContext(recorder)
	require.False(t, validateSubscriberSMPolicyForWrite(c, &subs))
	require.Equal(t, http.StatusBadRequest, recorder.Code)

	subs.SmPolicyData.SmPolicySnssaiData = map[string]models.Udr_DR_SmPolicySnssaiData{"old": {}}
	c, _ = gin.CreateTestContext(httptest.NewRecorder())
	require.False(t, validateSubscriberSMPolicyForWrite(c, &subs))
}

func TestSMPolicyUpdateMigratesLegacyKeysWithoutLosingData(t *testing.T) {
	var stored map[string]interface{}
	if err := json.Unmarshal([]byte(`{
  "ueId":"imsi-test", "suppFeat":"1",
  "smPolicySnssaiData":{
   "de00007b":{
    "snssai":{"sst":222,"sd":"00007b"},
    "ueSliceMbr":{"downlink":"2 Gbps","uplink":"1 Gbps"},
    "smPolicyDnnData":{"default":{"dnn":"default","gbrDl":"100 Mbps"},"other":{"dnn":"other"}}
   },
   "01010203":{"snssai":{"sst":1,"sd":"010203"},"smPolicyDnnData":{"internet":{"dnn":"internet"}}}
  }
 }`), &stored); err != nil {
		t.Fatal(err)
	}
	incoming := models.Udr_DR_SmPolicyData{SmPolicySnssaiData: map[string]models.Udr_DR_SmPolicySnssaiData{
		"22200007b": {
			Snssai:          &models.Snssai{Sst: 222, Sd: "00007B"},
			SmPolicyDnnData: map[string]models.Udr_DR_SmPolicyDnnData{"default": {Dnn: "default", GbrUl: "50 Mbps"}},
		},
	}}
	patch, err := smPolicyUpdate(stored, incoming)
	if err != nil {
		t.Fatal(err)
	}
	result, err := json.Marshal(patch)
	if err != nil {
		t.Fatal(err)
	}
	var got models.Udr_DR_SmPolicyData
	if err = json.Unmarshal(result, &got); err != nil {
		t.Fatal(err)
	}
	if len(got.SmPolicySnssaiData) != 2 {
		t.Fatalf("unexpected slices: %s", result)
	}
	if _, ok := got.SmPolicySnssaiData["de00007b"]; ok {
		t.Fatal("legacy alias retained")
	}
	entry := got.SmPolicySnssaiData["222-00007b"]
	require.Equal(t, "00007B", entry.Snssai.Sd)
	if entry.SmPolicyDnnData["default"].GbrDl != "100 Mbps" || entry.SmPolicyDnnData["default"].GbrUl != "50 Mbps" {
		t.Fatalf("lost DNN fields: %s", result)
	}
	if len(entry.SmPolicyDnnData) != 2 || entry.UeSliceMbr.Downlink != "2 Gbps" || got.SuppFeat != "1" {
		t.Fatalf("lost untouched policy data: %s", result)
	}
	if got.SmPolicySnssaiData["1-010203"].SmPolicyDnnData["internet"].Dnn != "internet" {
		t.Fatal("lost other slice")
	}
	if _, ok := stored["smPolicySnssaiData"].(map[string]interface{})["de00007b"]; !ok {
		t.Fatal("input mutated")
	}
}

func TestSMPolicyUpdateDoesNotMixLegacyHexAndDecimalNoSD(t *testing.T) {
	var stored map[string]interface{}
	if err := json.Unmarshal([]byte(`{"smPolicySnssaiData":{"10":{"snssai":{"sst":16},
 "smPolicyDnnData":{"private":{"dnn":"private"}}}}}`), &stored); err != nil {
		t.Fatal(err)
	}
	incoming := models.Udr_DR_SmPolicyData{SmPolicySnssaiData: map[string]models.Udr_DR_SmPolicySnssaiData{
		"10": {Snssai: &models.Snssai{Sst: 10}, SmPolicyDnnData: map[string]models.Udr_DR_SmPolicyDnnData{
			"public": {Dnn: "public"},
		}},
	}}
	result, err := smPolicyUpdate(stored, incoming)
	if err != nil {
		t.Fatal(err)
	}
	raw, err := json.Marshal(result)
	if err != nil {
		t.Fatal(err)
	}
	var got models.Udr_DR_SmPolicyData
	if err = json.Unmarshal(raw, &got); err != nil {
		t.Fatal(err)
	}
	if len(got.SmPolicySnssaiData) != 2 || len(got.SmPolicySnssaiData["10"].SmPolicyDnnData) != 1 ||
		got.SmPolicySnssaiData["10"].SmPolicyDnnData["public"].Dnn != "public" ||
		got.SmPolicySnssaiData["16"].SmPolicyDnnData["private"].Dnn != "private" {
		t.Fatalf("mixed slices: %s", raw)
	}
}
