package WebUI

import (
	"encoding/json"
	"reflect"
	"testing"

	"github.com/free5gc/openapi/models"
)

func TestNormalizeSMPolicySnssaiData(t *testing.T) {
	for _, tc := range []struct {
		name, oldKey, sd, want string
		sst                    int32
	}{
		{"standard", "1-010203", "010203", "1-010203", 1},
		{"legacy-small", "01010203", "010203", "1-010203", 1},
		{"legacy-decimal", "10010203", "010203", "10-010203", 10},
		{"legacy-hex", "0a010203", "010203", "10-010203", 10},
		{"operator-decimal", "22200007b", "00007b", "222-00007b", 222},
		{"operator-hex", "de00007b", "00007b", "222-00007b", 222},
		{"uppercase", "222-00007B", "00007B", "222-00007b", 222},
		{"no-sd", "01", "", "1", 1},
		{"reserved-no-sd", "01ffffff", "FFFFFF", "1", 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			snssai := &models.Snssai{Sst: tc.sst, Sd: tc.sd}
			entry := models.Udr_DR_SmPolicySnssaiData{
				Snssai: snssai,
				SmPolicyDnnData: map[string]models.Udr_DR_SmPolicyDnnData{
					"default": {Dnn: "default", GbrDl: "100 Mbps", GbrUl: "50 Mbps"},
				},
				UeSliceMbr: &models.SliceMbr{Downlink: "2 Gbps", Uplink: "1 Gbps"},
			}
			input := map[string]models.Udr_DR_SmPolicySnssaiData{tc.oldKey: entry}
			got, err := normalizeSMPolicySnssaiData(input)
			if err != nil {
				t.Fatal(err)
			}
			value, ok := got[tc.want]
			if !ok || len(got) != 1 {
				t.Fatalf("unexpected keys: %v", got)
			}
			if !reflect.DeepEqual(value.SmPolicyDnnData, entry.SmPolicyDnnData) ||
				!reflect.DeepEqual(value.UeSliceMbr, entry.UeSliceMbr) {
				t.Fatal("policy data changed")
			}
			if snssai.Sd != tc.sd || input[tc.oldKey].Snssai != snssai {
				t.Fatal("input mutated")
			}
			twice, err := normalizeSMPolicySnssaiData(got)
			if err != nil || !reflect.DeepEqual(twice, got) {
				t.Fatal("normalization is not idempotent")
			}
		})
	}
}

func TestNormalizeSMPolicySnssaiDataRejectsInvalidEntries(t *testing.T) {
	for _, snssai := range []*models.Snssai{nil, {Sst: -1}, {Sst: 256}, {Sst: 1, Sd: "123"}, {Sst: 1, Sd: "zzzzzz"}} {
		_, err := normalizeSMPolicySnssaiData(map[string]models.Udr_DR_SmPolicySnssaiData{"old": {Snssai: snssai}})
		if err == nil {
			t.Errorf("accepted invalid snssai: %+v", snssai)
		}
	}
	snssai := &models.Snssai{Sst: 222, Sd: "00007b"}
	if _, err := normalizeSMPolicySnssaiData(map[string]models.Udr_DR_SmPolicySnssaiData{
		"1-00007b": {Snssai: snssai},
	}); err == nil {
		t.Fatal("accepted contradictory key")
	}
	entries := map[string]models.Udr_DR_SmPolicySnssaiData{
		"de00007b":  {Snssai: snssai},
		"22200007b": {Snssai: snssai, UeSliceMbr: &models.SliceMbr{Downlink: "1 Gbps"}},
	}
	if _, err := normalizeSMPolicySnssaiData(entries); err == nil {
		t.Fatal("accepted conflicting aliases")
	}
	entries["22200007b"] = entries["de00007b"]
	got, err := normalizeSMPolicySnssaiData(entries)
	if err != nil || len(got) != 1 {
		t.Fatal("identical aliases should collapse")
	}
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
		"22200007b": {Snssai: &models.Snssai{Sst: 222, Sd: "00007b"},
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
	if err := json.Unmarshal(result, &got); err != nil {
		t.Fatal(err)
	}
	if len(got.SmPolicySnssaiData) != 2 {
		t.Fatalf("unexpected slices: %s", result)
	}
	if _, ok := got.SmPolicySnssaiData["de00007b"]; ok {
		t.Fatal("legacy alias retained")
	}
	entry := got.SmPolicySnssaiData["222-00007b"]
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
	raw, _ := json.Marshal(result)
	var got models.Udr_DR_SmPolicyData
	if err := json.Unmarshal(raw, &got); err != nil {
		t.Fatal(err)
	}
	if len(got.SmPolicySnssaiData) != 2 || len(got.SmPolicySnssaiData["10"].SmPolicyDnnData) != 1 ||
		got.SmPolicySnssaiData["10"].SmPolicyDnnData["public"].Dnn != "public" ||
		got.SmPolicySnssaiData["16"].SmPolicyDnnData["private"].Dnn != "private" {
		t.Fatalf("mixed slices: %s", raw)
	}
}
