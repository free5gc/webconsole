package WebUI

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"reflect"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"github.com/google/uuid"
	"github.com/pkg/errors"
	"go.mongodb.org/mongo-driver/bson"
	"golang.org/x/crypto/bcrypt"

	"github.com/free5gc/openapi/models"
	"github.com/free5gc/util/mongoapi"
	"github.com/free5gc/webconsole/backend/logger"
	"github.com/free5gc/webconsole/backend/webui_context"
)

const (
	authSubsDataColl  = "subscriptionData.authenticationData.authenticationSubscription"
	amDataColl        = "subscriptionData.provisionedData.amData"
	smDataColl        = "subscriptionData.provisionedData.smData"
	smfSelDataColl    = "subscriptionData.provisionedData.smfSelectionSubscriptionData"
	amPolicyDataColl  = "policyData.ues.amData"
	smPolicyDataColl  = "policyData.ues.smData"
	flowRuleDataColl  = "policyData.ues.flowRule"
	qosFlowDataColl   = "policyData.ues.qosFlow"
	userDataColl      = "userData"
	tenantDataColl    = "tenantData"
	msisdnSupiMapColl = "subscriptionData.msisdnSupiMap"
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
	ret, err := json.Marshal(data)
	if err != nil {
		logger.ProcLog.Errorf("mapToByte err: %+v", err)
	}
	return
}

func sliceToByte(data []map[string]interface{}) (ret []byte) {
	ret, err := json.Marshal(data)
	if err != nil {
		logger.ProcLog.Errorf("sliceToByte err: %+v", err)
	}
	return
}

func toBsonM(data interface{}) (ret bson.M) {
	tmp, err := json.Marshal(data)
	if err != nil {
		logger.ProcLog.Errorf("toBsonM err: %+v", err)
	}
	err = json.Unmarshal(tmp, &ret)
	if err != nil {
		logger.ProcLog.Errorf("toBsonM err: %+v", err)
	}
	return
}

func EscapeDnn(dnn string) string {
	return strings.ReplaceAll(dnn, ".", "_")
}

func UnescapeDnn(dnnKey string) string {
	return strings.ReplaceAll(dnnKey, "_", ".")
}

func setCorsHeader(c *gin.Context) {
	c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
	c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
	c.Writer.Header().Set(
		"Access-Control-Allow-Headers",
		"Content-Type, Content-Length, Accept-Encoding, "+
			"X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With",
	)
	c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, PATCH, DELETE")
}

func getMsisdn(gpsis interface{}) string {
	msisdn := ""
	gpsisReflected := reflect.ValueOf(gpsis) // use reflect to range over interface{}
	for i := 0; i < gpsisReflected.Len(); i++ {
		gpsi := gpsisReflected.Index(i).Interface().(string) // transform type reflect.value to string
		if strings.HasPrefix(gpsi, "msisdn-") {              // check if gpsi contain prefix "msisdn-"
			msisdn = gpsi[7:]
		}
	}
	return msisdn
}

func msisdnToSupi(ueId string) string {
	if strings.HasPrefix(ueId, "msisdn-") {
		filter := bson.M{"msisdn": ueId[7:]}
		dbResult, err := mongoapi.RestfulAPIGetOne(msisdnSupiMapColl, filter)
		if err != nil {
			logger.ProcLog.Errorf("GetSupibyMsisdn err: %+v", err)
		}
		if dbResult != nil {
			ueId = dbResult["ueId"].(string)
		} else {
			// db cannot find a supi mapped to msisdn, return null string for error detection
			logger.ProcLog.Error("msisdn not found")
			return ""
		}
	}
	return ueId
}

func sendResponseToClient(c *gin.Context, response *http.Response) {
	var jsonData interface{}
	err := json.NewDecoder(response.Body).Decode(&jsonData)
	if err != nil {
		logger.ProcLog.Errorf("sendResponseToClient err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}
	c.JSON(response.StatusCode, jsonData)
}

func sendResponseToClientFilterTenant(c *gin.Context, response *http.Response, tenantId string) {
	// Subscription data.
	filterTenantIdOnly := bson.M{"tenantId": tenantId}
	amDataList, err := mongoapi.RestfulAPIGetMany(amDataColl, filterTenantIdOnly)
	if err != nil {
		logger.ProcLog.Errorf("sendResponseToClientFilterTenant err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}

	tenantCheck := func(supi string) bool {
		for _, amData := range amDataList {
			if supi == amData["ueId"] {
				return true
			}
		}
		return false
	}

	// Response data.
	var jsonData interface{}
	err = json.NewDecoder(response.Body).Decode(&jsonData)
	if err != nil {
		logger.ProcLog.Errorf("sendResponseToClientFilterTenant err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}

	s := reflect.ValueOf(jsonData)
	if s.Kind() != reflect.Slice {
		c.JSON(response.StatusCode, jsonData)
		return
	}

	var sliceData []interface{}
	for i := 0; i < s.Len(); i++ {
		mapData := s.Index(i).Interface()
		m := reflect.ValueOf(mapData)
		for _, key := range m.MapKeys() {
			if key.String() == "Supi" {
				strct := m.MapIndex(key)
				if tenantCheck(strct.Interface().(string)) {
					sliceData = append(sliceData, mapData)
				}
			}
		}
	}

	c.JSON(response.StatusCode, sliceData)
}

func GetSampleJSON(c *gin.Context) {
	setCorsHeader(c)

	logger.ProcLog.Infoln("Get a JSON Example")

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

func JWT(email, userId, tenantId string) string {
	token := jwt.New(jwt.SigningMethodHS256)

	claims := token.Claims.(jwt.MapClaims)
	claims["sub"] = userId
	claims["iat"] = time.Now()
	claims["exp"] = time.Now().Add(time.Hour * 24).Unix()
	claims["email"] = email
	claims["tenantId"] = tenantId

	tokenString, err := token.SignedString([]byte(os.Getenv("SIGNINGKEY")))
	if err != nil {
		logger.ProcLog.Errorf("JWT err: %+v", err)
	}

	return tokenString
}

func generateHash(password string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		logger.ProcLog.Errorf("generateHash err: %+v", err)
		return err
	}
	logger.ProcLog.Warnln("Password hash:", hash)
	return err
}

func Login(c *gin.Context) {
	setCorsHeader(c)

	login := LoginRequest{}
	err := json.NewDecoder(c.Request.Body).Decode(&login)
	if err != nil {
		logger.ProcLog.Warnln("JSON decode error", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}

	err = generateHash(login.Password)
	if err != nil {
		logger.ProcLog.Errorf("Login err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}

	filterEmail := bson.M{"email": login.Username}
	userData, err := mongoapi.RestfulAPIGetOne(userDataColl, filterEmail)
	if err != nil {
		logger.ProcLog.Errorf("Login err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}

	if len(userData) == 0 {
		logger.ProcLog.Warnln("Can't find user email", login.Username)
		c.JSON(http.StatusForbidden, gin.H{})
		return
	}

	hash := userData["encryptedPassword"].(string)

	err = bcrypt.CompareHashAndPassword([]byte(hash), []byte(login.Password))
	if err != nil {
		logger.ProcLog.Warnln("Password incorrect", login.Username)
		c.JSON(http.StatusForbidden, gin.H{})
		return
	}

	userId := userData["userId"].(string)
	tenantId := userData["tenantId"].(string)

	logger.ProcLog.Warnln("Login success", login.Username)
	logger.ProcLog.Warnln("userid", userId)
	logger.ProcLog.Warnln("tenantid", tenantId)

	token := JWT(login.Username, userId, tenantId)
	logger.ProcLog.Warnln("token", token)

	oauth := OAuth{}
	oauth.AccessToken = token
	c.JSON(http.StatusOK, oauth)
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

// Parse JWT
func ParseJWT(tokenStr string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("SIGNINGKEY")), nil
	})
	if err != nil {
		return nil, errors.Wrap(err, "ParseJWT error")
	}

	claims, _ := token.Claims.(jwt.MapClaims)

	return claims, nil
}

// Check of admin user. This should be done with proper JWT token.
func CheckAuth(c *gin.Context) bool {
	tokenStr := c.GetHeader("Token")
	if tokenStr == "admin" {
		return true
	} else {
		return false
	}
}

// Tenant ID
func GetTenantId(c *gin.Context) (string, error) {
	tokenStr := c.GetHeader("Token")
	if tokenStr == "admin" {
		return "", nil
	}
	claims, err := ParseJWT(tokenStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{})
		return "", errors.Wrap(err, "GetTenantId error")
	}
	return claims["tenantId"].(string), nil
}

// Tenant
func GetTenants(c *gin.Context) {
	setCorsHeader(c)

	if !CheckAuth(c) {
		c.JSON(http.StatusNotFound, bson.M{})
		return
	}

	tenantDataInterface, err := mongoapi.RestfulAPIGetMany(tenantDataColl, bson.M{})
	if err != nil {
		logger.ProcLog.Errorf("GetTenants err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}
	var tenantData []Tenant
	err = json.Unmarshal(sliceToByte(tenantDataInterface), &tenantData)
	if err != nil {
		logger.ProcLog.Errorf("GetTenants err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}
	c.JSON(http.StatusOK, tenantData)
}

func GetTenantByID(c *gin.Context) {
	setCorsHeader(c)

	if !CheckAuth(c) {
		c.JSON(http.StatusNotFound, bson.M{})
		return
	}

	tenantId := c.Param("tenantId")

	filterTenantIdOnly := bson.M{"tenantId": tenantId}
	tenantDataInterface, err := mongoapi.RestfulAPIGetOne(tenantDataColl, filterTenantIdOnly)
	if err != nil {
		logger.ProcLog.Errorf("GetTenantByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}
	if len(tenantDataInterface) == 0 {
		c.JSON(http.StatusNotFound, bson.M{})
		return
	}

	var tenantData Tenant
	err = json.Unmarshal(mapToByte(tenantDataInterface), &tenantData)
	if err != nil {
		logger.ProcLog.Errorf("GetTenantByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}
	c.JSON(http.StatusOK, tenantData)
}

func PostTenant(c *gin.Context) {
	setCorsHeader(c)

	if !CheckAuth(c) {
		c.JSON(http.StatusNotFound, bson.M{})
		return
	}

	var tenantData Tenant
	if err := c.ShouldBindJSON(&tenantData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{})
		return
	}

	if tenantData.TenantId == "" {
		tenantData.TenantId = uuid.Must(uuid.NewRandom()).String()
	}

	tenantBsonM := toBsonM(tenantData)
	filterTenantIdOnly := bson.M{"tenantId": tenantData.TenantId}
	if _, err := mongoapi.RestfulAPIPost(tenantDataColl, filterTenantIdOnly, tenantBsonM); err != nil {
		logger.ProcLog.Errorf("PostTenant err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}

	c.JSON(http.StatusOK, tenantData)
}

func PutTenantByID(c *gin.Context) {
	setCorsHeader(c)

	if !CheckAuth(c) {
		c.JSON(http.StatusNotFound, bson.M{})
		return
	}

	tenantId := c.Param("tenantId")

	filterTenantIdOnly := bson.M{"tenantId": tenantId}
	tenantDataInterface, err := mongoapi.RestfulAPIGetOne(tenantDataColl, filterTenantIdOnly)
	if err != nil {
		logger.ProcLog.Errorf("PutTenantByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}
	if len(tenantDataInterface) == 0 {
		c.JSON(http.StatusNotFound, bson.M{})
		return
	}

	var tenantData Tenant
	if err := c.ShouldBindJSON(&tenantData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{})
		return
	}
	tenantData.TenantId = tenantId

	tenantBsonM := toBsonM(tenantData)
	filterTenantIdOnly = bson.M{"tenantId": tenantId}
	if _, err := mongoapi.RestfulAPIPost(tenantDataColl, filterTenantIdOnly, tenantBsonM); err != nil {
		logger.ProcLog.Errorf("PutTenantByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}

func DeleteTenantByID(c *gin.Context) {
	setCorsHeader(c)

	if !CheckAuth(c) {
		c.JSON(http.StatusNotFound, bson.M{})
		return
	}

	tenantId := c.Param("tenantId")
	filterTenantIdOnly := bson.M{"tenantId": tenantId}

	if err := mongoapi.RestfulAPIDeleteMany(amDataColl, filterTenantIdOnly); err != nil {
		logger.ProcLog.Errorf("DeleteTenantByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}
	if err := mongoapi.RestfulAPIDeleteMany(userDataColl, filterTenantIdOnly); err != nil {
		logger.ProcLog.Errorf("DeleteTenantByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}
	if err := mongoapi.RestfulAPIDeleteOne(tenantDataColl, filterTenantIdOnly); err != nil {
		logger.ProcLog.Errorf("DeleteTenantByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}

// Utility function.
func GetTenantById(tenantId string) map[string]interface{} {
	filterTenantIdOnly := bson.M{"tenantId": tenantId}
	tenantData, err := mongoapi.RestfulAPIGetOne(tenantDataColl, filterTenantIdOnly)
	if err != nil {
		logger.ProcLog.Errorf("GetTenantById err: %+v", err)
		return nil
	}
	return tenantData
}

// Users
func GetUsers(c *gin.Context) {
	setCorsHeader(c)

	if !CheckAuth(c) {
		c.JSON(http.StatusNotFound, bson.M{})
		return
	}

	tenantId := c.Param("tenantId")
	if len(GetTenantById(tenantId)) == 0 {
		c.JSON(http.StatusNotFound, bson.M{})
		return
	}

	filterTenantIdOnly := bson.M{"tenantId": tenantId}
	userDataInterface, err := mongoapi.RestfulAPIGetMany(userDataColl, filterTenantIdOnly)
	if err != nil {
		logger.ProcLog.Errorf("GetUsers err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}

	var userData []User
	err = json.Unmarshal(sliceToByte(userDataInterface), &userData)
	if err != nil {
		logger.ProcLog.Errorf("GetUsers err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}

	for pos := range userData {
		userData[pos].EncryptedPassword = ""
	}

	c.JSON(http.StatusOK, userData)
}

func GetUserByID(c *gin.Context) {
	setCorsHeader(c)

	if !CheckAuth(c) {
		c.JSON(http.StatusNotFound, bson.M{})
		return
	}

	tenantId := c.Param("tenantId")
	if len(GetTenantById(tenantId)) == 0 {
		c.JSON(http.StatusNotFound, bson.M{})
		return
	}
	userId := c.Param("userId")

	filterUserIdOnly := bson.M{"tenantId": tenantId, "userId": userId}
	userDataInterface, err := mongoapi.RestfulAPIGetOne(userDataColl, filterUserIdOnly)
	if err != nil {
		logger.ProcLog.Errorf("GetUserByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}
	if len(userDataInterface) == 0 {
		c.JSON(http.StatusNotFound, bson.M{})
		return
	}

	var userData User
	err = json.Unmarshal(mapToByte(userDataInterface), &userData)
	if err != nil {
		logger.ProcLog.Errorf("GetUserByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}

	userData.EncryptedPassword = ""

	c.JSON(http.StatusOK, userData)
}

func PostUserByID(c *gin.Context) {
	setCorsHeader(c)

	if !CheckAuth(c) {
		c.JSON(http.StatusNotFound, bson.M{})
		return
	}

	tenantId := c.Param("tenantId")
	if len(GetTenantById(tenantId)) == 0 {
		c.JSON(http.StatusNotFound, bson.M{})
		return
	}

	var userData User
	if err := c.ShouldBindJSON(&userData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{})
		return
	}

	filterEmail := bson.M{"email": userData.Email}
	userWithEmailData, err := mongoapi.RestfulAPIGetOne(userDataColl, filterEmail)
	if err != nil {
		logger.ProcLog.Errorf("PostUserByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}
	if len(userWithEmailData) != 0 {
		logger.ProcLog.Warnln("Email already exists", userData.Email)
		c.JSON(http.StatusForbidden, gin.H{})
		return
	}

	userData.TenantId = tenantId
	userData.UserId = uuid.Must(uuid.NewRandom()).String()
	hash, err := bcrypt.GenerateFromPassword([]byte(userData.EncryptedPassword), 12)
	if err != nil {
		logger.ProcLog.Errorf("PostUserByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}
	userData.EncryptedPassword = string(hash)

	userBsonM := toBsonM(userData)
	filterUserIdOnly := bson.M{"tenantId": userData.TenantId, "userId": userData.UserId}
	if _, err := mongoapi.RestfulAPIPost(userDataColl, filterUserIdOnly, userBsonM); err != nil {
		logger.ProcLog.Errorf("PostUserByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}

	c.JSON(http.StatusOK, userData)
}

func PutUserByID(c *gin.Context) {
	setCorsHeader(c)

	if !CheckAuth(c) {
		c.JSON(http.StatusNotFound, bson.M{})
		return
	}

	tenantId := c.Param("tenantId")
	if len(GetTenantById(tenantId)) == 0 {
		c.JSON(http.StatusNotFound, bson.M{})
		return
	}
	userId := c.Param("userId")

	var newUserData User
	if err := c.ShouldBindJSON(&newUserData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{})
		return
	}

	filterUserIdOnly := bson.M{"tenantId": tenantId, "userId": userId}
	userDataInterface, err := mongoapi.RestfulAPIGetOne(userDataColl, filterUserIdOnly)
	if err != nil {
		logger.ProcLog.Errorf("PutUserByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}
	if len(userDataInterface) == 0 {
		c.JSON(http.StatusNotFound, bson.M{})
		return
	}

	var userData User
	err = json.Unmarshal(mapToByte(userDataInterface), &userData)
	if err != nil {
		logger.ProcLog.Errorf("PutUserByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}

	if newUserData.Email != "" && newUserData.Email != userData.Email {
		filterEmail := bson.M{"email": newUserData.Email}
		sameEmailInterface, err := mongoapi.RestfulAPIGetOne(userDataColl, filterEmail)
		if err != nil {
			logger.ProcLog.Errorf("PutUserByID err: %+v", err)
			c.JSON(http.StatusInternalServerError, gin.H{})
			return
		}
		if len(sameEmailInterface) != 0 {
			c.JSON(http.StatusBadRequest, bson.M{})
			return
		}
		userData.Email = newUserData.Email
	}

	if newUserData.EncryptedPassword != "" {
		hash, err := bcrypt.GenerateFromPassword([]byte(newUserData.EncryptedPassword), 12)
		if err != nil {
			logger.ProcLog.Errorf("PutUserByID err: %+v", err)
			c.JSON(http.StatusInternalServerError, gin.H{})
			return
		}
		userData.EncryptedPassword = string(hash)
	}

	userBsonM := toBsonM(userData)
	if _, err := mongoapi.RestfulAPIPost(userDataColl, filterUserIdOnly, userBsonM); err != nil {
		logger.ProcLog.Errorf("PutUserByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}

	c.JSON(http.StatusOK, userData)
}

func DeleteUserByID(c *gin.Context) {
	setCorsHeader(c)

	if !CheckAuth(c) {
		c.JSON(http.StatusNotFound, bson.M{})
		return
	}

	tenantId := c.Param("tenantId")
	if len(GetTenantById(tenantId)) == 0 {
		c.JSON(http.StatusNotFound, bson.M{})
		return
	}
	userId := c.Param("userId")

	filterUserIdOnly := bson.M{"tenantId": tenantId, "userId": userId}
	if err := mongoapi.RestfulAPIDeleteOne(userDataColl, filterUserIdOnly); err != nil {
		logger.ProcLog.Errorf("DeleteUserByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}

// Get all subscribers list
func GetSubscribers(c *gin.Context) {
	setCorsHeader(c)

	logger.ProcLog.Infoln("Get All Subscribers List")

	tokenStr := c.GetHeader("Token")

	var claims jwt.MapClaims = nil
	var err error = nil
	if tokenStr != "admin" {
		claims, err = ParseJWT(tokenStr)
	}
	if err != nil {
		logger.ProcLog.Errorln(err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"cause": "Illegal Token",
		})
		return
	}

	var subsList []SubsListIE = make([]SubsListIE, 0)
	amDataList, err := mongoapi.RestfulAPIGetMany(amDataColl, bson.M{})
	if err != nil {
		logger.ProcLog.Errorf("GetSubscribers err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}
	for _, amData := range amDataList {
		ueId := amData["ueId"]
		servingPlmnId := amData["servingPlmnId"]
		msisdn := getMsisdn(amData["gpsis"])
		tenantId := amData["tenantId"]

		filterUeIdOnly := bson.M{"ueId": ueId}
		authSubsDataInterface, err := mongoapi.RestfulAPIGetOne(authSubsDataColl, filterUeIdOnly)
		if err != nil {
			logger.ProcLog.Errorf("GetSubscribers err: %+v", err)
			c.JSON(http.StatusInternalServerError, gin.H{})
			return
		}

		var authSubsData AuthSub
		err = json.Unmarshal(mapToByte(authSubsDataInterface), &authSubsData)
		if err != nil {
			logger.ProcLog.Errorf("GetSubscribers err: %+v", err)
			c.JSON(http.StatusInternalServerError, gin.H{})
			return
		}

		if tokenStr == "admin" || tenantId == claims["tenantId"].(string) {
			tmp := SubsListIE{
				PlmnID: servingPlmnId.(string),
				UeId:   ueId.(string),
				Msisdn: msisdn,
			}
			subsList = append(subsList, tmp)
		}
	}
	c.JSON(http.StatusOK, subsList)
}

// Get subscriber by IMSI(ueId) and PlmnID(servingPlmnId)
func GetSubscriberByID(c *gin.Context) {
	setCorsHeader(c)

	logger.ProcLog.Infoln("Get One Subscriber Data")

	var subsData SubsData

	ueId := c.Param("ueId")
	ueId = msisdnToSupi(ueId)
	servingPlmnId := c.Param("servingPlmnId")
	// checking whether msisdn is successfully transformed to supi or not
	if ueId == "" {
		logger.ProcLog.Errorf("GetSubscriberByID err: msisdn does not exists")
		c.JSON(http.StatusNotFound, gin.H{
			"cause": "msisdn does not exists",
		})
		return
	}
	filterUeIdOnly := bson.M{"ueId": ueId}
	filter := bson.M{"ueId": ueId, "servingPlmnId": servingPlmnId}

	authSubsDataInterface, err := mongoapi.RestfulAPIGetOne(authSubsDataColl, filterUeIdOnly)
	if err != nil {
		logger.ProcLog.Errorf("GetSubscriberByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}
	amDataDataInterface, err := mongoapi.RestfulAPIGetOne(amDataColl, filter)
	if err != nil {
		logger.ProcLog.Errorf("GetSubscriberByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}
	smDataDataInterface, err := mongoapi.RestfulAPIGetMany(smDataColl, filter)
	if err != nil {
		logger.ProcLog.Errorf("GetSubscriberByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}
	smfSelDataInterface, err := mongoapi.RestfulAPIGetOne(smfSelDataColl, filter)
	if err != nil {
		logger.ProcLog.Errorf("GetSubscriberByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}
	amPolicyDataInterface, err := mongoapi.RestfulAPIGetOne(amPolicyDataColl, filterUeIdOnly)
	if err != nil {
		logger.ProcLog.Errorf("GetSubscriberByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}
	smPolicyDataInterface, err := mongoapi.RestfulAPIGetOne(smPolicyDataColl, filterUeIdOnly)
	if err != nil {
		logger.ProcLog.Errorf("GetSubscriberByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}
	flowRuleDataInterface, err := mongoapi.RestfulAPIGetMany(flowRuleDataColl, filter)
	if err != nil {
		logger.ProcLog.Errorf("GetSubscriberByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}
	qosFlowInterface, err := mongoapi.RestfulAPIGetMany(qosFlowDataColl, filter)
	if err != nil {
		logger.ProcLog.Errorf("GetSubscriberByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}

	var authSubsData models.AuthenticationSubscription
	if err := json.Unmarshal(mapToByte(authSubsDataInterface), &authSubsData); err != nil {
		logger.ProcLog.Errorf("GetSubscriberByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}
	var amDataData models.AccessAndMobilitySubscriptionData
	if err := json.Unmarshal(mapToByte(amDataDataInterface), &amDataData); err != nil {
		logger.ProcLog.Errorf("GetSubscriberByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}
	var smDataData []models.SessionManagementSubscriptionData
	if err := json.Unmarshal(sliceToByte(smDataDataInterface), &smDataData); err != nil {
		logger.ProcLog.Errorf("GetSubscriberByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}
	var smfSelData models.SmfSelectionSubscriptionData
	if err := json.Unmarshal(mapToByte(smfSelDataInterface), &smfSelData); err != nil {
		logger.ProcLog.Errorf("GetSubscriberByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}
	var amPolicyData models.AmPolicyData
	if err := json.Unmarshal(mapToByte(amPolicyDataInterface), &amPolicyData); err != nil {
		logger.ProcLog.Errorf("GetSubscriberByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}
	var smPolicyData models.SmPolicyData
	if err := json.Unmarshal(mapToByte(smPolicyDataInterface), &smPolicyData); err != nil {
		logger.ProcLog.Errorf("GetSubscriberByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}
	var flowRules []FlowRule
	if err := json.Unmarshal(sliceToByte(flowRuleDataInterface), &flowRules); err != nil {
		logger.ProcLog.Errorf("GetSubscriberByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}
	var qosFlows []QosFlow
	if err := json.Unmarshal(sliceToByte(qosFlowInterface), &qosFlows); err != nil {
		logger.ProcLog.Errorf("GetSubscriberByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}

	if flowRules == nil {
		flowRules = make([]FlowRule, 0)
	}
	if qosFlows == nil {
		qosFlows = make([]QosFlow, 0)
	}

	for key, SnssaiData := range smPolicyData.SmPolicySnssaiData {
		tmpSmPolicyDnnData := make(map[string]models.SmPolicyDnnData)
		for escapedDnn, dnn := range SnssaiData.SmPolicyDnnData {
			dnnKey := UnescapeDnn(escapedDnn)
			tmpSmPolicyDnnData[dnnKey] = dnn
		}
		SnssaiData.SmPolicyDnnData = tmpSmPolicyDnnData
		smPolicyData.SmPolicySnssaiData[key] = SnssaiData
	}

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
		QosFlows:                          qosFlows,
	}

	c.JSON(http.StatusOK, subsData)
}

// Post subscriber by IMSI(ueId) and PlmnID(servingPlmnId)
// PostSubscriberByID godoc
// @Summary     CreateSubscriberByID
// @Description Create subscriber by IMSI(ueId) and PlmnID(servingPlmnId)
// @Accept       json
// @Produce      json
// @Param ueId path string true "imsi"
// @Param servingPlmnId path string true "servingPlmnId"
// @Param subdata body SubsData true "sub data"
// @Success      201 "Create subscription success"
// @Failure 400 {object} HTTPError "JSON format incorrect"
// @Router  /subscriber/{ueId}/{servingPlmnId}/{userNumber} [post]
func PostSubscriberByID(c *gin.Context) {
	setCorsHeader(c)
	logger.ProcLog.Infoln("Post One Subscriber Data")

	var claims jwt.MapClaims = nil
	var err error = nil
	tokenStr := c.GetHeader("Token")

	if tokenStr != "admin" {
		claims, err = ParseJWT(tokenStr)
	}
	if err != nil {
		logger.ProcLog.Errorln(err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"cause": "Illegal Token",
		})
		return
	}

	var subsData SubsData
	err = c.ShouldBindJSON(&subsData)
	if err != nil {
		logger.ProcLog.Errorf("PostSubscriberByID err: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"cause": "JSON format incorrect",
		})
		return
	}
	ueId := strings.Split(c.Param("ueId"), "-")[1]
	servingPlmnId := c.Param("servingPlmnId")
	userNumber := c.Param("userNumber")
	if userNumber == "" {
		userNumber = "1"
	}
	userNumberTemp, err := strconv.Atoi(userNumber)
	if err != nil {
		logger.ProcLog.Errorf("PostSubscriberByID err: %+v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"cause": "userNumber format incorrect",
		})
		return
	}
	msisdn := getMsisdn(toBsonM(subsData.AccessAndMobilitySubscriptionData)["gpsis"])
	msisdnTemp := 0
	if msisdn != "" {
		msisdnTemp, err = strconv.Atoi(msisdn)
		if err != nil {
			logger.ProcLog.Errorf("PostSubscriberByID err: %+v", err)
			c.JSON(http.StatusBadRequest, gin.H{
				"cause": "msisdn format incorrect",
			})
			return
		}
	}

	ueIdTemp, err := strconv.Atoi(ueId)
	if err != nil {
		logger.ProcLog.Errorf("PostSubscriberByID err: %+v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"cause": "ueId format incorrect",
		})
		return
	}

	for i := 0; i < userNumberTemp; i++ {
		ueId = fmt.Sprintf("imsi-%015d", ueIdTemp)
		if msisdnTemp != 0 {
			if !validate(ueId, msisdn) {
				logger.ProcLog.Errorf("duplicate msisdn: %v", msisdn)
				c.JSON(http.StatusBadRequest, gin.H{
					"cause": "duplicate msisdn",
				})
				return
			}
			msisdnTemp += 1
		}
		ueIdTemp += 1

		subsData.AccessAndMobilitySubscriptionData.Gpsis[0] = "msisdn-" + msisdn
		// create a msisdn-supi map
		logger.ProcLog.Infof("PostSubscriberByID msisdn: %+v", msisdn)
		msisdnSupiMapOperation(ueId, msisdn, "post")
		filterUeIdOnly := bson.M{"ueId": ueId}

		// Lookup same UE ID of other tenant's subscription.
		if claims != nil {
			authSubsDataInterface, err := mongoapi.RestfulAPIGetOne(authSubsDataColl, filterUeIdOnly)
			if err != nil {
				logger.ProcLog.Errorf("PostSubscriberByID err: %+v", err)
				c.JSON(http.StatusInternalServerError, gin.H{})
				return
			}
			if len(authSubsDataInterface) > 0 {
				if authSubsDataInterface["tenantId"].(string) != claims["tenantId"].(string) {
					c.JSON(http.StatusUnprocessableEntity, gin.H{})
					return
				}
			}
		}
		dbOperation(ueId, servingPlmnId, "post", &subsData, claims)
	}
	c.JSON(http.StatusCreated, gin.H{})
}

func validate(supi string, msisdn string) bool {
	filter := bson.M{"msisdn": msisdn}
	msisdnSupiMap, err := mongoapi.RestfulAPIGetOne(msisdnSupiMapColl, filter)
	if err != nil {
		logger.ProcLog.Errorf("GetSubscriberByID err: %+v", err)
	}
	if msisdnSupiMap != nil && msisdnSupiMap["ueId"] != supi {
		return false
	} else {
		return true
	}
}

func msisdnSupiMapOperation(supi string, msisdn string, method string) {
	filter := bson.M{"ueId": supi}
	data := bson.M{"ueId": supi, "msisdn": msisdn}

	if method == "put" || method == "post" {
		if msisdn != "" {
			if _, err := mongoapi.RestfulAPIPutOne(msisdnSupiMapColl, filter, data); err != nil {
				logger.ProcLog.Errorf("PutMsisdnSupiMap err: %+v", err)
			}
		} else {
			// delete
			if err := mongoapi.RestfulAPIDeleteOne(msisdnSupiMapColl, filter); err != nil {
				logger.ProcLog.Errorf("DeleteMsisdnSupiMap err: %+v", err)
			}
		}
	}
}

func dbOperation(ueId string, servingPlmnId string, method string, subsData *SubsData, claims jwt.MapClaims) {
	filterUeIdOnly := bson.M{"ueId": ueId}
	filter := bson.M{"ueId": ueId, "servingPlmnId": servingPlmnId}

	// Replace all data with new one
	if method == "put" {
		if err := mongoapi.RestfulAPIDeleteMany(flowRuleDataColl, filter); err != nil {
			logger.ProcLog.Errorf("PutSubscriberByID err: %+v", err)
		}
		if err := mongoapi.RestfulAPIDeleteMany(qosFlowDataColl, filter); err != nil {
			logger.ProcLog.Errorf("PutSubscriberByID err: %+v", err)
		}
	} else if method == "delete" {
		if err := mongoapi.RestfulAPIDeleteOne(authSubsDataColl, filterUeIdOnly); err != nil {
			logger.ProcLog.Errorf("DeleteSubscriberByID err: %+v", err)
		}
		if err := mongoapi.RestfulAPIDeleteOne(amDataColl, filter); err != nil {
			logger.ProcLog.Errorf("DeleteSubscriberByID err: %+v", err)
		}
		if err := mongoapi.RestfulAPIDeleteMany(smDataColl, filter); err != nil {
			logger.ProcLog.Errorf("DeleteSubscriberByID err: %+v", err)
		}
		if err := mongoapi.RestfulAPIDeleteMany(flowRuleDataColl, filter); err != nil {
			logger.ProcLog.Errorf("DeleteSubscriberByID err: %+v", err)
		}
		if err := mongoapi.RestfulAPIDeleteOne(smfSelDataColl, filter); err != nil {
			logger.ProcLog.Errorf("DeleteSubscriberByID err: %+v", err)
		}
		if err := mongoapi.RestfulAPIDeleteOne(amPolicyDataColl, filterUeIdOnly); err != nil {
			logger.ProcLog.Errorf("DeleteSubscriberByID err: %+v", err)
		}
		if err := mongoapi.RestfulAPIDeleteOne(smPolicyDataColl, filterUeIdOnly); err != nil {
			logger.ProcLog.Errorf("DeleteSubscriberByID err: %+v", err)
		}
		if err := mongoapi.RestfulAPIDeleteMany(qosFlowDataColl, filter); err != nil {
			logger.ProcLog.Errorf("DeleteSubscriberByID err: %+v", err)
		}
		if err := mongoapi.RestfulAPIDeleteOne(msisdnSupiMapColl, filterUeIdOnly); err != nil {
			logger.ProcLog.Errorf("DeleteMsisdnSupiMap err: %+v", err)
		}
	}
	if method == "post" || method == "put" {
		authSubsBsonM := toBsonM(subsData.AuthenticationSubscription)
		authSubsBsonM["ueId"] = ueId
		if claims != nil {
			authSubsBsonM["tenantId"] = claims["tenantId"].(string)
		}
		amDataBsonM := toBsonM(subsData.AccessAndMobilitySubscriptionData)
		amDataBsonM["ueId"] = ueId
		amDataBsonM["servingPlmnId"] = servingPlmnId
		if claims != nil {
			amDataBsonM["tenantId"] = claims["tenantId"].(string)
		}

		// Replace all data with new one
		if err := mongoapi.RestfulAPIDeleteMany(smDataColl, filter); err != nil {
			logger.ProcLog.Errorf("PutSubscriberByID err: %+v", err)
		}
		for _, data := range subsData.SessionManagementSubscriptionData {
			smDataBsonM := toBsonM(data)
			smDataBsonM["ueId"] = ueId
			smDataBsonM["servingPlmnId"] = servingPlmnId
			filterSmData := bson.M{"ueId": ueId, "servingPlmnId": servingPlmnId, "snssai": data.SingleNssai}
			if _, err := mongoapi.RestfulAPIPutOne(smDataColl, filterSmData, smDataBsonM); err != nil {
				logger.ProcLog.Errorf("PutSubscriberByID err: %+v", err)
			}
		}

		for key, SnssaiData := range subsData.SmPolicyData.SmPolicySnssaiData {
			tmpSmPolicyDnnData := make(map[string]models.SmPolicyDnnData)
			for dnnKey, dnn := range SnssaiData.SmPolicyDnnData {
				escapedDnn := EscapeDnn(dnnKey)
				tmpSmPolicyDnnData[escapedDnn] = dnn
			}
			SnssaiData.SmPolicyDnnData = tmpSmPolicyDnnData
			subsData.SmPolicyData.SmPolicySnssaiData[key] = SnssaiData
		}

		smfSelSubsBsonM := toBsonM(subsData.SmfSelectionSubscriptionData)
		smfSelSubsBsonM["ueId"] = ueId
		smfSelSubsBsonM["servingPlmnId"] = servingPlmnId
		amPolicyDataBsonM := toBsonM(subsData.AmPolicyData)
		amPolicyDataBsonM["ueId"] = ueId
		smPolicyDataBsonM := toBsonM(subsData.SmPolicyData)
		smPolicyDataBsonM["ueId"] = ueId

		if len(subsData.FlowRules) == 0 {
			logger.ProcLog.Infoln("No Flow Rule")
		} else {
			flowRulesBsonA := make([]interface{}, 0, len(subsData.FlowRules))
			for _, flowRule := range subsData.FlowRules {
				flowRuleBsonM := toBsonM(flowRule)
				flowRuleBsonM["ueId"] = ueId
				flowRuleBsonM["servingPlmnId"] = servingPlmnId
				flowRulesBsonA = append(flowRulesBsonA, flowRuleBsonM)
			}
			if err := mongoapi.RestfulAPIPostMany(flowRuleDataColl, filter, flowRulesBsonA); err != nil {
				logger.ProcLog.Errorf("PutSubscriberByID err: %+v", err)
			}
		}

		if len(subsData.QosFlows) == 0 {
			logger.ProcLog.Infoln("No QoS Flow")
		} else {
			qosFlowBsonA := make([]interface{}, 0, len(subsData.QosFlows))
			for _, qosFlow := range subsData.QosFlows {
				qosFlowBsonM := toBsonM(qosFlow)
				qosFlowBsonM["ueId"] = ueId
				qosFlowBsonM["servingPlmnId"] = servingPlmnId
				qosFlowBsonA = append(qosFlowBsonA, qosFlowBsonM)
			}
			if err := mongoapi.RestfulAPIPostMany(qosFlowDataColl, filter, qosFlowBsonA); err != nil {
				logger.ProcLog.Errorf("PostSubscriberByID err: %+v", err)
			}
		}

		if _, err := mongoapi.RestfulAPIPutOne(authSubsDataColl, filterUeIdOnly, authSubsBsonM); err != nil {
			logger.ProcLog.Errorf("PutSubscriberByID err: %+v", err)
		}
		if _, err := mongoapi.RestfulAPIPutOne(amDataColl, filter, amDataBsonM); err != nil {
			logger.ProcLog.Errorf("PutSubscriberByID err: %+v", err)
		}
		if _, err := mongoapi.RestfulAPIPutOne(smfSelDataColl, filter, smfSelSubsBsonM); err != nil {
			logger.ProcLog.Errorf("PutSubscriberByID err: %+v", err)
		}
		if _, err := mongoapi.RestfulAPIPutOne(amPolicyDataColl, filterUeIdOnly, amPolicyDataBsonM); err != nil {
			logger.ProcLog.Errorf("PutSubscriberByID err: %+v", err)
		}
		if _, err := mongoapi.RestfulAPIPutOne(smPolicyDataColl, filterUeIdOnly, smPolicyDataBsonM); err != nil {
			logger.ProcLog.Errorf("PutSubscriberByID err: %+v", err)
		}
	}
}

// Put subscriber by IMSI(ueId) and PlmnID(servingPlmnId)
func PutSubscriberByID(c *gin.Context) {
	setCorsHeader(c)
	logger.ProcLog.Infoln("Put One Subscriber Data")
	var subsData SubsData
	if err := c.ShouldBindJSON(&subsData); err != nil {
		logger.ProcLog.Errorf("PutSubscriberByID err: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"cause": "JSON format incorrect",
		})
		return
	}
	ueId := c.Param("ueId")
	servingPlmnId := c.Param("servingPlmnId")
	// modify a msisdn-supi map
	msisdn := getMsisdn(toBsonM(subsData.AccessAndMobilitySubscriptionData)["gpsis"])
	if !validate(ueId, msisdn) {
		logger.ProcLog.Errorf("duplicate msisdn: %v", msisdn)
		c.JSON(http.StatusBadRequest, gin.H{
			"cause": "duplicate msisdn",
		})
		return
	}

	logger.ProcLog.Infof("PutSubscriberByID msisdn: %+v", msisdn)
	msisdnSupiMapOperation(ueId, msisdn, "put")

	var claims jwt.MapClaims = nil
	dbOperation(ueId, servingPlmnId, "put", &subsData, claims)
	c.JSON(http.StatusNoContent, gin.H{})
}

// Patch subscriber by IMSI(ueId) and PlmnID(servingPlmnId)
func PatchSubscriberByID(c *gin.Context) {
	setCorsHeader(c)
	logger.ProcLog.Infoln("Patch One Subscriber Data")

	var subsData SubsData
	if err := c.ShouldBindJSON(&subsData); err != nil {
		logger.ProcLog.Errorf("PatchSubscriberByID err: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"cause": "JSON format incorrect",
		})
		return
	}

	ueId := c.Param("ueId")
	ueId = msisdnToSupi(ueId)
	servingPlmnId := c.Param("servingPlmnId")
	// checking whether msisdn is successfully transformed to supi or not
	if ueId == "" {
		logger.ProcLog.Errorf("PatchSubscriberByID err: msisdn does not exists")
		c.JSON(http.StatusNotFound, gin.H{
			"cause": "msisdn does not exists",
		})
		return
	}
	filterUeIdOnly := bson.M{"ueId": ueId}
	filter := bson.M{"ueId": ueId, "servingPlmnId": servingPlmnId}

	authSubsBsonM := toBsonM(subsData.AuthenticationSubscription)
	authSubsBsonM["ueId"] = ueId
	amDataBsonM := toBsonM(subsData.AccessAndMobilitySubscriptionData)
	amDataBsonM["ueId"] = ueId
	amDataBsonM["servingPlmnId"] = servingPlmnId

	// Replace all data with new one
	if err := mongoapi.RestfulAPIDeleteMany(smDataColl, filter); err != nil {
		logger.ProcLog.Errorf("PatchSubscriberByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}
	for _, data := range subsData.SessionManagementSubscriptionData {
		smDataBsonM := toBsonM(data)
		smDataBsonM["ueId"] = ueId
		smDataBsonM["servingPlmnId"] = servingPlmnId
		filterSmData := bson.M{"ueId": ueId, "servingPlmnId": servingPlmnId, "snssai": data.SingleNssai}
		if err := mongoapi.RestfulAPIMergePatch(smDataColl, filterSmData, smDataBsonM); err != nil {
			logger.ProcLog.Errorf("PatchSubscriberByID err: %+v", err)
			c.JSON(http.StatusInternalServerError, gin.H{})
			return
		}
	}

	smfSelSubsBsonM := toBsonM(subsData.SmfSelectionSubscriptionData)
	smfSelSubsBsonM["ueId"] = ueId
	smfSelSubsBsonM["servingPlmnId"] = servingPlmnId
	amPolicyDataBsonM := toBsonM(subsData.AmPolicyData)
	amPolicyDataBsonM["ueId"] = ueId
	smPolicyDataBsonM := toBsonM(subsData.SmPolicyData)
	smPolicyDataBsonM["ueId"] = ueId

	if err := mongoapi.RestfulAPIMergePatch(authSubsDataColl, filterUeIdOnly, authSubsBsonM); err != nil {
		logger.ProcLog.Errorf("PatchSubscriberByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}
	if err := mongoapi.RestfulAPIMergePatch(amDataColl, filter, amDataBsonM); err != nil {
		logger.ProcLog.Errorf("PatchSubscriberByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}
	if err := mongoapi.RestfulAPIMergePatch(smfSelDataColl, filter, smfSelSubsBsonM); err != nil {
		logger.ProcLog.Errorf("PatchSubscriberByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}
	if err := mongoapi.RestfulAPIMergePatch(amPolicyDataColl, filterUeIdOnly, amPolicyDataBsonM); err != nil {
		logger.ProcLog.Errorf("PatchSubscriberByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}
	if err := mongoapi.RestfulAPIMergePatch(smPolicyDataColl, filterUeIdOnly, smPolicyDataBsonM); err != nil {
		logger.ProcLog.Errorf("PatchSubscriberByID err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}

	c.JSON(http.StatusNoContent, gin.H{})
}

// Delete subscriber by IMSI(ueId) and PlmnID(servingPlmnId)
func DeleteSubscriberByID(c *gin.Context) {
	setCorsHeader(c)
	logger.ProcLog.Infoln("Delete One Subscriber Data")
	ueId := c.Param("ueId")
	ueId = msisdnToSupi(ueId)
	servingPlmnId := c.Param("servingPlmnId")
	// checking whether msisdn is successfully transformed to supi or not
	if ueId == "" {
		logger.ProcLog.Errorf("DeleteSubscriberByID err: msisdn does not exists")
		c.JSON(http.StatusNotFound, gin.H{
			"cause": "msisdn does not exists",
		})
		return
	}
	var claims jwt.MapClaims = nil
	dbOperation(ueId, servingPlmnId, "delete", nil, claims)
	c.JSON(http.StatusNoContent, gin.H{})
}

func GetRegisteredUEContext(c *gin.Context) {
	setCorsHeader(c)

	logger.ProcLog.Infoln("Get Registered UE Context")

	webuiSelf := webui_context.GetSelf()
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

		req, err := http.NewRequestWithContext(context.Background(), http.MethodGet, requestUri, nil)
		if err != nil {
			logger.ProcLog.Error(err)
			c.JSON(http.StatusInternalServerError, gin.H{})
			return
		}
		resp, err := httpsClient.Do(req)
		if err != nil {
			logger.ProcLog.Error(err)
			c.JSON(http.StatusInternalServerError, gin.H{})
			return
		}
		defer func() {
			if closeErr := resp.Body.Close(); closeErr != nil {
				logger.ProcLog.Error(closeErr)
			}
		}()

		// Filter by tenant.
		tenantId, err := GetTenantId(c)
		if err != nil {
			logger.ProcLog.Errorln(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"cause": "Illegal Token",
			})
			return
		}

		if tenantId == "" {
			sendResponseToClient(c, resp)
		} else {
			sendResponseToClientFilterTenant(c, resp, tenantId)
		}
	} else {
		c.JSON(http.StatusInternalServerError, gin.H{
			"cause": "No AMF Found",
		})
	}
}

func GetUEPDUSessionInfo(c *gin.Context) {
	setCorsHeader(c)

	logger.ProcLog.Infoln("Get UE PDU Session Info")

	webuiSelf := webui_context.GetSelf()
	webuiSelf.UpdateNfProfiles()

	smContextRef, smContextRefExists := c.Params.Get("smContextRef")
	if !smContextRefExists {
		c.JSON(http.StatusBadRequest, gin.H{})
		return
	}

	// TODO: support fetching data from multiple SMF
	if smfUris := webuiSelf.GetOamUris(models.NfType_SMF); smfUris != nil {
		requestUri := fmt.Sprintf("%s/nsmf-oam/v1/ue-pdu-session-info/%s", smfUris[0], smContextRef)
		req, err := http.NewRequestWithContext(context.Background(), http.MethodGet, requestUri, nil)
		if err != nil {
			logger.ProcLog.Error(err)
			c.JSON(http.StatusInternalServerError, gin.H{})
			return
		}
		resp, err := httpsClient.Do(req)
		if err != nil {
			logger.ProcLog.Error(err)
			c.JSON(http.StatusInternalServerError, gin.H{})
			return
		}
		defer func() {
			if closeErr := resp.Body.Close(); closeErr != nil {
				logger.ProcLog.Error(closeErr)
			}
		}()

		sendResponseToClient(c, resp)
	} else {
		c.JSON(http.StatusInternalServerError, gin.H{
			"cause": "No SMF Found",
		})
	}
}
