package WebUI

import "github.com/free5gc/openapi/models"

type Profile struct {
	ProfileName                       string                                             `json:"profileName"`
	TenantId                          string                                             `json:"tenantId"`
	AccessAndMobilitySubscriptionData models.Udr_DR_AccessAndMobilitySubscriptionData    `json:"AccessAndMobilitySubscriptionData"` //nolint:lll
	SessionManagementSubscriptionData []models.Udm_SDM_SessionManagementSubscriptionData `json:"SessionManagementSubscriptionData"` //nolint:lll
	SmfSelectionSubscriptionData      models.Udr_DR_SmfSelectionSubscriptionData         `json:"SmfSelectionSubscriptionData"`      //nolint:lll
	AmPolicyData                      models.Udr_DR_AmPolicyData                         `json:"AmPolicyData"`
	SmPolicyData                      models.Udr_DR_SmPolicyData                         `json:"SmPolicyData"`
	FlowRules                         []FlowRule                                         `json:"FlowRules"`
	QosFlows                          []QosFlow                                          `json:"QosFlows"`
	ChargingDatas                     []ChargingData
}
