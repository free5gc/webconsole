package WebUI

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"

	"github.com/free5gc/util/mongoapi"
	"github.com/free5gc/webconsole/backend/logger"
)

func GetChargingData(c *gin.Context) {
	logger.BillingLog.Info("Get Charging Data")
	setCorsHeader(c)

	if !CheckAuth(c) {
		c.JSON(http.StatusUnauthorized, gin.H{"cause": "Illegal Token"})
		return
	}

	chargingMethod, exist := c.Params.Get("chargingMethod")
	if !exist {
		c.JSON(http.StatusBadRequest, gin.H{"cause": "chargingMethod not provided"})
	}
	logger.BillingLog.Traceln(chargingMethod)

	if chargingMethod != "Offline" && chargingMethod != "Online" {
		c.JSON(http.StatusBadRequest, gin.H{"cause": "not support chargingMethod" + chargingMethod})
	}

	filter := bson.M{"chargingMethod": chargingMethod}
	chargingDataInterface, err := mongoapi.RestfulAPIGetMany(chargingDataColl, filter)
	if err != nil {
		logger.BillingLog.Errorf("mongoapi error: %+v", err)
	}

	chargingDataBsonA := toBsonA(chargingDataInterface)

	c.JSON(http.StatusOK, chargingDataBsonA)
}
