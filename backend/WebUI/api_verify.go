package WebUI

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/netip"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"

	"github.com/free5gc/openapi/models"
	smf_factory "github.com/free5gc/smf/pkg/factory"
	"github.com/free5gc/util/mongoapi"
	"github.com/free5gc/webconsole/backend/logger"
	"github.com/free5gc/webconsole/backend/webui_context"
)

type VerifyScope struct {
	Supi   string `json:"supi"`
	Sd     string `json:"sd"`
	Sst    int    `json:"sst"`
	Dnn    string `json:"dnn"`
	Ipaddr string `json:"ipaddr"`
}

func GetSmfUserPlaneInfo() (interface{}, error) {
	logger.ProcLog.Infoln("Get SMF UserPlane Info")

	webuiSelf := webui_context.GetSelf()
	webuiSelf.UpdateNfProfiles()

	ctx, _, err := webuiSelf.GetTokenCtx(models.ServiceName_NSMF_OAM, models.NfType_SMF)
	if err != nil {
		logger.ConsumerLog.Infof("GetTokenCtx: service %v, err: %+v", models.ServiceName_NSMF_OAM, err)
	}

	var jsonData interface{}

	// TODO: support fetching data from multiple SMF
	if smfUris := webuiSelf.GetOamUris(models.NfType_SMF); smfUris != nil {
		requestUri := fmt.Sprintf("%s/nsmf-oam/v1/user-plane-info/", smfUris[0])
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, requestUri, nil)
		if err != nil {
			logger.ProcLog.Error(err)
			return jsonData, err
		}
		resp, err := httpsClient.Do(req)
		if err != nil {
			logger.ProcLog.Error(err)
			return jsonData, err
		}
		defer func() {
			if closeErr := resp.Body.Close(); closeErr != nil {
				logger.ProcLog.Error(closeErr)
			}
		}()

		json_err := json.NewDecoder(resp.Body).Decode(&jsonData)
		if json_err != nil {
			logger.ProcLog.Errorf("Decode Json err: %+v", err)
		}
		return jsonData, err
	} else {
		logger.ProcLog.Error("No SMF Found")
	}
	return jsonData, nil
}

func getDnnStaticIpPool(snssai models.Snssai, dnn string) (netip.Prefix, error) {
	var userplaneinfo smf_factory.UserPlaneInformation

	raw_info, get_err := GetSmfUserPlaneInfo()
	if get_err != nil {
		logger.ProcLog.Errorf("GetSmfUserPlaneInfo(): %+v", get_err)
		return netip.ParsePrefix("0.0.0.0/32")
	}

	tmp, err := json.Marshal(raw_info)
	if err != nil {
		logger.ProcLog.Errorf("Marshal err: %+v", err)
	}
	unmarshal_err := json.Unmarshal(tmp, &userplaneinfo)
	if unmarshal_err != nil {
		logger.ProcLog.Errorf("Unmarshal err: %+v", unmarshal_err)
	}

	for nodeName := range userplaneinfo.UPNodes {
		if nodeName == "UPF" {
			// Find the UPF node
			for _, snssaiupfinfo := range userplaneinfo.UPNodes[nodeName].SNssaiInfos {
				// Find the Slice (snssai)
				if *snssaiupfinfo.SNssai == snssai {
					for _, dnnInfo := range snssaiupfinfo.DnnUpfInfoList {
						// Find the DNN name
						if dnnInfo.Dnn == dnn {
							if len(dnnInfo.StaticPools) > 0 {
								staticPoolstr := dnnInfo.StaticPools[0].Cidr
								return netip.ParsePrefix(staticPoolstr)
							}
							// If there is no static pool, return smallest
							return netip.ParsePrefix("0.0.0.0/32")
						}
					}
				}
			}
		}
	}
	return netip.ParsePrefix("0.0.0.0/32")
}

func VerifyStaticIP(c *gin.Context) {
	logger.ProcLog.Info("Verify StaticIP")
	setCorsHeader(c)

	if !CheckAuth(c) {
		c.JSON(http.StatusUnauthorized, gin.H{"cause": "Illegal Token"})
		return
	}

	var checkData VerifyScope
	if err := c.ShouldBindJSON(&checkData); err != nil {
		logger.ProcLog.Errorln(err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"valid": false,
			"cause": err.Error(),
		})
		return
	}

	staticIp, parse_err := netip.ParseAddr(checkData.Ipaddr)
	if parse_err != nil {
		logger.ProcLog.Errorln(parse_err.Error())
		c.JSON(http.StatusOK, gin.H{
			"valid": false,
			"cause": parse_err.Error(),
		})
		return
	}
	logger.ProcLog.Debugln("check IP address:", staticIp)

	snssai := models.Snssai{
		Sd:  checkData.Sd,
		Sst: int32(checkData.Sst),
	}

	staticPool, get_pool_err := getDnnStaticIpPool(snssai, checkData.Dnn)
	if get_pool_err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  get_pool_err,
			"ipaddr": staticIp,
			"valid":  false,
			"cause":  get_pool_err.Error(),
		})
		return
	}

	// Check in Static Pool
	result := staticPool.Contains(staticIp)
	if !result {
		c.JSON(http.StatusOK, gin.H{
			"ipaddr": staticIp,
			"valid":  result,
			"cause":  "Not in static pool: " + staticPool.String(),
		})
		logger.ProcLog.Debugln("StaticIP", staticIp, ": not in static pool: "+staticPool.String())
		return
	}

	// Check not used by other UE
	smDataColl := "subscriptionData.provisionedData.smData"
	filter := bson.M{
		"singleNssai": snssai,
		"ueId":        bson.D{{Key: "$ne", Value: checkData.Supi}}, // not this UE
	}
	smDataDataInterface, mongo_err := mongoapi.RestfulAPIGetMany(smDataColl, filter)
	if mongo_err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"ipaddr": staticIp,
			"valid":  false,
			"cause":  mongo_err.Error(),
		})
	}
	var smDatas []models.SessionManagementSubscriptionData
	if err := json.Unmarshal(sliceToByte(smDataDataInterface), &smDatas); err != nil {
		logger.ProcLog.Errorf("Unmarshal smDatas err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return
	}
	for _, smData := range smDatas {
		if dnnConfig, ok := smData.DnnConfigurations[checkData.Dnn]; ok {
			for _, ipData := range dnnConfig.StaticIpAddress {
				if checkData.Ipaddr == ipData.Ipv4Addr {
					msg := "StaticIP: " + checkData.Ipaddr + " has already exist!"
					logger.ProcLog.Warningln(msg)
					c.JSON(http.StatusOK, gin.H{
						"ipaddr": staticIp,
						"valid":  false,
						"cause":  msg,
					})
					return
				}
			}
		}
	}

	// Return the result
	c.JSON(http.StatusOK, gin.H{
		"ipaddr": staticIp,
		"valid":  result,
		"cause":  "",
	})
}
