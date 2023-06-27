package WebUI

import (
	"github.com/free5gc/openapi/models"
)

type SubsData struct {
	PlmnId                            string                                     `json:"plmnId"`
	Supi                              string                                     `json:"supi"`
	AuthenticationSubscription        models.AuthenticationSubscription          `json:"AuthenticationSubscription"`
	AccessAndMobilitySubscriptionData models.AccessAndMobilitySubscriptionData   `json:"AccessAndMobilitySubscriptionData"`
	SessionManagementSubscriptionData []models.SessionManagementSubscriptionData `json:"SessionManagementSubscriptionData"`
	SmfSelectionSubscriptionData      models.SmfSelectionSubscriptionData        `json:"SmfSelectionSubscriptionData"`
	AmPolicyData                      models.AmPolicyData                        `json:"AmPolicyData"`
	SmPolicyData                      models.SmPolicyData                        `json:"SmPolicyData"`
	FlowRules                         []FlowRule                                 `json:"FlowRules"`
	QosFlows                          []QosFlow                                  `json:"QosFlows"`
}
