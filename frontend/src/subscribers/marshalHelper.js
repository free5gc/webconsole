import _ from 'lodash';

export { frontendToBackend, backendToFrontend };

function snssaiToString({ sst, sd }) {
  return parseInt(sst).toString(16).padStart(2, '0').toUpperCase() + sd;
};

const plmnIdToMccMnc = (plmnId) => {
  if (plmnId.length === 5) {
    return {
      mcc: '' + plmnId.substring(0, 3),
      mnc: '' + plmnId.substring(3, 5)
    };
  } else {
    return {
      mcc: '' + plmnId.substring(0, 3),
      mnc: '' + plmnId.substring(3, 6)
    };
  }
};

// transforms the backend data to the subscriber data used in the frontend
function backendToFrontend(backend) {
  console.log('data received from backend', backend);

  let defaultSingleNssais = _.get(backend, 'AccessAndMobilitySubscriptionData.nssai.defaultSingleNssais', []).map(nssai => {
    return ({
      sst: parseInt(nssai.sst),
      sd: nssai.sd,
      isDefault: true
    });
  });

  let singleNssais = _.get(backend, 'AccessAndMobilitySubscriptionData.nssai.singleNssais', []).map(nssai => {
    return ({
      sst: parseInt(nssai.sst),
      sd: nssai.sd,
      isDefault: false
    });
  });

  let slices = [...defaultSingleNssais, ...singleNssais];
  let sessionManagementSubscriptionData = _.get(backend, 'SessionManagementSubscriptionData'); // contains dnn configurations

  // TODO: why is this conversion done? Why need both QoSFlows and FlowRules?
  // This is coded like the original code, but should be improved.
  // The frontend only has FlowRules

  let flowRules = _.get(backend, 'FlowRules', []);
  let qoSFlows = _.get(backend, 'QosFlows', []);

  //match flowRules to QoS flows
  qoSFlows = qoSFlows.map(qoSFlow => {
    let flowRulesForQoSFlow = _.filter(flowRules, function (flowRule) {
      return flowRule.snssai === qoSFlow.snssai && flowRule.dnn === qoSFlow.dnn && flowRule.qfi === qoSFlow['5qi'];
    });

    // add additional properties to existing qos flow
    return {
      ...qoSFlow,
      flowRules: flowRulesForQoSFlow
    };
  });

  //loop all slices and add dnn configurations to each slice
  slices.forEach(slice => {
    let dnnConfigs = _.find(sessionManagementSubscriptionData, function (o) {
      return o.singleNssai.sst === slice.sst && o.singleNssai.sd === slice.sd;
    }).dnnConfigurations;

    //loop all dnn configs of this slice and add qos flow rules from QoSFlow backend data
    slice.dnns = Object.keys(dnnConfigs).map(dnn => {
      let flowConfiguration = _.filter(qoSFlows, function (qoSFlow) {
        return qoSFlow.snssai === snssaiToString({ sst: slice.sst, sd: slice.sd }) && qoSFlow.dnn === dnn;
      }).map(qoSFlow => {
        return {
          filter: qoSFlow.flowRules[0].filter,
          precedence: parseInt(qoSFlow.flowRules[0].precedence),
          fiveQi: parseInt(qoSFlow.flowRules[0].qfi),
          gbrUL: qoSFlow.gbrUL,
          gbrDL: qoSFlow.gbrDL,
          mbrUL: qoSFlow.mbrUL,
          mbrDL: qoSFlow.mbrDL
        }
      });

      let staticIps = '';
      const staticIpAddress = dnnConfigs[dnn].staticIpAddress;
      if (staticIpAddress && staticIpAddress.length !== 0) {
        staticIps += staticIpAddress.reduce((total, element) => {
          return total + element['ipv4Addr']
        }, '')
      }

      let dnnConfig = {
        name: dnn,
        staticIP: staticIps,
        uplinkAmbr: dnnConfigs[dnn].sessionAmbr.uplink,
        downlinkAmbr: dnnConfigs[dnn].sessionAmbr.downlink,
        default5qi: _.get(dnnConfigs, `${dnn}.5gQosProfile.5qi`),
        flows: flowConfiguration,
      };

      if (dnnConfigs[dnn].upSecurity) {
        dnnConfig.upSecurityChk = true;
        dnnConfig.upIntegrity = dnnConfigs[dnn].upSecurity.upIntegr;
        dnnConfig.upConfidentiality = dnnConfigs[dnn].upSecurity.upConfid;
      }

      return dnnConfig;
    });
  });

  let opCode = _.get(backend, 'AuthenticationSubscription.milenage.op.opValue', '');
  let supi = _.get(backend, 'supi');
  let plmnId = '' + _.get(backend, 'plmnId');
  let { mcc, mnc } = plmnIdToMccMnc(plmnId);
  let msisdn = ''+_.get(backend, 'AccessAndMobilitySubscriptionData.gpsis', [])?.filter(gpsi => gpsi != null && gpsi.includes('msisdn-'));
  if (msisdn === '') {
    msisdn = '-';
  } else {
    msisdn = msisdn.replace('msisdn-', '');
  }

  let subscriber = {
    supi: supi.replace('imsi-', ''),
    plmnId: plmnId,
    mcc: mcc,
    mnc: mnc,
    msin: parseInt(supi.replace('imsi-', '').replace(plmnId, '')),
    msisdn: msisdn,
    key: _.get(backend, 'AuthenticationSubscription.permanentKey.permanentKeyValue'),
    sqn: _.get(backend, 'AuthenticationSubscription.sequenceNumber'),
    opCodeType: opCode !== '' ? 'OP' : 'OPc',
    opCode: opCode !== '' ? opCode : _.get(backend, 'AuthenticationSubscription.opc.opcValue'),
    slices: slices
  };

  console.log('data submitted to frontend ', subscriber);

  return subscriber;
};

function smDatasFromSliceConfiguration(slices) {
  return slices.map(slice => {
    return {
      singleNssai: {
        sst: parseInt(slice.sst),
        sd: slice.sd
      },
      dnnConfigurations: _.fromPairs(_.map(slice.dnns, dnnConfig => [
        // key
        dnnConfig.name,
        // value
        dnnConfigurationFromSliceConfiguration(dnnConfig)
      ]))
    }
  })
}

function dnnConfigurationFromSliceConfiguration({ upSecurity, uplinkAmbr, downlinkAmbr, default5qi, upIntegrity, upConfidentiality }) {
  let dnnConfig = {
    sscModes: {
      defaultSscMode: 'SSC_MODE_1',
      allowedSscModes: ['SSC_MODE_2', 'SSC_MODE_3']
    },
    pduSessionTypes: {
      defaultSessionType: 'IPV4',
      allowedSessionTypes: ['IPV4']
    },
    sessionAmbr: {
      uplink: uplinkAmbr,
      downlink: downlinkAmbr,
    },
    '5gQosProfile': {
      '5qi': parseInt(default5qi),
      arp: {
        priorityLevel: 8,
        preemptCap: '',
        preemptVuln: ''
      },
      priorityLevel: 8
    },
  };

  if (upSecurity) {
    dnnConfig.upSecurity = {
      upIntegr: upIntegrity,
      upConfid: upConfidentiality
    }
  }

  if (dnnConfig.staticIP !== undefined && dnnConfig.staticIP.length !== 0) {
    dnnConfig.staticIpAddress = [
      {
        'ipv4Addr': dnnConfig.staticIP
      }
    ]
  }

  return dnnConfig;
}

// TODO: why both flowRules and qoSFlows?
// TODO: qos flow does not have precedence and filter when queried (HTTP GET) from backend
function flowRulesAndQoSFlowsFromSliceConfiguration(slices) {
  let flowRules = [];
  let qoSFlows = [];
  slices.forEach(slice => {
    slice.dnns.forEach(dnn => {
      _.get(dnn, 'flows', []).forEach(flowRule => {
        flowRules.push(Object.assign(
          {
            snssai: snssaiToString({ sst: slice.sst, sd: slice.sd }),
            dnn: dnn.name,
            filter: flowRule.filter,
            precedence: flowRule.precedence,
            qfi: parseInt(flowRule.fiveQi)
          }
        ));
        qoSFlows.push(Object.assign(
          {
            snssai: snssaiToString({ sst: slice.sst, sd: slice.sd }),
            dnn: dnn.name,
            //filter: flowRule.filter,
            //precedence: flowRule.precedence,
            qfi: parseInt(flowRule.fiveQi),
            '5qi': flowRule.fiveQi,
            gbrUL: flowRule.gbrUL,
            gbrDL: flowRule.gbrDL,
            mbrUL: flowRule.mbrUL,
            mbrDL: flowRule.mbrDL
          }
        ));
      })
    })
  });
  return { flowRules: flowRules, qoSFlows: qoSFlows };
}

function frontendToBackend(formData) {
  let { qoSFlows, flowRules } = flowRulesAndQoSFlowsFromSliceConfiguration(formData.slices);

  let subscriber = {
    plmnId: '' + formData.plmnId,
    supi: 'imsi-' + formData.supi,
    AuthenticationSubscription: {
      authenticationManagementField: formData.amf,
      authenticationMethod: formData.authMethod,
      milenage: {
        op: {
          encryptionAlgorithm: 0,
          encryptionKey: 0,
          opValue: formData.opCodeType === 'OP' ? formData.opCode : ''
        }
      },
      opc: {
        encryptionAlgorithm: 0,
        encryptionKey: 0,
        opcValue: formData.opCodeType === 'OPc' ? formData.opCode : ''
      },
      permanentKey: {
        encryptionAlgorithm: 0,
        encryptionKey: 0,
        permanentKeyValue: formData.key
      },
      sequenceNumber: formData.sqn
    },
    AccessAndMobilitySubscriptionData: {
      gpsis: [
        formData.msisdn !== '-' ? 'msisdn-'+formData.msisdn : null
      ],
      nssai: {
        defaultSingleNssais: _.get(formData, 'slices', [])
          .reduce((result, slice) => {
            if (slice.isDefault)
              result.push({ 
                sst: parseInt(slice.sst), 
                sd: slice.sd,
                isDefault: true
              })
            return result;
          }, []),
        singleNssais: _.get(formData, 'slices', [])
          .reduce((result, slice) => {
            if (!slice.isDefault)
              result.push({ 
                sst: parseInt(slice.sst), 
                sd: slice.sd,
                isDefault: false
              })
            return result;
          }, []),
      },
      subscribedUeAmbr: {
        downlink: '2 Gbps',
        uplink: '1 Gbps',
      }
    },
    SessionManagementSubscriptionData: smDatasFromSliceConfiguration(formData.slices),
    SmfSelectionSubscriptionData: {
      subscribedSnssaiInfos: _.fromPairs(
        _.map(formData.slices, slice => [
          snssaiToString({ sst: slice.sst, sd: slice.sd }),
          {
            dnnInfos: _.map(slice.dnns, dnnCofig => {
              return { dnn: dnnCofig.name }
            })
          }
        ])
      )
    },
    AmPolicyData: {
      subscCats: [
        'free5gc',
      ]
    },
    SmPolicyData: {
      smPolicySnssaiData: _.fromPairs(
        _.map(formData.slices, slice => [snssaiToString({ sst: slice.sst, sd: slice.sd }),
        {
          snssai: {
            sst: parseInt(slice.sst),
            sd: slice.sd
          },
          smPolicyDnnData: _.fromPairs(
            _.map(slice.dnns, dnnConfig => [
              dnnConfig.name,
              {
                dnn: dnnConfig.name
              }
            ])
          )
        }]))
    },
    FlowRules: flowRules,
    QosFlows: qoSFlows
  };

  //TODO: backend does not include AccessAndMobilitySubscriptionData.nssai.singleNssais when empty
  // not sure if required in POST or PUT, therefore keep data processing simple by adding it
  if (_.get(subscriber, 'AccessAndMobilitySubscriptionData.nssai.singleNssais', []).length === 0) {
    delete subscriber.AccessAndMobilitySubscriptionData.nssai.singleNssais;
  }

  if (_.get(subscriber, 'AccessAndMobilitySubscriptionData.nssai.defaultSingleNssais', []).length === 0) {
    delete subscriber.AccessAndMobilitySubscriptionData.nssai.defaultSingleNssais;
  }

  console.log('will be submitted to backend ', subscriber);

  return subscriber;
}
