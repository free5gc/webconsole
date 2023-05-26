package WebUI

type ChargingData struct {
	Snssai         string `json:"snssai" yaml:"snssai" bson:"snssai" mapstructure:"snssai"`
	Dnn            string `json:"dnn" yaml:"dnn" bson:"dnn" mapstructure:"dnn"`
	Filter         string `json:"filter,omitempty" yaml:"filter" bson:"filter" mapstructure:"filter"`
	ChargingMethod string `json:"chargingMethod,omitempty" yaml:"chargingMethod" bson:"chargingMethod" mapstructure:"chargingMethod"`
	Quota          string `json:"quota" yaml:"quota" bson:"quota" mapstructure:"quota"`
	UnitCost       string `json:"unitCost,omitempty" yaml:"unitCost" bson:"unitCost" mapstructure:"unitCost"`
}
