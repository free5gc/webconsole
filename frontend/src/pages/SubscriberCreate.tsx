import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "../axios";
import {
  Subscription,
  Nssai,
  DnnConfiguration,
  AccessAndMobilitySubscriptionData,
  FlowRules,
  QosFlows,
} from "../api/api";

import Dashboard from "../Dashboard";
import {
  Button,
  Box,
  Card,
  Checkbox,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
} from "@mui/material";

export default function SubscriberCreate() {
  const navigation = useNavigate();

  const [data, setData] = useState<Subscription>({
    userNumber: 1,
    plmnID: "20893",
    ueId: "imsi-208930000000999",
    AuthenticationSubscription: {
      authenticationMethod: "5G_AKA",
      sequenceNumber: "000000000023",
      authenticationManagementField: "8000",
      permanentKey: {
        permanentKeyValue: "8baf473f2f8fd09487cccbd7097c6862",
      },
      milenage: {
        op: {
          opValue: "",
          encryptionKey: 0,
          encryptionAlgorithm: 0,
        },
      },
      opc: {
        opcValue: "8e27b6af0e692e750f32667a3b14605d",
      },
    },
    AccessAndMobilitySubscriptionData: {
      gpsis: ["msisdn-"],
      subscribedUeAmbr: {
        uplink: "1 Gbps",
        downlink: "2 Gbps",
      },
      nssai: {
        defaultSingleNssais: [],
        singleNssais: [],
      },
    },
    SmfSelectionSubscriptionData: {
      subscribedSnssaiInfos: {},
    },
    AmPolicyData: {
      subscCats: ["free5gc"],
    },
    SmPolicyData: {
      smPolicySnssaiData: {},
    },
  });
  const [opcType, setOpcType] = useState<string>("OPc");
  const [opcValue, setOpcValue] = useState<string>("8e27b6af0e692e750f32667a3b14605d");
  const [dnnName, setDnnName] = useState<string[]>([]);

  const nssai2KeyString = (nssai: Nssai) => {
    function toHex(v: number | undefined) {
      return ("00" + v?.toString(16).toUpperCase()).substr(-2);
    }
    return toHex(nssai.sst) + nssai.sd;
  };

  const supiIncrement = (supi: string): string => {
    const imsi = supi.split("-", 2);
    if (imsi.length !== 2) {
      return supi;
    }
    let number = Number(imsi[1]);
    number += 1;
    return "imsi-" + number;
  }

  const onCreate = () => {
    if (data.SessionManagementSubscriptionData === undefined) {
      alert("Please add at least one S-NSSAI");
      return;
    }
    for (let i = 0; i < data.SessionManagementSubscriptionData!.length; i++) {
      const nssai = data.SessionManagementSubscriptionData![i];
      const key = nssai2KeyString(nssai.singleNssai!);
      console.log(key);
      Object.keys(nssai.dnnConfigurations!).map((dnn) => {
        if (data.SmfSelectionSubscriptionData!.subscribedSnssaiInfos![key] === undefined) {
          data.SmfSelectionSubscriptionData!.subscribedSnssaiInfos![key] = {
            dnnInfos: [{ dnn: dnn }],
          };
        } else {
          data.SmfSelectionSubscriptionData!.subscribedSnssaiInfos![key].dnnInfos!.push({
            dnn: dnn,
          });
        }
        if (data.SmPolicyData!.smPolicySnssaiData![key] === undefined) {
          data.SmPolicyData!.smPolicySnssaiData![key] = {
            snssai: nssai.singleNssai,
            smPolicyDnnData: {},
          };
        }
        data.SmPolicyData!.smPolicySnssaiData![key].smPolicyDnnData![dnn] = {
          dnn: dnn,
        };
      });
    }
    // Iterate subscriber data number.
    let supi = data.ueId!;
    for (let i = 0; i < data.userNumber!; i++) {
      data.ueId = supi;
      axios
	.post("/api/subscriber/" + data.ueId + "/" + data.plmnID, data)
	.then((res) => {
          console.log("post result:" + res);
          navigation("/subscriber");
	})
	.catch((err) => {
          if (err.response) {
            if (err.response.data.cause) {
              alert(err.response.data.cause);
            } else {
              alert(err.response.data);
            }
          } else {
            alert(err.message);
          }
	  return;
	});
      supi = supiIncrement(supi);
    }
  };

  const onSnssai = () => {
    if (
      data.SessionManagementSubscriptionData === undefined ||
      data.SessionManagementSubscriptionData!.length === 0
    ) {
      data.SessionManagementSubscriptionData = [
        {
          singleNssai: {
            sst: 1,
            sd: "010203",
          },
          dnnConfigurations: {},
        },
      ];
      setData({ ...data });
    } else {
      data.SessionManagementSubscriptionData.push({
        singleNssai: {},
        dnnConfigurations: {},
      });
      setData({ ...data });
    }
  };

  const onSnssaiDelete = (index: number) => {
    if (data.SessionManagementSubscriptionData !== undefined) {
      data.SessionManagementSubscriptionData.splice(index, 1);
      setData({ ...data });
    }
  };

  const onDnn = (index: number) => {
    if (data.SessionManagementSubscriptionData !== undefined) {
      const name = dnnName[index];
      if (name === undefined || name === "") {
        return;
      }
      const session = data.SessionManagementSubscriptionData![index];
      session.dnnConfigurations![name] = {
        pduSessionTypes: {
          defaultSessionType: "IPV4",
          allowedSessionTypes: ["IPV4"],
        },
        sscModes: {
          defaultSscMode: "SSC_MODE_1",
          allowedSscModes: ["SSC_MODE_2", "SSC_MODE_3"],
        },
        "5gQosProfile": {
          "5qi": 9,
          arp: {
            priorityLevel: 8,
            preemptCap: "",
            preemptVuln: "",
          },
          priorityLevel: 8,
        },
        sessionAmbr: {},
      };
      setData({ ...data });
      dnnName[index] = "";
      setDnnName({ ...dnnName });
    }
  };

  const onDnnDelete = (index: number, dnn: string) => {
    if (data.SessionManagementSubscriptionData !== undefined) {
      delete data.SessionManagementSubscriptionData![index].dnnConfigurations![dnn];
      setData({ ...data });
    }
  };

  const onFlowRules = (dnn: string, flowKey: string) => {
    const flow: FlowRules = {
      dnn: dnn,
      snssai: flowKey,
      filter: "permit out ip from 10.20.30.40 to 50.60.70.80",
      precedence: 128,
      qfi: 9,
    };
    const qos: QosFlows = {
      dnn: dnn,
      snssai: flowKey,
      qfi: 9,
      "5qi": 9,
      gbrUL: "100 Mbps",
      gbrDL: "200 Mbps",
      mbrUL: "100 Mbps",
      mbrDL: "200 Mbps",
    };
    if (data.FlowRules === undefined) {
      data.FlowRules = [flow];
    } else {
      data.FlowRules.push(flow);
    }
    if (data.QosFlows === undefined) {
      data.QosFlows = [qos]
    } else {
      data.QosFlows.push(qos);
    }
    setData({ ...data });
  };

  const onFlowRulesDelete = (dnn: string, flowKey: string) => {
    if (data.FlowRules !== undefined) {
      for (let i = 0; i < data.FlowRules!.length; i++) {
        if (data.FlowRules![i].dnn === dnn && data.FlowRules![i].snssai === flowKey) {
          data.FlowRules!.splice(i, 1);
          setData({ ...data });
        }
      }
    }
    if (data.QosFlows !== undefined) {
      for (let i = 0; i < data.QosFlows!.length; i++) {
        if (data.QosFlows![i].dnn === dnn && data.QosFlows![i].snssai === flowKey) {
          data.QosFlows!.splice(i, 1);
          setData({ ...data });
        }
      }
    }
  };

  const onUpSecurity = (dnn: DnnConfiguration | undefined) => {
    if (dnn !== undefined) {
      dnn.upSecurity = {};
    }
    setData({ ...data });
  };

  const onUpSecurityDelete = (dnn: DnnConfiguration | undefined) => {
    if (dnn !== undefined) {
      dnn.upSecurity = undefined;
    }
    setData({ ...data });
  };

  const isDefaultNssai = (nssai: Nssai | undefined) => {
    if (nssai === undefined || data.AccessAndMobilitySubscriptionData === undefined) {
      return false;
    } else {
      for (
        let i = 0;
        i < data.AccessAndMobilitySubscriptionData!.nssai!.defaultSingleNssais!.length;
        i++
      ) {
        const defaultNssai = data.AccessAndMobilitySubscriptionData!.nssai!.defaultSingleNssais![i];
        if (defaultNssai.sd === nssai.sd && defaultNssai.sst === nssai.sst) {
          return true;
        }
      }
      return false;
    }
  };

  const imsiValue = (imsi: string | undefined) => {
    if (imsi === undefined) {
      return "";
    } else {
      return imsi.replace("imsi-", "");
    }
  };

  const msisdnValue = (subData: AccessAndMobilitySubscriptionData | undefined) => {
    if (subData === undefined) {
      return "";
    } else {
      if (subData.gpsis !== undefined && subData.gpsis!.length !== 0) {
        return subData.gpsis[0].replace("msisdn-", "");
      } else {
        return "";
      }
    }
  };

  const handleChangeUserNumber = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    if (event.target.value === undefined) {
      setData({ ...data, userNumber: undefined });
    } else {
      const userNumber = Number(event.target.value);
      if (userNumber >= 1) {
	setData({ ...data, userNumber: Number(event.target.value) });
      }
    }
  };

  const handleChangePlmnId = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    setData({ ...data, plmnID: event.target.value });
  };

  const handleChangeUeId = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    setData({ ...data, ueId: "imsi-" + event.target.value });
  };

  const handleChangeMsisdn = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    setData({
      ...data,
      AccessAndMobilitySubscriptionData: {
        ...data.AccessAndMobilitySubscriptionData,
        gpsis: ["msisdn-" + event.target.value],
      },
    });
  };

  const handleChangeAuthenticationManagementField = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    setData({
      ...data,
      AuthenticationSubscription: {
        ...data.AuthenticationSubscription,
        authenticationManagementField: event.target.value,
      },
    });
  };

  const handleChangeAuthenticationMethod = (event: SelectChangeEvent<string>): void => {
    setData({
      ...data,
      AuthenticationSubscription: {
        ...data.AuthenticationSubscription,
        authenticationMethod: event.target.value,
      },
    });
  };

  const handleChangeK = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    setData({
      ...data,
      AuthenticationSubscription: {
        ...data.AuthenticationSubscription,
        permanentKey: {
          permanentKeyValue: event.target.value,
        },
      },
    });
  };

  const handleChangeOperatorCodeType = (event: SelectChangeEvent<string>): void => {
    if (event.target.value === "OP") {
      setOpcType("OP");
      const tmp = {
        ...data,
        AuthenticationSubscription: {
          ...data.AuthenticationSubscription,
          milenage: {
            op: {
              opValue: opcValue,
            },
          },
          opc: {
            opcValue: "",
          },
        },
      };
      setData(tmp);
    } else {
      setOpcType("OPc");
      const tmp = {
        ...data,
        AuthenticationSubscription: {
          ...data.AuthenticationSubscription,
          milenage: {
            op: {
              opValue: "",
            },
          },
          opc: {
            opcValue: opcValue,
          },
        },
      };
      setData(tmp);
    }
  };

  const handleChangeOperatorCodeValue = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    setOpcValue(event.target.value);
    const auth = data.AuthenticationSubscription;
    if (auth !== undefined) {
      if (opcType === "OP") {
        const tmp = {
          ...data,
          AuthenticationSubscription: {
            ...data.AuthenticationSubscription,
            milenage: {
              op: {
                opValue: event.target.value,
              },
            },
            opc: {
              opcValue: "",
            },
          },
        };
        setData(tmp);
      } else {
        const tmp = {
          ...data,
          AuthenticationSubscription: {
            ...data.AuthenticationSubscription,
            milenage: {
              op: {
                opValue: "",
              },
            },
            opc: {
              opcValue: event.target.value,
            },
          },
        };
        setData(tmp);
      }
    }
  };

  const handleChangeSQN = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    setData({
      ...data,
      AuthenticationSubscription: {
        ...data.AuthenticationSubscription,
        sequenceNumber: event.target.value,
      },
    });
  };

  const handleChangeSubAmbrUplink = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    setData({
      ...data,
      AccessAndMobilitySubscriptionData: {
        ...data.AccessAndMobilitySubscriptionData,
        subscribedUeAmbr: {
          ...data.AccessAndMobilitySubscriptionData?.subscribedUeAmbr,
          uplink: event.target.value,
        },
      },
    });
  };

  const handleChangeSubAmbrDownlink = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    setData({
      ...data,
      AccessAndMobilitySubscriptionData: {
        ...data.AccessAndMobilitySubscriptionData,
        subscribedUeAmbr: {
          ...data.AccessAndMobilitySubscriptionData?.subscribedUeAmbr,
          downlink: event.target.value,
        },
      },
    });
  };

  const handleChangeSST = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
  ): void => {
    if (event.target.value === "") {
      data.SessionManagementSubscriptionData![index].singleNssai!.sst = undefined;
    } else {
      data.SessionManagementSubscriptionData![index].singleNssai!.sst! = Number(event.target.value);
    }
    setData({ ...data });
  };

  const handleChangeSD = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
  ): void => {
    data.SessionManagementSubscriptionData![index].singleNssai!.sd! = event.target.value;
    setData({ ...data });
  };

  const handleChangeDefaultSnssai = (
    _event: React.ChangeEvent<HTMLInputElement>,
    nssai: Nssai | undefined,
  ) => {
    if (nssai === undefined) {
      return;
    }
    let isDefault = false;
    let def = undefined;
    if (data.AccessAndMobilitySubscriptionData!.nssai!.defaultSingleNssais !== undefined) {
      def = data.AccessAndMobilitySubscriptionData!.nssai!.defaultSingleNssais!;
      for (let i = 0; i < def.length; i++) {
        if (def[i].sd === nssai.sd && def[i].sst === nssai.sst) {
          def.splice(i, 1);
          isDefault = true;
        }
      }
    }
    let single = undefined;
    if (data.AccessAndMobilitySubscriptionData!.nssai!.singleNssais !== undefined) {
      single = data.AccessAndMobilitySubscriptionData!.nssai!.singleNssais!;
      for (let i = 0; i < single.length; i++) {
        if (single[i].sd === nssai.sd && single[i].sst === nssai.sst) {
          single.splice(i, 1);
        }
      }
    }
    if (isDefault) {
      if (single !== undefined) {
        single.push(nssai);
      }
    } else {
      if (def !== undefined) {
        def.push(nssai);
      }
    }
    data.AccessAndMobilitySubscriptionData!.nssai!.defaultSingleNssais = def;
    data.AccessAndMobilitySubscriptionData!.nssai!.singleNssais = single;
    setData({ ...data });
  };

  const dnnValue = (index: number) => {
    return dnnName[index];
  };

  const handleChangeDNN = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
  ): void => {
    dnnName[index] = event.target.value;
    setDnnName({ ...dnnName });
  };

  const handleChangeUplinkAMBR = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
    dnn: string,
  ): void => {
    data.SessionManagementSubscriptionData![index].dnnConfigurations![dnn].sessionAmbr!.uplink =
      event.target.value;
    setData({ ...data });
  };

  const handleChangeDownlinkAMBR = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
    dnn: string,
  ): void => {
    data.SessionManagementSubscriptionData![index].dnnConfigurations![dnn].sessionAmbr!.downlink =
      event.target.value;
    setData({ ...data });
  };

  const handleChangeDefault5QI = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
    dnn: string,
  ): void => {
    if (event.target.value === "") {
      data.SessionManagementSubscriptionData![index].dnnConfigurations![dnn]["5gQosProfile"]![
        "5qi"
      ] = undefined;
    } else {
      data.SessionManagementSubscriptionData![index].dnnConfigurations![dnn]["5gQosProfile"]![
        "5qi"
      ] = Number(event.target.value);
    }
    setData({ ...data });
  };

  const handleChangeFilter = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    dnn: string,
    flowKey: string,
  ): void => {
    if (data.FlowRules !== undefined) {
      for (let i = 0; i < data.FlowRules!.length; i++) {
        if (data.FlowRules![i].snssai === flowKey && data.FlowRules![i].dnn === dnn) {
          data.FlowRules![i].filter = event.target.value;
          setData({ ...data });
        }
      }
    }
  };

  const handleChangePrecedence = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    dnn: string,
    flowKey: string,
  ): void => {
    if (data.FlowRules !== undefined) {
      for (let i = 0; i < data.FlowRules!.length; i++) {
        if (data.FlowRules![i].snssai === flowKey && data.FlowRules![i].dnn === dnn) {
          if (event.target.value == "") {
            data.FlowRules![i].precedence = undefined;
          } else {
            data.FlowRules![i].precedence = Number(event.target.value);
          }
          setData({ ...data });
        }
      }
    }
  };

  const handleChange5QI = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    dnn: string,
    flowKey: string,
  ): void => {
    if (data.FlowRules !== undefined) {
      for (let i = 0; i < data.FlowRules!.length; i++) {
        if (data.FlowRules![i].snssai === flowKey && data.FlowRules![i].dnn === dnn) {
          if (event.target.value == "") {
            data.FlowRules![i].qfi = undefined;
          } else {
            data.FlowRules![i].qfi = Number(event.target.value);
          }
          setData({ ...data });
        }
      }
    }
    if (data.QosFlows !== undefined) {
      for (let i = 0; i < data.QosFlows!.length; i++) {
        if (data.QosFlows![i].snssai === flowKey && data.QosFlows![i].dnn === dnn) {
          if (event.target.value == "") {
            data.QosFlows![i].qfi = undefined;
            data.QosFlows![i]["5qi"] = undefined;
          } else {
            data.QosFlows![i].qfi = Number(event.target.value);
            data.QosFlows![i]["5qi"] = Number(event.target.value);
          }
          setData({ ...data });
        }
      }
    }
  };

  const handleChangeUplinkGBR = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    dnn: string,
    flowKey: string,
  ): void => {
    if (data.QosFlows !== undefined) {
      for (let i = 0; i < data.QosFlows!.length; i++) {
        if (data.QosFlows![i].snssai === flowKey && data.QosFlows![i].dnn === dnn) {
          data.QosFlows![i].gbrUL = event.target.value;
          setData({ ...data });
        }
      }
    }
  };

  const handleChangeDownlinkGBR = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    dnn: string,
    flowKey: string,
  ): void => {
    if (data.QosFlows !== undefined) {
      for (let i = 0; i < data.QosFlows!.length; i++) {
        if (data.QosFlows![i].snssai === flowKey && data.QosFlows![i].dnn === dnn) {
          data.QosFlows![i].gbrDL = event.target.value;
          setData({ ...data });
        }
      }
    }
  };

  const handleChangeUplinkMBR = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    dnn: string,
    flowKey: string,
  ): void => {
    if (data.QosFlows !== undefined) {
      for (let i = 0; i < data.QosFlows!.length; i++) {
        if (data.QosFlows![i].snssai === flowKey && data.QosFlows![i].dnn === dnn) {
          data.QosFlows![i].mbrUL = event.target.value;
          setData({ ...data });
        }
      }
    }
  };

  const handleChangeDownlinkMBR = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    dnn: string,
    flowKey: string,
  ): void => {
    if (data.QosFlows !== undefined) {
      for (let i = 0; i < data.QosFlows!.length; i++) {
        if (data.QosFlows![i].snssai === flowKey && data.QosFlows![i].dnn === dnn) {
          data.QosFlows![i].mbrDL = event.target.value;
          setData({ ...data });
        }
      }
    }
  };

  const handleChangeUpIntegrity = (
    event: SelectChangeEvent<string>,
    dnn: DnnConfiguration,
  ): void => {
    if (dnn.upSecurity !== undefined) {
      dnn.upSecurity!.upIntegr = event.target.value;
    }
    setData({ ...data });
  };

  const handleChangeUpConfidentiality = (
    event: SelectChangeEvent<string>,
    dnn: DnnConfiguration,
  ): void => {
    if (dnn.upSecurity !== undefined) {
      dnn.upSecurity!.upConfid = event.target.value;
    }
    setData({ ...data });
  };

  const qosFlow = (flowKey: string, dnn: string): QosFlows|undefined => {
    if (data.QosFlows !== undefined) {
      for (let i = 0; i < data.QosFlows?.length; i++) {
        const qos = data.QosFlows![i];
        if (qos.snssai === flowKey && qos.dnn === dnn) {
          return qos;
        }
      }
    }
  }

  const flowRule = (dnn: string, snssai: Nssai) => {
    function toHex(v: number | undefined) {
      return ("00" + v?.toString(16).toUpperCase()).substr(-2);
    }
    const flowKey = toHex(snssai.sst) + snssai.sd;
    if (data.FlowRules !== undefined) {
      for (let i = 0; i < data.FlowRules?.length; i++) {
        const flow = data.FlowRules![i];
        if (flow.snssai === flowKey && flow.dnn === dnn) {
          const qos = qosFlow(flowKey, dnn);
          return (
            <div key={flow.snssai}>
              <Box sx={{ m: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={10}>
                    <h4>Flow Rules</h4>
                  </Grid>
                  <Grid item xs={2}>
                    <Box display="flex" justifyContent="flex-end">
                      <Button
                        color="secondary"
                        variant="contained"
                        onClick={() => onFlowRulesDelete(dnn, flowKey)}
                        sx={{ m: 2, backgroundColor: "red", "&:hover": { backgroundColor: "red" } }}
                      >
                        DELETE
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
                <Card variant="outlined">
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <TextField
                            label="IP Filter"
                            variant="outlined"
                            required
                            fullWidth
                            value={flow.filter}
                            onChange={(ev) => handleChangeFilter(ev, dnn, flowKey)}
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <TextField
                            label="Precedence"
                            variant="outlined"
                            required
                            fullWidth
                            type="number"
                            value={flow.precedence}
                            onChange={(ev) => handleChangePrecedence(ev, dnn, flowKey)}
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <TextField
                            label="5QI"
                            variant="outlined"
                            required
                            fullWidth
                            type="number"
                            value={flow.qfi}
                            onChange={(ev) => handleChange5QI(ev, dnn, flowKey)}
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <TextField
                            label="Uplink GBR"
                            variant="outlined"
                            required
                            fullWidth
                            value={qos!.gbrUL}
                            onChange={(ev) => handleChangeUplinkGBR(ev, dnn, flowKey)}
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <TextField
                            label="Downlink GBR"
                            variant="outlined"
                            required
                            fullWidth
                            value={qos!.gbrDL}
                            onChange={(ev) => handleChangeDownlinkGBR(ev, dnn, flowKey)}
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <TextField
                            label="Uplink MBR"
                            variant="outlined"
                            required
                            fullWidth
                            value={qos!.mbrUL}
                            onChange={(ev) => handleChangeUplinkMBR(ev, dnn, flowKey)}
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <TextField
                            label="Downlink MBR"
                            variant="outlined"
                            required
                            fullWidth
                            value={qos!.mbrDL}
                            onChange={(ev) => handleChangeDownlinkMBR(ev, dnn, flowKey)}
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Card>
              </Box>
            </div>
          );
        }
      }
    }
    return (
      <div>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>
                <Button
                  color="secondary"
                  variant="contained"
                  onClick={() => onFlowRules(dnn, flowKey)}
                  sx={{ m: 0 }}
                >
                  +FLOW RULE
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  };

  const upSecurity = (dnn: DnnConfiguration | undefined) => {
    if (dnn !== undefined && dnn!.upSecurity !== undefined) {
      const security = dnn!.upSecurity!;
      return (
        <div key={security.upIntegr}>
          <Box sx={{ m: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={10}>
                <h4>UP Security</h4>
              </Grid>
              <Grid item xs={2}>
                <Box display="flex" justifyContent="flex-end">
                  <Button
                    color="secondary"
                    variant="contained"
                    onClick={() => onUpSecurityDelete(dnn)}
                    sx={{ m: 2, backgroundColor: "red", "&:hover": { backgroundColor: "red" } }}
                  >
                    DELETE
                  </Button>
                </Box>
              </Grid>
            </Grid>
            <Card variant="outlined">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <FormControl variant="outlined" fullWidth>
                        <InputLabel>Integrity of UP Security</InputLabel>
                        <Select
                          label="Integrity of UP Security"
                          variant="outlined"
                          required
                          fullWidth
                          value={security.upIntegr}
                          onChange={(ev) => handleChangeUpIntegrity(ev, dnn)}
                        >
                          <MenuItem value="NOT_NEEDED">NOT_NEEDED</MenuItem>
                          <MenuItem value="PREFERRED">PREFERRED</MenuItem>
                          <MenuItem value="REQUIRED">REQUIRED</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                </TableBody>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <FormControl variant="outlined" fullWidth>
                        <InputLabel>Confidentiality of UP Security</InputLabel>
                        <Select
                          label="Confidentiality of UP Security"
                          variant="outlined"
                          required
                          fullWidth
                          value={security.upConfid}
                          onChange={(ev) => handleChangeUpConfidentiality(ev, dnn)}
                        >
                          <MenuItem value="NOT_NEEDED">NOT_NEEDED</MenuItem>
                          <MenuItem value="PREFERRED">PREFERRED</MenuItem>
                          <MenuItem value="REQUIRED">REQUIRED</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Card>
          </Box>
        </div>
      );
    } else {
      return (
        <div>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Button
                    color="secondary"
                    variant="contained"
                    onClick={() => onUpSecurity(dnn)}
                    sx={{ m: 0 }}
                  >
                    +UP SECURITY
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      );
    }
  };

  return (
    <Dashboard title="Subscription">
      <Card variant="outlined">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>
                <TextField
                  label="Subscriber data number (auto-incresed with SUPI)"
                  variant="outlined"
                  required
                  fullWidth
                  value={data.userNumber}
                  onChange={handleChangeUserNumber}
                  type="number"
                />
              </TableCell>
            </TableRow>
          </TableBody>
          <TableBody>
            <TableRow>
              <TableCell>
                <TextField
                  label="PLMN ID"
                  variant="outlined"
                  required
                  fullWidth
                  value={data.plmnID}
                  onChange={handleChangePlmnId}
                />
              </TableCell>
            </TableRow>
          </TableBody>
          <TableBody>
            <TableRow>
              <TableCell>
                <TextField
                  label="SUPI (IMSI)"
                  variant="outlined"
                  required
                  fullWidth
                  value={imsiValue(data.ueId)}
                  onChange={handleChangeUeId}
                />
              </TableCell>
            </TableRow>
          </TableBody>
          <TableBody>
            <TableRow>
              <TableCell>
                <TextField
                  label="MSISDN"
                  variant="outlined"
                  required
                  fullWidth
                  value={msisdnValue(data.AccessAndMobilitySubscriptionData)}
                  onChange={handleChangeMsisdn}
                />
              </TableCell>
            </TableRow>
          </TableBody>
          <TableBody>
            <TableRow>
              <TableCell>
                <TextField
                  label="Authentication Management Field (AMF)"
                  variant="outlined"
                  required
                  fullWidth
                  value={data.AuthenticationSubscription?.authenticationManagementField}
                  onChange={handleChangeAuthenticationManagementField}
                />
              </TableCell>
            </TableRow>
          </TableBody>
          <TableBody>
            <TableRow>
              <TableCell align="left">
                <FormControl variant="outlined" fullWidth>
                  <InputLabel>Authentication Method</InputLabel>
                  <Select
                    label="Authentication Method"
                    variant="outlined"
                    required
                    fullWidth
                    value={data.AuthenticationSubscription?.authenticationMethod}
                    onChange={handleChangeAuthenticationMethod}
                  >
                    <MenuItem value="5G_AKA">5G_AKA</MenuItem>
                    <MenuItem value="EAP_AKA_PRIME">EAP_AKA_PRIME</MenuItem>
                  </Select>
                </FormControl>
              </TableCell>
            </TableRow>
          </TableBody>
          <TableBody>
            <TableRow>
              <TableCell>
                <TextField
                  label="K"
                  variant="outlined"
                  required
                  fullWidth
                  value={data.AuthenticationSubscription?.permanentKey?.permanentKeyValue}
                  onChange={handleChangeK}
                />
              </TableCell>
            </TableRow>
          </TableBody>
          <TableBody>
            <TableRow>
              <TableCell align="left">
                <FormControl variant="outlined" fullWidth>
                  <InputLabel>Operator Code Type</InputLabel>
                  <Select
                    label="Operator Code Type"
                    variant="outlined"
                    required
                    fullWidth
                    value={opcType}
                    onChange={handleChangeOperatorCodeType}
                  >
                    <MenuItem value="OP">OP</MenuItem>
                    <MenuItem value="OPc">OPc</MenuItem>
                  </Select>
                </FormControl>
              </TableCell>
            </TableRow>
          </TableBody>
          <TableBody>
            <TableRow>
              <TableCell>
                <TextField
                  label="Operator Code Value"
                  variant="outlined"
                  required
                  fullWidth
                  value={opcValue}
                  onChange={handleChangeOperatorCodeValue}
                />
              </TableCell>
            </TableRow>
          </TableBody>
          <TableBody>
            <TableRow>
              <TableCell>
                <TextField
                  label="SQN"
                  variant="outlined"
                  required
                  fullWidth
                  value={data.AuthenticationSubscription?.sequenceNumber}
                  onChange={handleChangeSQN}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
      <h3>Subscribed UE AMBR</h3>
      <Card variant="outlined">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>
                <TextField
                  label="Uplink"
                  variant="outlined"
                  required
                  fullWidth
                  value={data.AccessAndMobilitySubscriptionData?.subscribedUeAmbr?.uplink}
                  onChange={handleChangeSubAmbrUplink}
                />
              </TableCell>
            </TableRow>
          </TableBody>
          <TableBody>
            <TableRow>
              <TableCell>
                <TextField
                  label="Downlink"
                  variant="outlined"
                  required
                  fullWidth
                  value={data.AccessAndMobilitySubscriptionData?.subscribedUeAmbr?.downlink}
                  onChange={handleChangeSubAmbrDownlink}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
      {data.SessionManagementSubscriptionData?.map((row, index) => (
        <div key={index}>
          <Grid container spacing={2}>
            <Grid item xs={10}>
              <h3>S-NSSAI Configuragtion</h3>
            </Grid>
            <Grid item xs={2}>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  color="secondary"
                  variant="contained"
                  onClick={() => onSnssaiDelete(index)}
                  sx={{ m: 2, backgroundColor: "red", "&:hover": { backgroundColor: "red" } }}
                >
                  DELETE
                </Button>
              </Box>
            </Grid>
          </Grid>
          <Card variant="outlined">
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <TextField
                      label="SST"
                      variant="outlined"
                      required
                      fullWidth
                      type="number"
                      value={row.singleNssai?.sst}
                      onChange={(ev) => handleChangeSST(ev, index)}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <TextField
                      label="SD"
                      variant="outlined"
                      required
                      fullWidth
                      value={row.singleNssai?.sd}
                      onChange={(ev) => handleChangeSD(ev, index)}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
              <TableBody>
                <TableRow>
                  <TableCell style={{ width: "83%" }}>Default S-NSSAI</TableCell>
                  <TableCell align="right">
                    <Checkbox
                      checked={isDefaultNssai(row.singleNssai)}
                      onChange={(ev) => handleChangeDefaultSnssai(ev, row.singleNssai)}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            {row.dnnConfigurations &&
              Object.keys(row.dnnConfigurations!).map((dnn) => (
                <div key={dnn}>
                  <Box sx={{ m: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={10}>
                        <h4>DNN Configurations</h4>
                      </Grid>
                      <Grid item xs={2}>
                        <Box display="flex" justifyContent="flex-end">
                          <Button
                            color="secondary"
                            variant="contained"
                            onClick={() => onDnnDelete(index, dnn)}
                            sx={{
                              m: 2,
                              backgroundColor: "red",
                              "&:hover": { backgroundColor: "red" },
                            }}
                          >
                            DELETE
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                    <Card variant="outlined">
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <b>{dnn}</b>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <TextField
                                label="Uplink AMBR"
                                variant="outlined"
                                required
                                fullWidth
                                value={row.dnnConfigurations![dnn].sessionAmbr?.uplink}
                                onChange={(ev) => handleChangeUplinkAMBR(ev, index, dnn)}
                              />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <TextField
                                label="Downlink AMBR"
                                variant="outlined"
                                required
                                fullWidth
                                value={row.dnnConfigurations![dnn].sessionAmbr?.downlink}
                                onChange={(ev) => handleChangeDownlinkAMBR(ev, index, dnn)}
                              />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <TextField
                                label="Default 5QI"
                                variant="outlined"
                                required
                                fullWidth
                                type="number"
                                value={row.dnnConfigurations![dnn]["5gQosProfile"]?.["5qi"]}
                                onChange={(ev) => handleChangeDefault5QI(ev, index, dnn)}
                              />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                      {flowRule(dnn, row.singleNssai!)}
                      {upSecurity(row.dnnConfigurations![dnn])}
                    </Card>
                  </Box>
                </div>
              ))}
            <Grid container spacing={2}>
              <Grid item xs={10}>
                <Box sx={{ m: 2 }}>
                  <TextField
                    label="Data Network Name"
                    variant="outlined"
                    required
                    fullWidth
                    value={dnnValue(index)}
                    onChange={(ev) => handleChangeDNN(ev, index)}
                  />
                </Box>
              </Grid>
              <Grid item xs={2}>
                <Box display="flex" justifyContent="flex-end">
                  <Button
                    color="secondary"
                    variant="contained"
                    onClick={() => onDnn(index)}
                    sx={{ m: 3 }}
                  >
                    &nbsp;&nbsp;+DNN&nbsp;&nbsp;
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </div>
      ))}
      <br />
      <Grid item xs={12}>
        <Button color="secondary" variant="contained" onClick={onSnssai} sx={{ m: 1 }}>
          +SNSSAI
        </Button>
      </Grid>
      <br />
      <Grid item xs={12}>
        <Button color="primary" variant="contained" onClick={onCreate} sx={{ m: 1 }}>
          CREATE
        </Button>
      </Grid>
    </Dashboard>
  );
}
