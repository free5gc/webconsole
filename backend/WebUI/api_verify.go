package WebUI

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/netip"
	"sort"

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
	Sd     string `json:"sd,omitempty"`
	Sst    int    `json:"sst"`
	Dnn    string `json:"dnn"`
	Ipaddr string `json:"ipaddr"`
}

var errInvalidStaticIP = errors.New("invalid static IPv4 address")

const (
	responseCause      = "cause"
	singleNssaiSDField = "singleNssai.sd"
)

type staticIPPoolProvider func(models.Snssai, string) ([]netip.Prefix, error)

type staticIPPoolCacheKey struct {
	snssai models.Snssai
	dnn    string
}

func GetSmfUserPlaneInfo() (interface{}, error) {
	logger.ProcLog.Infoln("Get SMF UserPlane Info")

	webuiSelf := webui_context.GetSelf()
	webuiSelf.UpdateNfProfiles()

	var jsonData interface{}

	// TODO: support fetching data from multiple SMF
	if smfUris := webuiSelf.GetOamUris(models.NrfNfManagementNfType_SMF); len(smfUris) > 0 {
		requestUri := fmt.Sprintf("%s/nsmf-oam/v1/user-plane-info/", smfUris[0])

		ctx, pd, err := webuiSelf.GetTokenCtx(models.ServiceName_NSMF_OAM, models.NrfNfManagementNfType_SMF)
		if err != nil {
			logger.ConsumerLog.Infof("GetTokenCtx: service %v, err: %+v", models.ServiceName_NSMF_OAM, err)
			return pd, err
		}

		req, err_req := http.NewRequestWithContext(ctx, http.MethodGet, requestUri, nil)
		if err_req != nil {
			logger.ProcLog.Error(err_req)
			return jsonData, err_req
		}

		if err = webui_context.GetSelf().RequestBindToken(req, ctx); err != nil {
			logger.ProcLog.Error(err)
			return jsonData, err
		}

		resp, err_rsp := httpsClient.Do(req)
		if err_rsp != nil {
			logger.ProcLog.Error(err_rsp)
			return jsonData, err_rsp
		}
		defer func() {
			if closeErr := resp.Body.Close(); closeErr != nil {
				logger.ProcLog.Error(closeErr)
			}
		}()

		if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
			return nil, fmt.Errorf("SMF user-plane info request returned status %s", resp.Status)
		}

		if decodeErr := json.NewDecoder(resp.Body).Decode(&jsonData); decodeErr != nil {
			logger.ProcLog.Errorf("Decode Json err: %+v", decodeErr)
			return nil, decodeErr
		}
		return jsonData, nil
	}

	err := errors.New("no SMF found")
	logger.ProcLog.Error(err)
	return nil, err
}

func GetStaticIpPoolsFromUserPlaneInfomation(
	userplaneinfo *smf_factory.UserPlaneInformation,
	snssai models.Snssai,
	dnn string,
) ([]netip.Prefix, error) {
	poolSet := make(map[netip.Prefix]struct{})

	for _, node := range userplaneinfo.UPNodes {
		if node != nil && node.Type == "UPF" {
			// Find the UPF node
			for _, snssaiupfinfo := range node.SNssaiInfos {
				// Find the Slice (snssai)
				if snssaiupfinfo != nil &&
					snssaiupfinfo.SNssai != nil &&
					*snssaiupfinfo.SNssai == snssai {
					for _, dnnInfo := range snssaiupfinfo.DnnUpfInfoList {
						// Find the DNN name
						if dnnInfo != nil && dnnInfo.Dnn == dnn {
							for _, pool := range dnnInfo.StaticPools {
								if pool == nil {
									return nil, fmt.Errorf(
										"nil static IP pool for S-NSSAI %+v and DNN %q",
										snssai,
										dnn,
									)
								}
								prefix, parseErr := netip.ParsePrefix(pool.Cidr)
								if parseErr != nil {
									return nil, fmt.Errorf(
										"parse static IP pool %q for S-NSSAI %+v and DNN %q: %w",
										pool.Cidr,
										snssai,
										dnn,
										parseErr,
									)
								}
								poolSet[prefix.Masked()] = struct{}{}
							}
						}
					}
				}
			}
		}
	}

	result := make([]netip.Prefix, 0, len(poolSet))
	for pool := range poolSet {
		result = append(result, pool)
	}
	sort.Slice(result, func(i, j int) bool {
		return result[i].String() < result[j].String()
	})
	return result, nil
}

func getDnnStaticIpPools(snssai models.Snssai, dnn string) ([]netip.Prefix, error) {
	var userplaneinfo smf_factory.UserPlaneInformation

	raw_info, get_err := GetSmfUserPlaneInfo()
	if get_err != nil {
		logger.ProcLog.Errorf("GetSmfUserPlaneInfo(): %+v", get_err)
		return []netip.Prefix{}, get_err
	}

	tmp, err := json.Marshal(raw_info)
	if err != nil {
		logger.ProcLog.Errorf("Marshal err: %+v", err)
		return nil, err
	}
	if unmarshalErr := json.Unmarshal(tmp, &userplaneinfo); unmarshalErr != nil {
		logger.ProcLog.Errorf("Unmarshal err: %+v", unmarshalErr)
		return nil, unmarshalErr
	}

	return GetStaticIpPoolsFromUserPlaneInfomation(&userplaneinfo, snssai, dnn)
}

func validateStaticIPv4InPools(address string, staticPools []netip.Prefix) error {
	staticIP, err := netip.ParseAddr(address)
	if err != nil {
		return fmt.Errorf("%w %q: %v", errInvalidStaticIP, address, err)
	}
	if !staticIP.Is4() {
		return fmt.Errorf("%w %q: address is not IPv4", errInvalidStaticIP, address)
	}
	if len(staticPools) == 0 {
		return fmt.Errorf("%w %q: no static IP pool is configured", errInvalidStaticIP, address)
	}

	for _, staticPool := range staticPools {
		if staticPool.Contains(staticIP) {
			return nil
		}
	}

	return fmt.Errorf("%w %q: address is not in any static IP pool", errInvalidStaticIP, address)
}

func validateSubscriberStaticIPs(
	smData []models.SessionManagementSubscriptionData,
	poolProvider staticIPPoolProvider,
) error {
	poolCache := make(map[staticIPPoolCacheKey][]netip.Prefix)

	for _, sessionData := range smData {
		for dnn, dnnConfig := range sessionData.DnnConfigurations {
			if len(dnnConfig.StaticIpAddress) == 0 {
				continue
			}
			if sessionData.SingleNssai == nil {
				return fmt.Errorf(
					"%w for DNN %q: S-NSSAI is required",
					errInvalidStaticIP,
					dnn,
				)
			}

			key := staticIPPoolCacheKey{
				snssai: *sessionData.SingleNssai,
				dnn:    dnn,
			}
			for _, staticAddress := range dnnConfig.StaticIpAddress {
				if staticAddress.Ipv4Addr == "" {
					return fmt.Errorf(
						"%w for S-NSSAI %+v and DNN %q: IPv4 address is required",
						errInvalidStaticIP,
						key.snssai,
						dnn,
					)
				}
				if _, parseErr := netip.ParseAddr(staticAddress.Ipv4Addr); parseErr != nil {
					return fmt.Errorf(
						"%w for S-NSSAI %+v and DNN %q: %v",
						errInvalidStaticIP,
						key.snssai,
						dnn,
						parseErr,
					)
				}

				staticPools, ok := poolCache[key]
				if !ok {
					var getErr error
					staticPools, getErr = poolProvider(key.snssai, dnn)
					if getErr != nil {
						return fmt.Errorf(
							"get static IP pools for S-NSSAI %+v and DNN %q: %w",
							key.snssai,
							dnn,
							getErr,
						)
					}
					poolCache[key] = staticPools
				}

				if validationErr := validateStaticIPv4InPools(
					staticAddress.Ipv4Addr,
					staticPools,
				); validationErr != nil {
					return fmt.Errorf(
						"%w for S-NSSAI %+v and DNN %q",
						validationErr,
						key.snssai,
						dnn,
					)
				}
			}
		}
	}

	return nil
}

func validateSubscriberStaticIPsForWrite(
	c *gin.Context,
	subsData *SubsData,
	poolProvider staticIPPoolProvider,
) bool {
	err := validateSubscriberStaticIPs(
		subsData.SessionManagementSubscriptionData,
		poolProvider,
	)
	if err == nil {
		return true
	}

	status := http.StatusInternalServerError
	if errors.Is(err, errInvalidStaticIP) {
		status = http.StatusBadRequest
	}
	logger.ProcLog.Warnf("Static IP validation failed: %v", err)
	c.JSON(status, gin.H{responseCause: err.Error()})
	return false
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

	snssai := models.Snssai{
		Sst: int32(checkData.Sst),
	}
	if checkData.Sd != "" {
		snssai.Sd = checkData.Sd
	}

	staticPools, get_pool_err := getDnnStaticIpPools(snssai, checkData.Dnn)
	if get_pool_err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  get_pool_err,
			"ipaddr": checkData.Ipaddr,
			"valid":  false,
			"cause":  get_pool_err.Error(),
		})
		return
	}
	VerifyStaticIpProcedure(c, checkData, staticPools)
}

func VerifyStaticIpProcedure(
	c *gin.Context,
	checkData VerifyScope,
	staticPools []netip.Prefix,
) {
	if validationErr := validateStaticIPv4InPools(checkData.Ipaddr, staticPools); validationErr != nil {
		c.JSON(http.StatusOK, gin.H{
			"ipaddr": checkData.Ipaddr,
			"valid":  false,
			"cause":  validationErr.Error(),
		})
		logger.ProcLog.Debugln("StaticIP validation failed:", validationErr)
		return
	}
	staticIP, parseErr := netip.ParseAddr(checkData.Ipaddr)
	if parseErr != nil {
		c.JSON(http.StatusOK, gin.H{
			"ipaddr": checkData.Ipaddr,
			"valid":  false,
			"cause":  parseErr.Error(),
		})
		logger.ProcLog.Debugln("StaticIP", staticIP, ": not in static pool!")
		return
	}

	if gin.Mode() != "test" && checkIpCollisionFromDb(c, checkData) != nil {
		return
	}

	// Return the result
	c.JSON(http.StatusOK, gin.H{
		"ipaddr": staticIP,
		"valid":  true,
		"cause":  "",
	})
}

// Check IP not used by other UE
func checkIpCollisionFromDb(
	c *gin.Context,
	checkData VerifyScope,
) error {
	smDataColl := "subscriptionData.provisionedData.smData"
	filter := buildStaticIPCollisionFilter(checkData)
	smDataDataInterface, mongo_err := mongoapi.RestfulAPIGetMany(smDataColl, filter)
	if mongo_err != nil {
		logger.ProcLog.Warningln(smDataColl, "mongo error: ", mongo_err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"ipaddr": checkData.Ipaddr,
			"valid":  false,
			"cause":  mongo_err.Error(),
		})
		return mongo_err
	}
	var smDatas []models.SessionManagementSubscriptionData
	if err := json.Unmarshal(sliceToByte(smDataDataInterface), &smDatas); err != nil {
		logger.ProcLog.Errorf("Unmarshal smDatas err: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{})
		return err
	}
	for _, smData := range smDatas {
		if dnnConfig, ok := smData.DnnConfigurations[checkData.Dnn]; ok {
			for _, ipData := range dnnConfig.StaticIpAddress {
				if checkData.Ipaddr == ipData.Ipv4Addr {
					msg := "StaticIP: " + checkData.Ipaddr + " has already exist!"
					logger.ProcLog.Warningln(msg)
					c.JSON(http.StatusOK, gin.H{
						"ipaddr": checkData.Ipaddr,
						"valid":  false,
						"cause":  msg,
					})
					return fmt.Errorf("%s", msg)
				}
			}
		}
	}
	return nil
}

func buildStaticIPCollisionFilter(checkData VerifyScope) bson.M {
	filter := bson.M{
		"singleNssai.sst": int32(checkData.Sst),
		"ueId":            bson.D{{Key: "$ne", Value: checkData.Supi}}, // not this UE
	}
	if checkData.Sd != "" {
		filter[singleNssaiSDField] = checkData.Sd
	} else {
		filter["$or"] = bson.A{
			bson.M{singleNssaiSDField: bson.M{"$exists": false}},
			bson.M{singleNssaiSDField: ""},
		}
	}
	return filter
}
