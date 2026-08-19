package WebUI

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/free5gc/openapi/models"
	"github.com/free5gc/webconsole/backend/logger"
)

// Constants for QoS profile configuration
const (
	DefaultVar5qi        = 9
	DefaultPriorityLevel = 8
)

func GetSampleJSON(c *gin.Context) {
	setCorsHeader(c)

	logger.ProcLog.Infoln("Get a JSON Example")

	var subsData SubsData

	webAuthSubsData := WebAuthenticationSubscription{
		AuthenticationManagementField: "8000",
		AuthenticationMethod:          "5G_AKA", // "5G_AKA", "EAP_AKA_PRIME"
		Milenage: &Milenage{
			Op: &Op{
				EncryptionAlgorithm: 0,
				EncryptionKey:       0,
				OpValue:             "c9e8763286b5b9ffbdf56e1297d0887b", // Required
			},
		},
		Opc: &Opc{
			EncryptionAlgorithm: 0,
			EncryptionKey:       0,
			OpcValue:            "981d464c7c52eb6e5036234984ad0bcf", // Required
		},
		PermanentKey: &PermanentKey{
			EncryptionAlgorithm: 0,
			EncryptionKey:       0,
			PermanentKeyValue:   "5122250214c33e723a5dd523fc145fc0", // Required
		},
		SequenceNumber: "16f3b3f70fc2",
	}

	amDataData := models.Udr_DR_AccessAndMobilitySubscriptionData{
		Gpsis: []string{
			"msisdn-0900000000",
		},
		Nssai: &models.Udm_SDM_Nssai{
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

	smDataData := []models.Udm_SDM_SessionManagementSubscriptionData{
		{
			SingleNssai: &models.Snssai{
				Sst: 1,
				Sd:  "010203",
			},
			DnnConfigurations: map[string]models.Udm_SDM_DnnConfiguration{
				"internet": {
					PduSessionTypes: &models.Udm_SDM_PduSessionTypes{
						DefaultSessionType:  models.PduSessionType_IPV4,
						AllowedSessionTypes: []models.PduSessionType{models.PduSessionType_IPV4},
					},
					SscModes: &models.Udm_SDM_SscModes{
						DefaultSscMode:  models.SscMode_1,
						AllowedSscModes: []models.SscMode{models.SscMode_1},
					},
					SessionAmbr: &models.Ambr{
						Downlink: "1000 Kbps",
						Uplink:   "1000 Kbps",
					},
					Var5gQosProfile: &models.SubscribedDefaultQos{
						Var5qi: DefaultVar5qi,
						Arp: &models.Arp{
							PriorityLevel: DefaultPriorityLevel,
						},
						PriorityLevel: DefaultPriorityLevel,
					},
				},
			},
		},
		{
			SingleNssai: &models.Snssai{
				Sst: 1,
				Sd:  "112233",
			},
			DnnConfigurations: map[string]models.Udm_SDM_DnnConfiguration{
				"internet": {
					PduSessionTypes: &models.Udm_SDM_PduSessionTypes{
						DefaultSessionType:  models.PduSessionType_IPV4,
						AllowedSessionTypes: []models.PduSessionType{models.PduSessionType_IPV4},
					},
					SscModes: &models.Udm_SDM_SscModes{
						DefaultSscMode:  models.SscMode_1,
						AllowedSscModes: []models.SscMode{models.SscMode_1},
					},
					SessionAmbr: &models.Ambr{
						Downlink: "1000 Kbps",
						Uplink:   "1000 Kbps",
					},
					Var5gQosProfile: &models.SubscribedDefaultQos{
						Var5qi: DefaultVar5qi,
						Arp: &models.Arp{
							PriorityLevel: DefaultPriorityLevel,
						},
						PriorityLevel: DefaultPriorityLevel,
					},
				},
			},
		},
	}

	smfSelData := models.Udr_DR_SmfSelectionSubscriptionData{
		SubscribedSnssaiInfos: map[string]models.Udm_SDM_SnssaiInfo{
			"01010203": {
				DnnInfos: []models.Udm_SDM_DnnInfo{
					{
						Dnn: "internet",
					},
				},
			},
			"01112233": {
				DnnInfos: []models.Udm_SDM_DnnInfo{
					{
						Dnn: "internet",
					},
				},
			},
		},
	}

	amPolicyData := models.Udr_DR_AmPolicyData{
		SubscCats: []string{
			"free5gc",
		},
	}

	smPolicyData := models.Udr_DR_SmPolicyData{
		SmPolicySnssaiData: map[string]models.Udr_DR_SmPolicySnssaiData{
			"01010203": {
				Snssai: &models.Snssai{
					Sd:  "010203",
					Sst: 1,
				},
				SmPolicyDnnData: map[string]models.Udr_DR_SmPolicyDnnData{
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
				SmPolicyDnnData: map[string]models.Udr_DR_SmPolicyDnnData{
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
		WebAuthenticationSubscription:     webAuthSubsData,
		AccessAndMobilitySubscriptionData: amDataData,
		SessionManagementSubscriptionData: smDataData,
		SmfSelectionSubscriptionData:      smfSelData,
		AmPolicyData:                      amPolicyData,
		SmPolicyData:                      smPolicyData,
	}
	c.JSON(http.StatusOK, subsData)
}
