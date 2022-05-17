//  Schema List:
//  subModalSchema
//  subModaluiSchema
//  tenantSchema
//  userModalSchema

let subModalSchema = {
    // title: "A registration form",
    // "description": "A simple form example.",
    type: "object",
    required: [
      "userNumber",
      "plmnID",
      "ueId",
      "authenticationMethod",
      "K",
      "OPOPcSelect",
      "OPOPc",
      "SQN",
    ],
    properties: {
      userNumber: {
        type: "integer",
        title: "Subscriber data number (auto-increased with SUPI)",
        default: 1,
        maximum: 100000,
        minimum: 1
      },
      plmnID: {
        type: "string",
        title: "PLMN ID",
        pattern: "^[0-9]{5,6}$",
        default: "20893",
      },
      ueId: {
        type: "string",
        title: "SUPI (IMSI)",
        pattern: "^[0-9]{10,15}$",
        default: "208930000000003",
      },
      authenticationMethod: {
        type: "string",
        title: "Authentication Method",
        default: "5G_AKA",
        enum: ["5G_AKA", "EAP_AKA_PRIME"],
      },
      K: {
        type: "string",
        title: "K",
        pattern: "^[A-Fa-f0-9]{32}$",
        default: "8baf473f2f8fd09487cccbd7097c6862",
      },
      OPOPcSelect: {
        type: "string",
        title: "Operator Code Type",
        enum: ["OP", "OPc"],
        default: "OPc",
      },
      OPOPc: {
        type: "string",
        title: "Operator Code Value",
        pattern: "^[A-Fa-f0-9]{32}$",
        default: "8e27b6af0e692e750f32667a3b14605d",
      },
      SQN: {
        type: "string",
        title: "SQN",
        pattern: "^[A-Fa-f0-9]{1,12}$",
        default: "16f3b3f70fc2",
      },
      sliceConfigurations: {
        type: "array",
        title: "S-NSSAI Configuration",
        items: { $ref: "#/definitions/SliceConfiguration" },
        default: [
          {
            snssai: {
              "sst": 1,
              "sd": "010203",
              "isDefault": true,
            },
            dnnConfigurations: [
              {
                dnn: "internet",
                uplinkAmbr: "200 Mbps",
                downlinkAmbr: "100 Mbps",
                "5qi": 9,
              },
              {
                dnn: "internet2",
                uplinkAmbr: "200 Mbps",
                downlinkAmbr: "100 Mbps",
                "5qi": 9,
              }
            ]
          },
          {
            snssai: {
              "sst": 1,
              "sd": "112233",
              "isDefault": true,
            },
            dnnConfigurations: [
              {
                dnn: "internet",
                uplinkAmbr: "200 Mbps",
                downlinkAmbr: "100 Mbps",
                "5qi": 9,
              },
              {
                dnn: "internet2",
                uplinkAmbr: "200 Mbps",
                downlinkAmbr: "100 Mbps",
                "5qi": 9,
              }
            ]
          },
        ],
      },
    },
    definitions: {
      Snssai: {
        type: "object",
        required: ["sst", "sd"],
        properties: {
          sst: {
            type: "integer",
            title: "SST",
            minimum: 0,
            maximum: 255,
          },
          sd: {
            type: "string",
            title: "SD",
            pattern: "^[A-Fa-f0-9]{6}$",
          },
          isDefault: {
            type: "boolean",
            title: "Default S-NSSAI",
            default: false,
          },
        },
      },
      SliceConfiguration: {
        type: "object",
        properties: {
          snssai: {
            $ref: "#/definitions/Snssai"
          },
          dnnConfigurations: {
            type: "array",
            title: "DNN Configurations",
            items: { $ref: "#/definitions/DnnConfiguration" },
          }
        }
      },
      DnnConfiguration: {
        type: "object",
        required: ["dnn", "uplinkAmbr", "downlinkAmbr"],
        properties: {
          dnn: {
            type: "string",
            title: "Data Network Name"
          },
          uplinkAmbr: {
            $ref: "#/definitions/bitRate",
            title: "Uplink AMBR",
            default: "1000 Kbps"
          },
          downlinkAmbr: {
            $ref: "#/definitions/bitRate",
            title: "Downlink AMBR",
            default: "1000 Kbps"
          },
          "5qi": {
            type: "integer",
            minimum: 0,
            maximum: 255,
            title: "Default 5QI"
          },       
          flowRules: {
            type: "array",
            items: { $ref: "#/definitions/FlowInformation" },
            maxItems: 1,
            title: "Flow Rules"
          },
          upSecurityChk: {
            "type": "boolean",
            title: "UP Security",
            "default": false
          },
        },
        "dependencies": {
          upSecurityChk: {
            "oneOf": [
              {
                "properties": {
                  upSecurityChk: {
                    "enum": [false]
                  }
                },
              },
              {
                "properties": {
                  upSecurityChk: {
                    "enum": [true]
                  },
                  upIntegrity: {
                    type: "string",
                    title: "Integrity of UP Security",
                    enum: ["NOT_NEEDED", "PREFERRED", "REQUIRED"],
                  },
                  upConfidentiality: {
                    type: "string",
                    title: "Confidentiality of UP Security",
                    enum: ["NOT_NEEDED", "PREFERRED", "REQUIRED"],
                  },
                },
                "required": [
                  "upIntegrity",
                  "upConfidentiality"
                ]
              }
            ]
          }
        },
      },
      FlowInformation: {
        type: "object",
        properties: {
          filter: {
            $ref: "#/definitions/IPFilter",
            title: "IP Filter"
          },
          "5qi": {
            type: "integer",
            minimum: 0,
            maximum: 255,
            title: "5QI"
          },
          gbrUL: {
            $ref: "#/definitions/bitRate",
            title: "Uplink GBR",
          },
          gbrDL: {
            $ref: "#/definitions/bitRate",
            title: "Downlink GBR",
          },
          mbrUL: {
            $ref: "#/definitions/bitRate",
            title: "Uplink MBR",
          },
          mbrDL: {
            $ref: "#/definitions/bitRate",
            title: "Downlink MBR",
          },
        }
      },
      IPFilter: {
        type: "string",
      },
      bitRate: {
        type: "string",
        pattern: "^[0-9]+(\\.[0-9]+)? (bps|Kbps|Mbps|Gbps|Tbps)$"
      },
    },
  };

  let subModaluiSchema = {
    OPOPcSelect: {
      "ui:widget": "select",
    },
    authenticationMethod: {
      "ui:widget": "select",
    },
    SliceConfiurations: {
      "ui:options": {
        "orderable": false
      },
      "isDefault": {
        "ui:widget": "radio",
      },
      "dnnConfigurations": {
        "ui:options": {
          "orderable": false
        },
        "flowRules": {
          "ui:options": {
            "orderable": false
          },
        }
      }
    }
  };

let tenantSchema = {
    // title: "A registration form",
    // "description": "A simple form example.",
    type: "object",
    required: [
      "tenantName",
    ],
    properties: {
      tenantId: {
        type: "string",
        title: "Tenant ID",
        pattern: "^[0-9a-zA-Z-]*$",
        default: "",
        readOnly: true,
      },
      tenantName: {
        type: "string",
        title: "Tenant Name",
        default: "",
      },
    },
  };

let userModalSchema = {
    // title: "A registration form",
    // "description": "A simple form example.",
    type: "object",
    required: [
      "email",
    ],
    properties: {
      userId: {
        type: "string",
        title: "User ID",
        pattern: "^[0-9a-zA-Z-]*$",
        default: "",
        readOnly: true,
      },
      email: {
        type: "string",
        title: "User Email",
        default: "",
      },
      password: {
        type: "string",
        title: "Password",
        default: "",
      },
    },
  };

export { subModalSchema, subModaluiSchema, tenantSchema, userModalSchema};