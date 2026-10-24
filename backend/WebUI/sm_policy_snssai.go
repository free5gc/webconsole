package WebUI

import (
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"reflect"
	"strconv"
	"strings"

	jsonpatch "github.com/evanphx/json-patch/v5"
	"github.com/gin-gonic/gin"

	"github.com/free5gc/openapi/models"
)

// normalizeSMPolicySnssaiData accepts legacy map keys using the mandatory
// snssai field as identity, and emits TS 29.571 section 5.4.4.2 map keys.
// It does not mutate the input, or change unrelated internal hex identifiers.
func normalizeSMPolicySnssaiData(entries map[string]models.Udr_DR_SmPolicySnssaiData) (
	map[string]models.Udr_DR_SmPolicySnssaiData, error,
) {
	if entries == nil {
		return nil, nil
	}
	result := make(map[string]models.Udr_DR_SmPolicySnssaiData, len(entries))
	for oldKey, entry := range entries {
		if entry.Snssai == nil {
			return nil, fmt.Errorf("SM policy entry %q is missing snssai", oldKey)
		}
		snssai := *entry.Snssai
		if snssai.Sst < 0 || snssai.Sst > 255 {
			return nil, fmt.Errorf("invalid SM policy SST: %d", snssai.Sst)
		}
		if snssai.Sd != "" {
			if _, err := hex.DecodeString(snssai.Sd); err != nil || len(snssai.Sd) != 6 {
				return nil, fmt.Errorf("invalid SM policy SD: %q", snssai.Sd)
			}
		}
		snssai.Sd = strings.ToLower(snssai.Sd)
		// Match openapi.SnssaiEqualFold's no-SD semantics (TS 23.003 section 28.4.2).
		if snssai.Sd == "ffffff" {
			snssai.Sd = ""
		}
		key := strconv.FormatInt(int64(snssai.Sst), 10)
		if snssai.Sd != "" {
			key += "-" + snssai.Sd
		}
		// A hyphenated key has an unambiguous standard identity. Do not silently
		// repair a contradictory identity. Unseparated legacy keys are ambiguous.
		if strings.Contains(oldKey, "-") && !strings.EqualFold(oldKey, key) &&
			(snssai.Sd != "" || !strings.EqualFold(oldKey, key+"-ffffff")) {
			return nil, fmt.Errorf("SM policy key %q disagrees with snssai", oldKey)
		}
		entry.Snssai = &snssai
		if previous, ok := result[key]; ok && !reflect.DeepEqual(previous, entry) {
			return nil, fmt.Errorf("conflicting SM policy entries for %q", key)
		}
		result[key] = entry
	}
	return result, nil
}

// Reject invalid input before any subscriber collections are changed.
func validateSubscriberSMPolicyForWrite(c *gin.Context, subs *SubsData) bool {
	entries, err := normalizeSMPolicySnssaiData(subs.SmPolicyData.SmPolicySnssaiData)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"cause": err.Error()})
		return false
	}
	subs.SmPolicyData.SmPolicySnssaiData = entries
	return true
}

// Merge in canonical key space before writing the resulting map with $set.
// Merging new keys directly into the legacy map would retain aliases and can
// mix different slices (e.g. legacy hex "10" and canonical decimal "10").
// Omitted slices, DNNs and policy fields retain PATCH semantics.
func smPolicyUpdate(stored map[string]interface{}, incoming models.Udr_DR_SmPolicyData) (
	map[string]interface{}, error,
) {
	patch := toBsonM(incoming)
	if incoming.SmPolicySnssaiData == nil {
		return patch, nil
	}
	raw, err := json.Marshal(stored)
	if err != nil {
		return nil, err
	}
	var previous models.Udr_DR_SmPolicyData
	if err = json.Unmarshal(raw, &previous); err != nil {
		return nil, err
	}
	oldEntries, err := normalizeSMPolicySnssaiData(previous.SmPolicySnssaiData)
	if err != nil {
		return nil, err
	}
	newEntries, err := normalizeSMPolicySnssaiData(incoming.SmPolicySnssaiData)
	if err != nil {
		return nil, err
	}
	for key, entry := range newEntries {
		if entry.SmPolicyDnnData != nil {
			dnns := make(map[string]models.Udr_DR_SmPolicyDnnData, len(entry.SmPolicyDnnData))
			for dnn, data := range entry.SmPolicyDnnData {
				dnns[EscapeDnn(dnn)] = data
			}
			entry.SmPolicyDnnData = dnns
			newEntries[key] = entry
		}
	}
	base := make(map[string]interface{}, len(stored))
	for key, value := range stored {
		base[key] = value
	}
	base["smPolicySnssaiData"] = oldEntries
	patch["smPolicySnssaiData"] = newEntries
	oldJSON, err := json.Marshal(base)
	if err != nil {
		return nil, err
	}
	newJSON, err := json.Marshal(patch)
	if err != nil {
		return nil, err
	}
	merged, err := jsonpatch.MergePatch(oldJSON, newJSON)
	if err != nil {
		return nil, err
	}
	var result map[string]interface{}
	if err = json.Unmarshal(merged, &result); err != nil {
		return nil, err
	}
	return result, nil
}
