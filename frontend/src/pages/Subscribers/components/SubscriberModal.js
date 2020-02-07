import React, { Component } from 'react';
import { Modal } from "react-bootstrap";
import Form from "react-jsonschema-form";
import PropTypes from 'prop-types';
import _ from 'lodash';

let snssaiToString = (snssai) => snssai.sst.toString(16).padStart(2, '0').toUpperCase() + snssai.sd

function smDatasFromSliceConfiguration(sliceConfiguration) {
  return _.map(sliceConfiguration, slice => {
    return {
      "singleNssai": {
        "sst": slice.snssai.sst,
        "sd": slice.snssai.sd
      },
      "dnnConfigurations": _.fromPairs(_.map(slice.dnnConfigurations, dnnConfig => [
        // key
        dnnConfig.dnn,
        // value
        {
          "sscModes": {
            "defaultSscMode": "SSC_MODE_1",
            "allowedSscModes": ["SSC_MODE_2", "SSC_MODE_3"]
          },
          "pduSessionTypes": {
            "defaultSessionType": "IPV4",
            "allowedSessionTypes": ["IPV4"]
          },
          "sessionAmbr": {
            "uplink": dnnConfig.uplinkAmbr,
            "downlink": dnnConfig.downlinkAmbr
          },
          "5gQosProfile": {
            "5qi": dnnConfig["5qi"],
            "arp": {
              "priorityLevel": 8
            },
            "priorityLevel": 8
          }
        }
      ]))
    }
  })
}

function flowRulesFromSliceConfiguration(sliceConfigurations) {
  var flowRules = []
  sliceConfigurations.forEach(slice => {
    slice.dnnConfigurations.forEach(dnn => {
      if (dnn.flowRules !== undefined) {
        dnn.flowRules.forEach(flowRule => {
          flowRules.push(Object.assign({ snssai: snssaiToString(slice.snssai), dnn: dnn.dnn }, flowRule))
        })
      }
    })
  })
  return flowRules
}

class SubscriberModal extends Component {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    setOpen: PropTypes.func.isRequired,
    subscriber: PropTypes.object,
    onModify: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
  };

  state = {
    editMode: false,
    formData: undefined,
    // for force re-rendering json form
    rerenderCounter: 0,
  };

  state = {
    formData: undefined,
    editMode: false,
    // for force re-rendering json form
    rerenderCounter: 0,
  };

  schema = {
    // title: "A registration form",
    // "description": "A simple form example.",
    type: "object",
    required: [
      "plmnID",
      "ueId",
      "authenticationMethod",
      "K",
      "OPOPcSelect",
      "OPOPc",
    ],
    properties: {
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

  uiSchema = {
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

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps !== this.props) {
      this.setState({ editMode: !!this.props.subscriber });

      if (this.props.subscriber) {
        const subscriber = this.props.subscriber;
        const isOp = subscriber['AuthenticationSubscription']["milenage"]["op"]["opValue"] !== "";

        let formData = {
          plmnID: subscriber['plmnID'],
          ueId: subscriber['ueId'].replace("imsi-", ""),
          authenticationMethod: subscriber['AuthenticationSubscription']["authenticationMethod"],
          K: subscriber['AuthenticationSubscription']["permanentKey"]["permanentKeyValue"],
          OPOPcSelect: isOp ? "OP" : "OPc",
          OPOPc: isOp ? subscriber['AuthenticationSubscription']["milenage"]["op"]["opValue"] :
            subscriber['AuthenticationSubscription']["opc"]["opcValue"],
        };

        this.updateFormData(formData).then();
      }
    }
  }

  async onChange(data) {
    const lastData = this.state.formData;
    const newData = data.formData;

    if (lastData && lastData.plmnID === undefined)
      lastData.plmnID = "";

    if (lastData && lastData.plmnID !== newData.plmnID &&
      newData.ueId.length === lastData.plmnID.length + "0000000003".length) {
      const plmn = newData.plmnID ? newData.plmnID : "";
      newData.ueId = plmn + newData.ueId.substr(lastData.plmnID.length);

      await this.updateFormData(newData);

      // Keep plmnID input focused at the end
      const plmnInput = document.getElementById("root_plmnID");
      plmnInput.selectionStart = plmnInput.selectionEnd = plmnInput.value.length;
      plmnInput.focus();
    } else {
      this.setState({
        formData: newData,
      });
    }
  }

  async updateFormData(newData) {
    // Workaround for bug: https://github.com/rjsf-team/react-jsonschema-form/issues/758
    await this.setState({ rerenderCounter: this.state.rerenderCounter + 1 });
    await this.setState({
      rerenderCounter: this.state.rerenderCounter + 1,
      formData: newData,
    });
  }

  onSubmitClick(result) {
    const formData = result.formData;
    const OP = formData["OPOPcSelect"] === "OP" ? formData["OPOPc"] : "";
    const OPc = formData["OPOPcSelect"] === "OPc" ? formData["OPOPc"] : "";

    let subscriberData = {
      "plmnID": formData["plmnID"], // Change required
      "ueId": "imsi-" + formData["ueId"], // Change required
      "AuthenticationSubscription": {
        "authenticationManagementField": "8000",
        "authenticationMethod": formData["authenticationMethod"], // "5G_AKA", "EAP_AKA_PRIME"
        "milenage": {
          "op": {
            "encryptionAlgorithm": 0,
            "encryptionKey": 0,
            "opValue": OP // Change required
          }
        },
        "opc": {
          "encryptionAlgorithm": 0,
          "encryptionKey": 0,
          "opcValue": OPc // Change required (one of OPc/OP should be filled)
        },
        "permanentKey": {
          "encryptionAlgorithm": 0,
          "encryptionKey": 0,
          "permanentKeyValue": formData["K"] // Change required
        },
        "sequenceNumber": "16f3b3f70fc2",
      },
      "AccessAndMobilitySubscriptionData": {
        "gpsis": [
          "msisdn-0900000000"
        ],
        "nssai": {
          "defaultSingleNssais": _(formData["sliceConfigurations"])
            .map(slice => slice.snssai)
            .filter(snssai => !!snssai.isDefault),
          "singleNssais": _(formData["sliceConfigurations"])
            .map(slice => slice.snssai)
            .filter(snssai => !snssai.isDefault),
        },
        "subscribedUeAmbr": {
          "downlink": "2 Gbps",
          "uplink": "1 Gbps",
        },
      },
      "SessionManagementSubscriptionData": smDatasFromSliceConfiguration(formData["sliceConfigurations"]),
      "SmfSelectionSubscriptionData": {
        "DnnInfosubscribedSnssaiInfos": _.fromPairs(
          _.map(formData["sliceConfigurations"], slice => [snssaiToString(slice.snssai),
          {
            "dnnInfos": [
              {
                "dnn": "internet",
              },
            ]
          }]))
      },
      "AmPolicyData": {
        "subscCats": [
          "free5gc",
        ]
      },
      "SmPolicyData": {
        "smPolicySnssaiData": _.fromPairs(
          _.map(formData["sliceConfigurations"], slice => [snssaiToString(slice.snssai),
          {
            "snssai": {
              "sst": slice.snssai.sst,
              "sd": slice.snssai.sd
            },
            "smPolicyDnnData": {
              "internet": {
                "dnn": "internet"
              },
            },
          }]))
      },
      "FlowRules": flowRulesFromSliceConfiguration(formData["sliceConfigurations"])
    };

    this.props.onSubmit(subscriberData);
  }

  render() {
    return (
      <Modal
        show={this.props.open}
        className={"fields__edit-modal theme-light"}
        backdrop={"static"}
        onHide={this.props.setOpen.bind(this, false)}>
        <Modal.Header closeButton>
          <Modal.Title id="example-modal-sizes-title-lg">
            {this.state.editMode ? "Edit Subscriber" : "New Subscriber"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {this.state.rerenderCounter % 2 === 0 &&
            <Form schema={this.schema}
              uiSchema={this.uiSchema}
              formData={this.state.formData}
              onChange={this.onChange.bind(this)}
              onSubmit={this.onSubmitClick.bind(this)} />
          }
        </Modal.Body>
      </Modal>
    );

  }
}

export default SubscriberModal;
