package WebUI

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"

	"github.com/free5gc/MongoDBLibrary"
	"github.com/free5gc/openapi/models"
	"github.com/free5gc/webconsole/backend/logger"
	"github.com/free5gc/webconsole/backend/webui_context"
)

const (
	authSubsDataColl = "subscriptionData.authenticationData.authenticationSubscription"
	amDataColl       = "subscriptionData.provisionedData.amData"
	smDataColl       = "subscriptionData.provisionedData.smData"
	smfSelDataColl   = "subscriptionData.provisionedData.smfSelectionSubscriptionData"
	amPolicyDataColl = "policyData.ues.amData"
	smPolicyDataColl = "policyData.ues.smData"
	flowRuleDataColl = "policyData.ues.flowRule"
	userDataColl     = "userData"
	tenantDataColl   = "tenantData"
)

var httpsClient *http.Client

func init() {
	httpsClient = &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}
}

func mapToByte(data map[string]interface{}) (ret []byte) {
	ret, _ = json.Marshal(data)
	return
}

func sliceToByte(data []map[string]interface{}) (ret []byte) {
	ret, _ = json.Marshal(data)
	return
}

func toBsonM(data interface{}) (ret bson.M) {
	tmp, _ := json.Marshal(data)
	json.Unmarshal(tmp, &ret)
	return
}

func toBsonA(data interface{}) (ret bson.A) {
	tmp, _ := json.Marshal(data)
	json.Unmarshal(tmp, &ret)
	return
}

func setCorsHeader(c *gin.Context) {
	c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
	c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
	c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
	c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, PATCH, DELETE")
}

func sendResponseToClient(c *gin.Context, response *http.Response) {
	var jsonData interface{}
	json.NewDecoder(response.Body).Decode(&jsonData)
	c.JSON(response.StatusCode, jsonData)
}

func GetSampleJSON(c *gin.Context) {
	setCorsHeader(c)

	logger.WebUILog.Infoln("Get a JSON Example")

	var subsData SubsData

	authSubsData := models.AuthenticationSubscription{
		AuthenticationManagementField: "8000",
		AuthenticationMethod:          "5G_AKA", // "5G_AKA", "EAP_AKA_PRIME"
		Milenage: &models.Milenage{
			Op: &models.Op{
				EncryptionAlgorithm: 0,
				EncryptionKey:       0,
				OpValue:             "c9e8763286b5b9ffbdf56e1297d0887b", // Required
			},
		},
		Opc: &models.Opc{
			EncryptionAlgorithm: 0,
			EncryptionKey:       0,
			OpcValue:            "981d464c7c52eb6e5036234984ad0bcf", // Required
		},
		PermanentKey: &models.PermanentKey{
			EncryptionAlgorithm: 0,
			EncryptionKey:       0,
			PermanentKeyValue:   "5122250214c33e723a5dd523fc145fc0", // Required
		},
		SequenceNumber: "16f3b3f70fc2",
	}

	amDataData := models.AccessAndMobilitySubscriptionData{
		Gpsis: []string{
			"msisdn-0900000000",
		},
		Nssai: &models.Nssai{
			DefaultSingleNssais: []models.Snssai{
				{
					Sd:  "010203",
					Sst: 1,
				},
				{
					Sd:  "112233",
					Sst: 1,
				},
			},
			SingleNssais: []models.Snssai{
				{
					Sd:  "010203",
					Sst: 1,
				},
				{
					Sd:  "112233",
					Sst: 1,
				},
			},
		},
		SubscribedUeAmbr: &models.AmbrRm{
			Downlink: "1000 Kbps",
			Uplink:   "1000 Kbps",
		},
	}

	smDataData := []models.SessionManagementSubscriptionData{
		{
			SingleNssai: &models.Snssai{
				Sst: 1,
				Sd:  "010203",
			},
			DnnConfigurations: map[string]models.DnnConfiguration{
				"internet": {
					PduSessionTypes: &models.PduSessionTypes{
						DefaultSessionType:  models.PduSessionType_IPV4,
						AllowedSessionTypes: []models.PduSessionType{models.PduSessionType_IPV4},
					},
					SscModes: &models.SscModes{
						DefaultSscMode:  models.SscMode__1,
						AllowedSscModes: []models.SscMode{models.SscMode__1},
					},
					SessionAmbr: &models.Ambr{
						Downlink: "1000 Kbps",
						Uplink:   "1000 Kbps",
					},
					Var5gQosProfile: &models.SubscribedDefaultQos{
						Var5qi: 9,
						Arp: &models.Arp{
							PriorityLevel: 8,
						},
						PriorityLevel: 8,
					},
				},
			},
		},
		{
			SingleNssai: &models.Snssai{
				Sst: 1,
				Sd:  "112233",
			},
			DnnConfigurations: map[string]models.DnnConfiguration{
				"internet": {
					PduSessionTypes: &models.PduSessionTypes{
						DefaultSessionType:  models.PduSessionType_IPV4,
						AllowedSessionTypes: []models.PduSessionType{models.PduSessionType_IPV4},
					},
					SscModes: &models.SscModes{
						DefaultSscMode:  models.SscMode__1,
						AllowedSscModes: []models.SscMode{models.SscMode__1},
					},
					SessionAmbr: &models.Ambr{
						Downlink: "1000 Kbps",
						Uplink:   "1000 Kbps",
					},
					Var5gQosProfile: &models.SubscribedDefaultQos{
						Var5qi: 9,
						Arp: &models.Arp{
							PriorityLevel: 8,
						},
						PriorityLevel: 8,
					},
				},
			},
		},
	}

	smfSelData := models.SmfSelectionSubscriptionData{
		SubscribedSnssaiInfos: map[string]models.SnssaiInfo{
			"01010203": {
				DnnInfos: []models.DnnInfo{
					{
						Dnn: "internet",
					},
				},
			},
			"01112233": {
				DnnInfos: []models.DnnInfo{
					{
						Dnn: "internet",
					},
				},
			},
		},
	}

	amPolicyData := models.AmPolicyData{
		SubscCats: []string{
			"free5gc",
		},
	}

	smPolicyData := models.SmPolicyData{
		SmPolicySnssaiData: map[string]models.SmPolicySnssaiData{
			"01010203": {
				Snssai: &models.Snssai{
					Sd:  "010203",
					Sst: 1,
				},
				SmPolicyDnnData: map[string]models.SmPolicyDnnData{
					"internet": {
						Dnn: "internet",
					},
				},
			},
			"01112233": {
				Snssai: &models.Snssai{
					Sd:  "112233",
					Sst: 1,
				},
				SmPolicyDnnData: map[string]models.SmPolicyDnnData{
					"internet": {
						Dnn: "internet",
					},
				},
			},
		},
	}

	servingPlmnId := "20893"
	ueId := "imsi-2089300007487"

	subsData = SubsData{
		PlmnID:                            servingPlmnId,
		UeId:                              ueId,
		AuthenticationSubscription:        authSubsData,
		AccessAndMobilitySubscriptionData: amDataData,
		SessionManagementSubscriptionData: smDataData,
		SmfSelectionSubscriptionData:      smfSelData,
		AmPolicyData:                      amPolicyData,
		SmPolicyData:                      smPolicyData,
	}
	c.JSON(http.StatusOK, subsData)
}

type OAuth struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

const ACCESS_TOKEN = `eyJraWQiOiJ1XC9RZkJJc0J6OUkrSFdISkNLTDNJZW1RcUpKQ1U1dU9aXC9nRW5iZ0tCcUE9IiwiYWxnIjoiUlMyNTYifQ.eyJjdXN0b206ZnVsbG5hbWUiOiJGdWxsIE5hbWUiLCJzdWIiOiI5MjhiMGYyOS04MzMzLTRiOWYtOWZlMC1hN2RiNzRhMTQ1NGQiLCJjdXN0b206c3ViZG9tYWluIjoiZW5nIiwiY29nbml0bzpncm91cHMiOlsiU2hhcmVkTG9nc0dyb3VwIiwiQWRtaW4iXSwiZW1haWxfdmVyaWZpZWQiOnRydWUsImN1c3RvbTpkb21haW4iOiJodWxmdC5jb20iLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtbm9ydGhlYXN0LTEuYW1hem9uYXdzLmNvbVwvYXAtbm9ydGhlYXN0LTFfVEljUVJZdUo0IiwiY3VzdG9tOnVzZXJfaW5mbyI6ImVOcjdcL3g4SFlFQUFBRlhxR09nPSIsImNvZ25pdG86dXNlcm5hbWUiOiI5MjhiMGYyOS04MzMzLTRiOWYtOWZlMC1hN2RiNzRhMTQ1NGQiLCJjb2duaXRvOnJvbGVzIjpbImFybjphd3M6aWFtOjo1ODM1NjU5MzgwNDE6cm9sZVwvU2hhcmVkTG9nc0dyb3VwIiwiYXJuOmF3czppYW06OjU4MzU2NTkzODA0MTpyb2xlXC9BZG1pbiJdLCJhdWQiOiIyMGRsM2U2bWJkbWl0NWhkdjlxYzVvY2U0OSIsImV2ZW50X2lkIjoiYzQyZTAzNjktZGE3NS00OGE0LWJhOWItMzIxMDNiOTQ2NmYyIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE2MjQyNTMwNjksImN1c3RvbTpkaXNwbGF5TmFtZSI6IkRlbW8gVXNlciIsImV4cCI6MTYyNDI1NjY2OSwiaWF0IjoxNjI0MjUzMDY5LCJlbWFpbCI6ImRlbW91c2VyQGh1bGZ0LmNvbSJ9.J8U-PtcmeZpYQQmeycKWY6dBqeCil92nQJ_UU3DyCPrVKyxkGBKqLz-ed8-bvCaC-NbXtKBsqhrdqq0MeQzFfreAxzFNQek6AiDnR1mydi6kQcuZkzbuN1CG8eNt03F05u88ymcastlYwd8ddb3ZPsrMMEMxAL0aZtevaKx4p8pJQDRe2PZYxuJXKY24OBUwO6nBcp6I6sNeFlmMKjv9tb32ZZHGOAPFRKudHBkY7XYnzosojXaoO2YJE8mZDH9uS7-c5RTDMNuu0j6GYRr9NwKCkQTOJWBPSPtqdedk3UnPKG-0_ovCjdX4Sk6470g-dNlrBGKigvJW5hgj0cgUIw`

func Login(c *gin.Context) {
	setCorsHeader(c)

	login := LoginRequest{}
	err := json.NewDecoder(c.Request.Body).Decode(&login)
	if err != nil {
		logger.WebUILog.Warnln("JSON decode error", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}

	if login.Username == "kunihiro" {
		oauth := OAuth{}
		oauth.AccessToken = ACCESS_TOKEN
		c.JSON(http.StatusOK, oauth)
	} else {
		c.JSON(http.StatusForbidden, gin.H{})
	}
}

// Placeholder to handle logout.
func Logout(c *gin.Context) {
	setCorsHeader(c)
	// Needs to invalidate access_token.
	c.JSON(http.StatusOK, gin.H{})
}

type AuthSub struct {
	models.AuthenticationSubscription
	TenantId string `json:"tenantId" bson:"tenantId"`
}

// Get all subscribers list
func GetSubscribers(c *gin.Context) {
	setCorsHeader(c)

	logger.WebUILog.Infoln("Get All Subscribers List")

	var subsList []SubsListIE = make([]SubsListIE, 0)
	amDataList := MongoDBLibrary.RestfulAPIGetMany(amDataColl, bson.M{})
	for _, amData := range amDataList {
		ueId := amData["ueId"]
		servingPlmnId := amData["servingPlmnId"]
		filterUeIdOnly := bson.M{"ueId": ueId}
		authSubsDataInterface := MongoDBLibrary.RestfulAPIGetOne(authSubsDataColl, filterUeIdOnly)
		var authSubsData AuthSub
		json.Unmarshal(mapToByte(authSubsDataInterface), &authSubsData)
		if authSubsData.TenantId == "tenant-uuid" {
			tmp := SubsListIE{
				PlmnID: servingPlmnId.(string),
				UeId:   ueId.(string),
			}
			subsList = append(subsList, tmp)
		}
	}
	c.JSON(http.StatusOK, subsList)
}

// Get subscriber by IMSI(ueId) and PlmnID(servingPlmnId)
func GetSubscriberByID(c *gin.Context) {
	setCorsHeader(c)

	logger.WebUILog.Infoln("Get One Subscriber Data")

	var subsData SubsData

	ueId := c.Param("ueId")
	servingPlmnId := c.Param("servingPlmnId")

	filterUeIdOnly := bson.M{"ueId": ueId}
	filter := bson.M{"ueId": ueId, "servingPlmnId": servingPlmnId}

	authSubsDataInterface := MongoDBLibrary.RestfulAPIGetOne(authSubsDataColl, filterUeIdOnly)
	amDataDataInterface := MongoDBLibrary.RestfulAPIGetOne(amDataColl, filter)
	smDataDataInterface := MongoDBLibrary.RestfulAPIGetMany(smDataColl, filter)
	smfSelDataInterface := MongoDBLibrary.RestfulAPIGetOne(smfSelDataColl, filter)
	amPolicyDataInterface := MongoDBLibrary.RestfulAPIGetOne(amPolicyDataColl, filterUeIdOnly)
	smPolicyDataInterface := MongoDBLibrary.RestfulAPIGetOne(smPolicyDataColl, filterUeIdOnly)
	flowRuleDataInterface := MongoDBLibrary.RestfulAPIGetMany(flowRuleDataColl, filter)

	var authSubsData models.AuthenticationSubscription
	json.Unmarshal(mapToByte(authSubsDataInterface), &authSubsData)
	var amDataData models.AccessAndMobilitySubscriptionData
	json.Unmarshal(mapToByte(amDataDataInterface), &amDataData)
	var smDataData []models.SessionManagementSubscriptionData
	json.Unmarshal(sliceToByte(smDataDataInterface), &smDataData)
	var smfSelData models.SmfSelectionSubscriptionData
	json.Unmarshal(mapToByte(smfSelDataInterface), &smfSelData)
	var amPolicyData models.AmPolicyData
	json.Unmarshal(mapToByte(amPolicyDataInterface), &amPolicyData)
	var smPolicyData models.SmPolicyData
	json.Unmarshal(mapToByte(smPolicyDataInterface), &smPolicyData)
	var flowRules []FlowRule
	json.Unmarshal(sliceToByte(flowRuleDataInterface), &flowRules)

	subsData = SubsData{
		PlmnID:                            servingPlmnId,
		UeId:                              ueId,
		AuthenticationSubscription:        authSubsData,
		AccessAndMobilitySubscriptionData: amDataData,
		SessionManagementSubscriptionData: smDataData,
		SmfSelectionSubscriptionData:      smfSelData,
		AmPolicyData:                      amPolicyData,
		SmPolicyData:                      smPolicyData,
		FlowRules:                         flowRules,
	}

	c.JSON(http.StatusOK, subsData)
}

// Post subscriber by IMSI(ueId) and PlmnID(servingPlmnId)
func PostSubscriberByID(c *gin.Context) {
	setCorsHeader(c)
	logger.WebUILog.Infoln("Post One Subscriber Data")

	var subsData SubsData
	if err := c.ShouldBindJSON(&subsData); err != nil {
		logger.WebUILog.Panic(err.Error())
	}

	ueId := c.Param("ueId")
	servingPlmnId := c.Param("servingPlmnId")

	filterUeIdOnly := bson.M{"ueId": ueId}
	filter := bson.M{"ueId": ueId, "servingPlmnId": servingPlmnId}

	authSubsBsonM := toBsonM(subsData.AuthenticationSubscription)
	authSubsBsonM["ueId"] = ueId
	authSubsBsonM["tenantId"] = "tenant-uuid"
	amDataBsonM := toBsonM(subsData.AccessAndMobilitySubscriptionData)
	amDataBsonM["ueId"] = ueId
	amDataBsonM["servingPlmnId"] = servingPlmnId

	smDatasBsonA := make([]interface{}, 0, len(subsData.SessionManagementSubscriptionData))
	for _, smSubsData := range subsData.SessionManagementSubscriptionData {
		smDataBsonM := toBsonM(smSubsData)
		smDataBsonM["ueId"] = ueId
		smDataBsonM["servingPlmnId"] = servingPlmnId
		smDatasBsonA = append(smDatasBsonA, smDataBsonM)
	}

	smfSelSubsBsonM := toBsonM(subsData.SmfSelectionSubscriptionData)
	smfSelSubsBsonM["ueId"] = ueId
	smfSelSubsBsonM["servingPlmnId"] = servingPlmnId
	amPolicyDataBsonM := toBsonM(subsData.AmPolicyData)
	amPolicyDataBsonM["ueId"] = ueId
	smPolicyDataBsonM := toBsonM(subsData.SmPolicyData)
	smPolicyDataBsonM["ueId"] = ueId

	flowRulesBsonA := make([]interface{}, 0, len(subsData.FlowRules))
	for _, flowRule := range subsData.FlowRules {
		flowRuleBsonM := toBsonM(flowRule)
		flowRuleBsonM["ueId"] = ueId
		flowRuleBsonM["servingPlmnId"] = servingPlmnId
		flowRulesBsonA = append(flowRulesBsonA, flowRuleBsonM)
	}

	MongoDBLibrary.RestfulAPIPost(authSubsDataColl, filterUeIdOnly, authSubsBsonM)
	MongoDBLibrary.RestfulAPIPost(amDataColl, filter, amDataBsonM)
	MongoDBLibrary.RestfulAPIPostMany(smDataColl, filter, smDatasBsonA)
	MongoDBLibrary.RestfulAPIPost(smfSelDataColl, filter, smfSelSubsBsonM)
	MongoDBLibrary.RestfulAPIPost(amPolicyDataColl, filterUeIdOnly, amPolicyDataBsonM)
	MongoDBLibrary.RestfulAPIPost(smPolicyDataColl, filterUeIdOnly, smPolicyDataBsonM)
	MongoDBLibrary.RestfulAPIPostMany(flowRuleDataColl, filter, flowRulesBsonA)

	c.JSON(http.StatusCreated, gin.H{})
}

// Put subscriber by IMSI(ueId) and PlmnID(servingPlmnId)
func PutSubscriberByID(c *gin.Context) {
	setCorsHeader(c)
	logger.WebUILog.Infoln("Put One Subscriber Data")

	var subsData SubsData
	if err := c.ShouldBindJSON(&subsData); err != nil {
		logger.WebUILog.Panic(err.Error())
	}

	ueId := c.Param("ueId")
	servingPlmnId := c.Param("servingPlmnId")

	filterUeIdOnly := bson.M{"ueId": ueId}
	filter := bson.M{"ueId": ueId, "servingPlmnId": servingPlmnId}

	authSubsBsonM := toBsonM(subsData.AuthenticationSubscription)
	authSubsBsonM["ueId"] = ueId
	amDataBsonM := toBsonM(subsData.AccessAndMobilitySubscriptionData)
	amDataBsonM["ueId"] = ueId
	amDataBsonM["servingPlmnId"] = servingPlmnId

	// Replace all data with new one
	MongoDBLibrary.RestfulAPIDeleteMany(smDataColl, filter)
	for _, data := range subsData.SessionManagementSubscriptionData {
		smDataBsonM := toBsonM(data)
		smDataBsonM["ueId"] = ueId
		smDataBsonM["servingPlmnId"] = servingPlmnId
		filterSmData := bson.M{"ueId": ueId, "servingPlmnId": servingPlmnId, "snssai": data.SingleNssai}
		MongoDBLibrary.RestfulAPIPutOne(smDataColl, filterSmData, smDataBsonM)
	}

	smfSelSubsBsonM := toBsonM(subsData.SmfSelectionSubscriptionData)
	smfSelSubsBsonM["ueId"] = ueId
	smfSelSubsBsonM["servingPlmnId"] = servingPlmnId
	amPolicyDataBsonM := toBsonM(subsData.AmPolicyData)
	amPolicyDataBsonM["ueId"] = ueId
	smPolicyDataBsonM := toBsonM(subsData.SmPolicyData)
	smPolicyDataBsonM["ueId"] = ueId

	flowRulesBsonA := make([]interface{}, 0, len(subsData.FlowRules))
	for _, flowRule := range subsData.FlowRules {
		flowRuleBsonM := toBsonM(flowRule)
		flowRuleBsonM["ueId"] = ueId
		flowRuleBsonM["servingPlmnId"] = servingPlmnId
		flowRulesBsonA = append(flowRulesBsonA, flowRuleBsonM)
	}
	// Replace all data with new one
	MongoDBLibrary.RestfulAPIDeleteMany(flowRuleDataColl, filter)
	MongoDBLibrary.RestfulAPIPostMany(flowRuleDataColl, filter, flowRulesBsonA)

	MongoDBLibrary.RestfulAPIPutOne(authSubsDataColl, filterUeIdOnly, authSubsBsonM)
	MongoDBLibrary.RestfulAPIPutOne(amDataColl, filter, amDataBsonM)
	MongoDBLibrary.RestfulAPIPutOne(smfSelDataColl, filter, smfSelSubsBsonM)
	MongoDBLibrary.RestfulAPIPutOne(amPolicyDataColl, filterUeIdOnly, amPolicyDataBsonM)
	MongoDBLibrary.RestfulAPIPutOne(smPolicyDataColl, filterUeIdOnly, smPolicyDataBsonM)

	c.JSON(http.StatusNoContent, gin.H{})
}

// Patch subscriber by IMSI(ueId) and PlmnID(servingPlmnId)
func PatchSubscriberByID(c *gin.Context) {
	setCorsHeader(c)
	logger.WebUILog.Infoln("Patch One Subscriber Data")

	var subsData SubsData
	if err := c.ShouldBindJSON(&subsData); err != nil {
		logger.WebUILog.Panic(err.Error())
	}

	ueId := c.Param("ueId")
	servingPlmnId := c.Param("servingPlmnId")

	filterUeIdOnly := bson.M{"ueId": ueId}
	filter := bson.M{"ueId": ueId, "servingPlmnId": servingPlmnId}

	authSubsBsonM := toBsonM(subsData.AuthenticationSubscription)
	authSubsBsonM["ueId"] = ueId
	amDataBsonM := toBsonM(subsData.AccessAndMobilitySubscriptionData)
	amDataBsonM["ueId"] = ueId
	amDataBsonM["servingPlmnId"] = servingPlmnId

	// Replace all data with new one
	MongoDBLibrary.RestfulAPIDeleteMany(smDataColl, filter)
	for _, data := range subsData.SessionManagementSubscriptionData {
		smDataBsonM := toBsonM(data)
		smDataBsonM["ueId"] = ueId
		smDataBsonM["servingPlmnId"] = servingPlmnId
		filterSmData := bson.M{"ueId": ueId, "servingPlmnId": servingPlmnId, "snssai": data.SingleNssai}
		MongoDBLibrary.RestfulAPIMergePatch(smDataColl, filterSmData, smDataBsonM)
	}

	smfSelSubsBsonM := toBsonM(subsData.SmfSelectionSubscriptionData)
	smfSelSubsBsonM["ueId"] = ueId
	smfSelSubsBsonM["servingPlmnId"] = servingPlmnId
	amPolicyDataBsonM := toBsonM(subsData.AmPolicyData)
	amPolicyDataBsonM["ueId"] = ueId
	smPolicyDataBsonM := toBsonM(subsData.SmPolicyData)
	smPolicyDataBsonM["ueId"] = ueId

	MongoDBLibrary.RestfulAPIMergePatch(authSubsDataColl, filterUeIdOnly, authSubsBsonM)
	MongoDBLibrary.RestfulAPIMergePatch(amDataColl, filter, amDataBsonM)
	MongoDBLibrary.RestfulAPIMergePatch(smfSelDataColl, filter, smfSelSubsBsonM)
	MongoDBLibrary.RestfulAPIMergePatch(amPolicyDataColl, filterUeIdOnly, amPolicyDataBsonM)
	MongoDBLibrary.RestfulAPIMergePatch(smPolicyDataColl, filterUeIdOnly, smPolicyDataBsonM)

	c.JSON(http.StatusNoContent, gin.H{})
}

// Delete subscriber by IMSI(ueId) and PlmnID(servingPlmnId)
func DeleteSubscriberByID(c *gin.Context) {
	setCorsHeader(c)
	logger.WebUILog.Infoln("Delete One Subscriber Data")

	ueId := c.Param("ueId")
	servingPlmnId := c.Param("servingPlmnId")

	filterUeIdOnly := bson.M{"ueId": ueId}
	filter := bson.M{"ueId": ueId, "servingPlmnId": servingPlmnId}

	MongoDBLibrary.RestfulAPIDeleteOne(authSubsDataColl, filterUeIdOnly)
	MongoDBLibrary.RestfulAPIDeleteOne(amDataColl, filter)
	MongoDBLibrary.RestfulAPIDeleteMany(smDataColl, filter)
	MongoDBLibrary.RestfulAPIDeleteMany(flowRuleDataColl, filter)
	MongoDBLibrary.RestfulAPIDeleteOne(smfSelDataColl, filter)
	MongoDBLibrary.RestfulAPIDeleteOne(amPolicyDataColl, filterUeIdOnly)
	MongoDBLibrary.RestfulAPIDeleteOne(smPolicyDataColl, filterUeIdOnly)

	c.JSON(http.StatusNoContent, gin.H{})
}

func GetRegisteredUEContext(c *gin.Context) {
	setCorsHeader(c)

	logger.WebUILog.Infoln("Get Registered UE Context")

	webuiSelf := webui_context.WEBUI_Self()
	webuiSelf.UpdateNfProfiles()

	supi, supiExists := c.Params.Get("supi")

	// TODO: support fetching data from multiple AMFs
	if amfUris := webuiSelf.GetOamUris(models.NfType_AMF); amfUris != nil {
		var requestUri string

		if supiExists {
			requestUri = fmt.Sprintf("%s/namf-oam/v1/registered-ue-context/%s", amfUris[0], supi)
		} else {
			requestUri = fmt.Sprintf("%s/namf-oam/v1/registered-ue-context", amfUris[0])
		}

		resp, err := httpsClient.Get(requestUri)
		if err != nil {
			logger.WebUILog.Error(err)
			c.JSON(http.StatusInternalServerError, gin.H{})
			return
		}
		sendResponseToClient(c, resp)
	} else {
		c.JSON(http.StatusInternalServerError, gin.H{
			"cause": "No AMF Found",
		})
	}
}

func GetUEPDUSessionInfo(c *gin.Context) {
	setCorsHeader(c)

	logger.WebUILog.Infoln("Get UE PDU Session Info")

	webuiSelf := webui_context.WEBUI_Self()
	webuiSelf.UpdateNfProfiles()

	smContextRef, smContextRefExists := c.Params.Get("smContextRef")
	if !smContextRefExists {
		c.JSON(http.StatusBadRequest, gin.H{})
		return
	}

	// TODO: support fetching data from multiple SMF
	if smfUris := webuiSelf.GetOamUris(models.NfType_SMF); smfUris != nil {
		requestUri := fmt.Sprintf("%s/nsmf-oam/v1/ue-pdu-session-info/%s", smfUris[0], smContextRef)
		resp, err := httpsClient.Get(requestUri)
		if err != nil {
			logger.WebUILog.Error(err)
			c.JSON(http.StatusInternalServerError, gin.H{})
			return
		}

		sendResponseToClient(c, resp)
	} else {
		c.JSON(http.StatusInternalServerError, gin.H{
			"cause": "No SMF Found",
		})
	}
}
