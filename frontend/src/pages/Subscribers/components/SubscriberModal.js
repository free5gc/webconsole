import React, { Component } from 'react';
import { subModalSchema, subModaluiSchema } from '../../../metadata/index'
import { Modal } from "react-bootstrap";
import Form from "react-jsonschema-form";
import PropTypes from 'prop-types';
import _ from 'lodash';

let snssaiToString = (snssai) => snssai.sst.toString(16).padStart(2, '0').toUpperCase() + snssai.sd

function validate(formData, errors) {
  let item = formData["sliceConfigurations"]
  item.map(i => {
    i.dnnConfigurations.map(d => {
      var qfiList = new Set([]);
      if (d.qosFlows) {
        d.qosFlows.map(q => {
          if (qfiList.has(q["5qi"])) {
            errors.sliceConfigurations.addError(`The QoS Flow (qfi = ${q["5qi"]}) is already exist.`);
          } else {
            qfiList.add(q["5qi"]);
          }
          if (q["5qi"] >= 5 && (q.gbrUL || q.gbrDL)) {
            errors.sliceConfigurations.addError(`${q["5qi"]} is non-GBR 5QI.\nthus, gbr related parameters won’t be applied.`);
          }
          return 0;
        })
      }
      return 0;
    })
    return 0;
  })
  return errors;
}



function dnnConfigurationFromSliceConfiguration(dnnConfig) {
  let obj = {
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

  if (dnnConfig.upSecurityChk === true) {
    obj["upSecurity"] = {
      "upIntegr": dnnConfig.upIntegrity,
      "upConfid": dnnConfig.upConfidentiality
    }
  }

  if (dnnConfig.staticIP !== undefined && dnnConfig.staticIP.length !== 0) {
    obj["staticIpAddress"] = [
      {
        "ipv4Addr": dnnConfig.staticIP
      }
    ]
  }
  return obj
}

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
        dnnConfigurationFromSliceConfiguration(dnnConfig)
      ]))
    }
  })
}

function qosFlowsFromSliceConfiguration(sliceConfigurations) {
  var qosFlows = [];
  sliceConfigurations.forEach(sliceConfiguration => {
    sliceConfiguration.dnnConfigurations.forEach(dnnConfiguration => {
      if (dnnConfiguration.flowRules !== undefined) {
        dnnConfiguration.flowRules.forEach(flowRule => {
          qosFlows.push(
            Object.assign(
              { 
                snssai: snssaiToString(sliceConfiguration.snssai), 
                dnn: dnnConfiguration.dnn,
                qfi: flowRule["5qi"] 
              },
              flowRule
            )
          )
        })
      }
    })
  })

  return qosFlows
}

function flowRulesFromSliceConfiguration(sliceConfigurations) {
  var flowRules = []
  sliceConfigurations.forEach(sliceConfiguration => {
    sliceConfiguration.dnnConfigurations.forEach(dnnConfiguration => {
      if (dnnConfiguration.flowRules !== undefined){
        dnnConfiguration.flowRules.forEach(flowRule => {
          flowRules.push(
            Object.assign(
              {
                filter: flowRule.filter,
                precedence: flowRule.precedence,
                snssai: snssaiToString(sliceConfiguration.snssai),
                dnn: dnnConfiguration.dnn,
                qfi: flowRule["5qi"],
              }
            )
          )
        })
      }
    })
  })

  return flowRules
}

function sliceConfigurationsFromSubscriber(subscriber) {
  const defaultSingleNssais = subscriber["AccessAndMobilitySubscriptionData"]["nssai"]["defaultSingleNssais"] ? subscriber["AccessAndMobilitySubscriptionData"]["nssai"]["defaultSingleNssais"].map(nssai => {
    return {
      snssai: {
        sst: nssai.sst,
        sd: nssai.sd,
        isDefault: true
      }
    }
  }) : [];
  const singleNssais = subscriber["AccessAndMobilitySubscriptionData"]["nssai"]["singleNssais"] ? subscriber["AccessAndMobilitySubscriptionData"]["nssai"]["singleNssais"].map(nssai => {
    return {
      snssai: {
        sst: nssai.sst,
        sd: nssai.sd,
        isDefault: false
      }
    }
  }) : [];

  let sliceConfigurations = [ // merge
    ...defaultSingleNssais,
    ...singleNssais
  ];

  const sessionManagementSubscriptionData = subscriber["SessionManagementSubscriptionData"];

  sliceConfigurations.forEach(sliceConf => {
    const dnnConfigs = sessionManagementSubscriptionData.find(data => data.singleNssai.sst === sliceConf.snssai.sst && data.singleNssai.sd === sliceConf.snssai.sd).dnnConfigurations;
    sliceConf.dnnConfigurations = Object.keys(dnnConfigs).map(dnn => {

      let flowRules = []; 
      const qosFlowsData = subscriber["QosFlows"];
      if (qosFlowsData && qosFlowsData.length !== 0) {
        flowRules = qosFlowsData
          .filter(rule => rule.snssai === snssaiToString(sliceConf.snssai) && dnn === rule.dnn)
          .map(rule => {
            return {
              "5qi": rule["5qi"],
              gbrUL: rule.gbrUL,
              gbrDL: rule.gbrDL,
              mbrUL: rule.mbrUL,
              mbrDL: rule.mbrDL,
              precedence: rule.flowRules[0].precedence,
              filter: rule.flowRules[0].filter
            }
          })
      }

      let staticIps = "";
      const staticIpAddress = dnnConfigs[dnn].staticIpAddress
      if (staticIpAddress && staticIpAddress.length !== 0) {
        staticIps += staticIpAddress.reduce((total, element) => {
          return total + element["ipv4Addr"]
        }, "")
      }
      if (dnnConfigs[dnn].upSecurity) {
        return {
          dnn: dnn,
          staticIP: staticIps,
          uplinkAmbr: dnnConfigs[dnn].sessionAmbr.uplink,
          downlinkAmbr: dnnConfigs[dnn].sessionAmbr.downlink,
          "5qi": dnnConfigs[dnn]["5gQosProfile"]["5qi"],
          flowRules: flowRules, // new
          upSecurityChk: true,
          upIntegrity: dnnConfigs[dnn].upSecurity.upIntegr,
          upConfidentiality: dnnConfigs[dnn].upSecurity.upConfid
        };
      }
      return {
        dnn: dnn,
        staticIP: staticIps,
        uplinkAmbr: dnnConfigs[dnn].sessionAmbr.uplink,
        downlinkAmbr: dnnConfigs[dnn].sessionAmbr.downlink,
        "5qi": dnnConfigs[dnn]["5gQosProfile"]["5qi"],
        flowRules: flowRules // new
      };
    });
  });
  
  return sliceConfigurations;
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

  schema = subModalSchema;
  uiSchema = subModaluiSchema;

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps !== this.props) {
      this.setState({ editMode: !!this.props.subscriber });

      if (this.props.subscriber) {
        const subscriber = this.props.subscriber;
        const isOp = subscriber['AuthenticationSubscription']["milenage"]["op"]["opValue"] !== "";
        //get the index of msisdn in gpsis
        let msisdnId = subscriber['AccessAndMobilitySubscriptionData']["gpsis"].findIndex(gpsi => gpsi.includes("msisdn-"));
        let formData = {
          plmnID: subscriber['plmnID'],
          ueId: subscriber['ueId'].replace("imsi-", ""),
          msisdn: msisdnId === -1 ? null : subscriber['AccessAndMobilitySubscriptionData']["gpsis"][msisdnId].replace("msisdn-", ""),
          authenticationMethod: subscriber['AuthenticationSubscription']["authenticationMethod"],
          K: subscriber['AuthenticationSubscription']["permanentKey"]["permanentKeyValue"],
          OPOPcSelect: isOp ? "OP" : "OPc",
          OPOPc: isOp ? subscriber['AuthenticationSubscription']["milenage"]["op"]["opValue"] :
            subscriber['AuthenticationSubscription']["opc"]["opcValue"],
          SQN: subscriber['AuthenticationSubscription']["sequenceNumber"],
          sliceConfigurations: sliceConfigurationsFromSubscriber(subscriber),
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
      "userNumber": formData["userNumber"],
      "plmnID": formData["plmnID"], // Change required
      "ueId": "imsi-" + formData["ueId"], // Change required
      "AuthenticationSubscription": {
        "authenticationManagementField": formData["AMF"],
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
        "sequenceNumber": formData["SQN"],
      },
      "AccessAndMobilitySubscriptionData": {
        "gpsis": [
          formData["msisdn"] === undefined ? null : "msisdn-" + formData["msisdn"]
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
        "subscribedSnssaiInfos": _.fromPairs(
          _.map(formData["sliceConfigurations"], slice => [snssaiToString(slice.snssai),
          {
            "dnnInfos": _.map(slice.dnnConfigurations, dnnConfig => {
              return { "dnn": dnnConfig.dnn }
            })
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
            "smPolicyDnnData": _.fromPairs(
              _.map(slice.dnnConfigurations, dnnConfig => [
                dnnConfig.dnn,
                {
                  "dnn": dnnConfig.dnn
                }
              ])
            )
          }]))
      },
      "FlowRules": flowRulesFromSliceConfiguration(formData["sliceConfigurations"]),
      "QosFlows": qosFlowsFromSliceConfiguration(formData["sliceConfigurations"]),
    };
    if (this.state.editMode) {
      this.props.onModify(subscriberData);
    } else {
      this.props.onSubmit(subscriberData);
    }
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
              validate={validate}
              onChange={this.onChange.bind(this)}
              onSubmit={this.onSubmitClick.bind(this)} />
          }
        </Modal.Body>
      </Modal>
    );

  }
}

export default SubscriberModal;
