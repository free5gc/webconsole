package WebUI

type ChargingRecord struct {
	Snssai string `json:"snssai,omitempty" yaml:"snssai" bson:"snssai" mapstructure:"snssai"`
	Dnn    string `json:"dnn" yaml:"dnn" bson:"dnn" mapstructure:"dnn"`
	Filter string `json:"filter" yaml:"filter" bson:"filter" mapstructure:"filter"`
	QosRef int    `json:"qosRef,omitempty" yaml:"qosRef" bson:"qosRef" mapstructure:"qosRef"`
	// nolint
	ChargingMethod string `json:"chargingMethod,omitempty" yaml:"chargingMethod" bson:"chargingMethod" mapstructure:"chargingMethod"`
	Quota          string `json:"quota,omitempty" yaml:"quota" bson:"quota" mapstructure:"quota"`
	UnitCost       string `json:"unitCost,omitempty" yaml:"unitCost" bson:"unitCost" mapstructure:"unitCost"`
	RatingGroup    int64  `json:"ratingGroup,omitempty" yaml:"ratingGroup" bson:"ratingGroup" mapstructure:"ratingGroup"`
}

// export interface FlowChargingRecord {
//    'Supi'?: string;
//    'Snssai'?: string;
//    'Dnn'?: string;
//    'Filter'?: string;
//    'QuotaLeft'?: string;
//    'TotalVol'?: string;
//    'UlVol'?: string;
//    'DlVol'?: string;
// }

// type RatingGroupDataUsage struct {
// 	Supi      string `bson:"Supi"`
// 	Filter    string `bson:"Filter"`
// 	Snssai    string `bson:"Snssai"`
// 	Dnn       string `bson:"Dnn"`

// 	TotalVol  int64  `bson:"TotalVol"`
// 	UlVol     int64  `bson:"UlVol"`
// 	DlVol     int64  `bson:"DlVol"`
// 	QuotaLeft int64  `bson:"QuotaLeft"`
// }
