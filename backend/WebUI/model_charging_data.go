package WebUI

type ChargingData struct {
	Snssai string `json:"snssai,omitempty" yaml:"snssai" bson:"snssai" mapstructure:"snssai"`
	Dnn    string `json:"dnn,omitempty" yaml:"dnn" bson:"dnn" mapstructure:"dnn"`
	Filter string `json:"filter,omitempty" yaml:"filter" bson:"filter" mapstructure:"filter"`
	QosRef int    `json:"qosRef" yaml:"qosRef" bson:"qosRef" mapstructure:"qosRef"`
	// nolint
	ChargingMethod string `json:"chargingMethod,omitempty" yaml:"chargingMethod" bson:"chargingMethod" mapstructure:"chargingMethod"`
	Quota          string `json:"quota,omitempty" yaml:"quota" bson:"quota" mapstructure:"quota"`
	UnitCost       string `json:"unitCost,omitempty" yaml:"unitCost" bson:"unitCost" mapstructure:"unitCost"`
}
