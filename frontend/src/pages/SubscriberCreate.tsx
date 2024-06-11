import React from "react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import axios from "../axios";
import type { Nssai, AccessAndMobilitySubscriptionData, QosFlows, IpAddress } from "../api/api";

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
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useSubscriptionForm } from "../hooks/subscription-form";

interface VerifyScope {
  supi: string;
  sd: string;
  sst: number;
  dnn: string;
  ipaddr: string;
}

interface VerifyResult {
  ipaddr: string;
  valid: boolean;
  cause: string;
}

const handleVerifyStaticIp = (sd: string, sst: number, dnn: string, ipaddr: string) => {
  const scope: VerifyScope = {
    supi: "",
    sd: sd,
    sst: sst,
    dnn: dnn,
    ipaddr: ipaddr,
  };
  axios.post("/api/verify-staticip", scope).then((res) => {
    const result = res.data as VerifyResult;
    console.log(result);
    if (result["valid"] === true) {
      alert("OK\n" + result.ipaddr);
    } else {
      alert("NO!\nCause: " + result["cause"]);
    }
  });
};

import { RawOff } from "@mui/icons-material";

let isNewSubscriber = false;

export default function SubscriberCreate() {
  const { id, plmn } = useParams<{
    id: string;
    plmn: string;
  }>();

  isNewSubscriber = id === undefined && plmn === undefined;
  const navigation = useNavigate();

  const {
    register,
    validationErrors,
    handleSubmit,
    watch,
    getValues,
    setValue,
    reset,
    sessionSubscriptionFields,
    defaultSingleNssais,
    addDefaultSingleNssai,
    removeDefaultSingleNssai,
    opcType,
    setOpcType,
    opcValue,
    setOpcValue,
    dnnName,
    setDnnName,
  } = useSubscriptionForm();

  const {
    fields: sessionManagementSubscriptionData,
    append: appendSessionSubscription,
    remove: removeSessionSubscription,
  } = sessionSubscriptionFields;

  if (!isNewSubscriber) {
    useEffect(() => {
      axios.get("/api/subscriber/" + id + "/" + plmn).then((res) => {
        reset(res.data);
      });
    }, [id]);
  }

  function toHex(v: number | undefined): string {
    return ("00" + v?.toString(16).toUpperCase()).substr(-2);
  }

  const nssai2KeyString = (nssai: Nssai) => {
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
  };

  const onCreate = () => {
    const data = getValues();

    if (data.SessionManagementSubscriptionData === undefined) {
      alert("Please add at least one S-NSSAI");
      return;
    }
    for (let i = 0; i < data.SessionManagementSubscriptionData!.length; i++) {
      const nssai = data.SessionManagementSubscriptionData![i];
      const key = nssai2KeyString(nssai.singleNssai!);
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
        .then(() => {
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

  const onUpdate = () => {
    const data = getValues();

    data.SmfSelectionSubscriptionData = {
      subscribedSnssaiInfos: {},
    };
    data.SmPolicyData = {
      smPolicySnssaiData: {},
    };
    for (let i = 0; i < data.SessionManagementSubscriptionData!.length; i++) {
      const nssai = data.SessionManagementSubscriptionData![i];
      const key = nssai2KeyString(nssai.singleNssai!);
      if (nssai.dnnConfigurations !== undefined) {
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
    }
    axios
      .put("/api/subscriber/" + data.ueId + "/" + data.plmnID, data)
      .then(() => {
        navigation("/subscriber/" + data.ueId + "/" + data.plmnID);
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
      });
  };

  const onDnnAdd = (index: number) => {
    const sessionManagementSubscriptionData = getValues()["SessionManagementSubscriptionData"];
    if (sessionManagementSubscriptionData === undefined) {
      return;
    }

    const name = dnnName[index];
    if (name === undefined || name === "") {
      return;
    }
    // TODO: add charging rule for this DNN
    const session = sessionManagementSubscriptionData[index];
    if (session.dnnConfigurations === undefined) {
      session.dnnConfigurations = {};
    }

    session.dnnConfigurations[name] = {
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
      sessionAmbr: {
        uplink: "",
        downlink: "",
      },
    };
    setValue("SessionManagementSubscriptionData", sessionManagementSubscriptionData);
    dnnName[index] = "";
    setDnnName({ ...dnnName });
  };

  const onDnnDelete = (index: number, dnn: string, slice: string) => {
    const sessionManagementSubscriptionData = getValues()["SessionManagementSubscriptionData"];
    const session = sessionManagementSubscriptionData[index];
    if (session.dnnConfigurations === undefined) {
      return;
    }
    delete session.dnnConfigurations[dnn];
    setValue("SessionManagementSubscriptionData", sessionManagementSubscriptionData);

    const chargingDatas = getValues()["ChargingDatas"];
    if (chargingDatas === undefined) {
      return;
    }
    // Remove all flow-based charging rule in this DNN
    for (let i = 0; i < chargingDatas.length; i++) {
      if (chargingDatas[i].dnn === dnn && chargingDatas[i].snssai === slice) {
        chargingDatas.splice(i, 1);
        i--;
      }
    }
    setValue("ChargingDatas", chargingDatas);
  };

  const onFlowRulesDelete = (dnn: string, flowKey: string, qosRef: number | undefined) => {
    const flowRules = getValues()["FlowRules"];
    if (flowRules !== undefined) {
      for (let i = 0; i < flowRules.length; i++) {
        if (
          flowRules[i].dnn === dnn &&
          flowRules[i].snssai === flowKey &&
          flowRules[i].qosRef === qosRef
        ) {
          flowRules.splice(i, 1);
          i--;
        }
      }
    }
    setValue("FlowRules", flowRules);

    const qosFlows = getValues()["QosFlows"];
    if (qosFlows !== undefined) {
      for (let i = 0; i < qosFlows.length; i++) {
        if (
          qosFlows[i].dnn === dnn &&
          qosFlows[i].snssai === flowKey &&
          qosFlows[i].qosRef === qosRef
        ) {
          qosFlows.splice(i, 1);
          i--;
        }
      }
    }
    setValue("QosFlows", qosFlows);

    const chargingDatas = getValues()["ChargingDatas"];
    if (chargingDatas !== undefined) {
      for (let i = 0; i < chargingDatas.length; i++) {
        if (chargingDatas[i].qosRef === qosRef) {
          chargingDatas.splice(i, 1);
          i--;
        }
      }
    }
    setValue("ChargingDatas", chargingDatas);
  };

  const onUpSecurity = (sessionIndex: number, dnnKey?: string) => {
    if (dnnKey === undefined) {
      return;
    }

    const dnn =
      getValues()["SessionManagementSubscriptionData"][sessionIndex].dnnConfigurations![dnnKey];

    if (dnn !== undefined) {
      dnn.upSecurity = {
        upIntegr: "NOT_NEEDED",
        upConfid: "NOT_NEEDED",
      };
    }

    setValue(`SessionManagementSubscriptionData.${sessionIndex}.dnnConfigurations.${dnnKey}`, dnn);
  };

  function selectQosRef(): number {
    const qosFlows = getValues()["QosFlows"];

    const UsedQosRef = [];
    for (let i = 0; i < qosFlows.length; i++) {
      UsedQosRef.push(qosFlows[i].qosRef);
    }
    for (let i = 1; i < 256; i++) {
      if (!UsedQosRef.includes(i)) {
        return i;
      }
    }

    window.alert("Cannot select qosRef in 1~128.");
    return -1;
  }

  function select5Qi(dnn: string, snssai: Nssai): number {
    const qosFlows = getValues()["QosFlows"];

    const sstsd = toHex(snssai.sst) + snssai.sd!;
    const filteredQosFlows = qosFlows.filter((qos) => qos.dnn === dnn && qos.snssai === sstsd);
    const Used5Qi = [];
    for (let i = 0; i < filteredQosFlows.length; i++) {
      Used5Qi.push(filteredQosFlows[i]["5qi"]);
    }
    Used5Qi.sort((a, b) => a! - b!);
    if (Used5Qi[Used5Qi.length - 1]! < 255) {
      return Used5Qi[Used5Qi.length - 1]! + 1;
    }
    return 255;
  }

  const onFlowRulesAdd = (dnn: string, snssai: Nssai) => {
    let flowRules = getValues()["FlowRules"];
    if (flowRules === undefined) {
      flowRules = [];
    }

    const sstSd = toHex(snssai.sst) + snssai.sd!;
    let filter = "8.8.8.8/32";
    for (;;) {
      let flag = false;
      for (let i = 0; i < flowRules.length; i++) {
        if (filter === flowRules[i]!.filter) {
          const c = Math.floor(Math.random() * 256);
          const d = Math.floor(Math.random() * 256);
          filter = "10.10." + c.toString() + "." + d.toString() + "/32";
          flag = true;
          break;
        }
      }

      if (!flag) break;
    }

    const selected5Qi = select5Qi(dnn, snssai);
    const selectedQosRef = selectQosRef();

    flowRules.push({
      filter: filter,
      precedence: 127,
      snssai: sstSd,
      dnn: dnn,
      qosRef: selectedQosRef,
    });
    setValue("FlowRules", flowRules);

    let qosFlows = getValues()["QosFlows"];
    if (qosFlows === undefined) {
      qosFlows = [];
    }

    qosFlows.push({
      snssai: sstSd,
      dnn: dnn,
      qosRef: selectedQosRef,
      "5qi": selected5Qi,
      mbrUL: "200 Mbps",
      mbrDL: "200 Mbps",
      gbrUL: "100 Mbps",
      gbrDL: "100 Mbps",
    });
    setValue("QosFlows", qosFlows);

    let chargingDatas = getValues()["ChargingDatas"];
    if (chargingDatas === undefined) {
      chargingDatas = [];
    }

    chargingDatas.push({
      snssai: sstSd,
      dnn: dnn,
      qosRef: selectedQosRef,
      filter: filter,
      chargingMethod: "Online",
      quota: "10000",
      unitCost: "1",
    });
    setValue("ChargingDatas", chargingDatas);
  };

  const onUpSecurityDelete = (sessionIndex: number, dnnKey?: string) => {
    setValue(
      `SessionManagementSubscriptionData.${sessionIndex}.dnnConfigurations.${dnnKey}.upSecurity`,
      undefined,
    );
  };

  const isDefaultNssai = (nssai: Nssai) => {
    const defaultNssais = watch("AccessAndMobilitySubscriptionData.nssai.defaultSingleNssais");
    return defaultNssais.some((n) => n.sd === nssai.sd && n.sst === nssai.sst);
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

  const handleChangeMsisdn = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    setValue("AccessAndMobilitySubscriptionData.gpsis", ["msisdn-" + event.target.value]);
  };

  const handleChangeOperatorCodeType = (event: SelectChangeEvent<string>): void => {
    const auth = getValues()["AuthenticationSubscription"];

    if (event.target.value === "OP") {
      setOpcType("OP");
      const tmp = {
        ...auth,
        milenage: {
          op: {
            opValue: opcValue,
            encryptionKey: 0,
            encryptionAlgorithm: 0,
          },
        },
        opc: {
          opcValue: "",
          encryptionKey: 0,
          encryptionAlgorithm: 0,
        },
      };
      setValue("AuthenticationSubscription", tmp);
    } else {
      setOpcType("OPc");
      const tmp = {
        ...auth,
        milenage: {
          op: {
            opValue: "",
            encryptionKey: 0,
            encryptionAlgorithm: 0,
          },
        },
        opc: {
          opcValue: opcValue,
          encryptionKey: 0,
          encryptionAlgorithm: 0,
        },
      };
      setValue("AuthenticationSubscription", tmp);
    }
  };

  const handleChangeOperatorCodeValue = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    setOpcValue(event.target.value);
    const auth = getValues()["AuthenticationSubscription"];
    if (auth !== undefined) {
      if (opcType === "OP") {
        const tmp = {
          ...auth,
          milenage: {
            op: {
              opValue: event.target.value,
              encryptionKey: 0,
              encryptionAlgorithm: 0,
            },
          },
          opc: {
            opcValue: "",
            encryptionKey: 0,
            encryptionAlgorithm: 0,
          },
        };
        setValue("AuthenticationSubscription", tmp);
      } else {
        const tmp = {
          ...auth,
          milenage: {
            op: {
              opValue: "",
              encryptionKey: 0,
              encryptionAlgorithm: 0,
            },
          },
          opc: {
            opcValue: event.target.value,
            encryptionKey: 0,
            encryptionAlgorithm: 0,
          },
        };
        setValue("AuthenticationSubscription", tmp);
      }
    }
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

  const handleToggleStaticIp = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number,
    dnn: string,
  ) => {
    const dnnConfig =
      getValues()["SessionManagementSubscriptionData"][index].dnnConfigurations![dnn];

    const defaultStaticIpAddresses: IpAddress[] = [{ ipv4Addr: "10.60.100.1" }];
    if (event.target.checked) {
      dnnConfig.staticIpAddress = defaultStaticIpAddresses;
    } else {
      dnnConfig.staticIpAddress = [];
    }

    setValue(`SessionManagementSubscriptionData.${index}.dnnConfigurations.${dnn}`, dnnConfig);
  };

  const handleChangeStaticIp = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
    dnn: string,
  ): void => {
    const dnnConfig =
      getValues()["SessionManagementSubscriptionData"][index].dnnConfigurations![dnn];
    dnnConfig.staticIpAddress = [{ ipv4Addr: event.target.value }];

    setValue(`SessionManagementSubscriptionData.${index}.dnnConfigurations.${dnn}`, dnnConfig);
  };

  const handleChangeFilter = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    dnn: string,
    flowKey: string,
    qosRef: number,
  ): void => {
    const flowRules = getValues()["FlowRules"];
    if (flowRules !== undefined) {
      for (let i = 0; i < flowRules.length; i++) {
        if (
          flowRules[i].snssai === flowKey &&
          flowRules[i].dnn === dnn &&
          flowRules[i].qosRef === qosRef
        ) {
          flowRules[i].filter = event.target.value;
        }
      }
      setValue("FlowRules", flowRules);
    }

    const chargingDatas = getValues()["ChargingDatas"];
    if (chargingDatas !== undefined) {
      for (let i = 0; i < chargingDatas.length; i++) {
        if (
          chargingDatas[i].snssai === flowKey &&
          chargingDatas[i].dnn === dnn &&
          chargingDatas[i].qosRef === qosRef
        ) {
          chargingDatas[i].filter = event.target.value;
        }
      }
      setValue("ChargingDatas", chargingDatas);
    }
  };

  const handleChangePrecedence = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    dnn: string,
    flowKey: string,
    qosRef: number,
  ): void => {
    const flowRules = getValues()["FlowRules"];
    if (flowRules !== undefined) {
      for (let i = 0; i < flowRules.length; i++) {
        if (
          flowRules[i].snssai === flowKey &&
          flowRules[i].dnn === dnn &&
          flowRules[i].qosRef === qosRef
        ) {
          if (event.target.value == "") {
            flowRules[i].precedence = undefined;
          } else {
            flowRules[i].precedence = Number(event.target.value);
          }
        }
      }
      setValue("FlowRules", flowRules);
    }
  };

  const handleChange5QI = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    dnn: string,
    flowKey: string,
    qosRef: number,
  ): void => {
    const qosFlows = getValues()["QosFlows"];
    if (qosFlows === undefined) {
      return;
    }

    for (let i = 0; i < qosFlows.length; i++) {
      if (
        qosFlows[i].snssai === flowKey &&
        qosFlows[i].dnn === dnn &&
        qosFlows[i].qosRef === qosRef
      ) {
        if (event.target.value == "") {
          qosFlows[i]["5qi"] = 8;
        } else {
          qosFlows[i]["5qi"] = Number(event.target.value);
        }
      }
    }
    setValue("QosFlows", qosFlows);
  };

  const handleChangeUplinkGBR = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    dnn: string,
    flowKey: string,
    qosRef: number,
  ): void => {
    const qosFlows = getValues()["QosFlows"];
    if (qosFlows === undefined) {
      return;
    }

    for (let i = 0; i < qosFlows.length; i++) {
      if (
        qosFlows[i].snssai === flowKey &&
        qosFlows[i].dnn === dnn &&
        qosFlows[i].qosRef === qosRef
      ) {
        qosFlows[i].gbrUL = event.target.value;
      }
    }
    setValue("QosFlows", qosFlows);
  };

  const handleChangeDownlinkGBR = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    dnn: string,
    flowKey: string,
    qosRef: number,
  ): void => {
    const qosFlows = getValues()["QosFlows"];
    if (qosFlows === undefined) {
      return;
    }

    for (let i = 0; i < qosFlows.length; i++) {
      if (
        qosFlows[i].snssai === flowKey &&
        qosFlows[i].dnn === dnn &&
        qosFlows[i].qosRef === qosRef
      ) {
        qosFlows[i].gbrDL = event.target.value;
      }
    }
    setValue("QosFlows", qosFlows);
  };

  const handleChangeUplinkMBR = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    dnn: string,
    flowKey: string,
    qosRef: number,
  ): void => {
    const qosFlows = getValues()["QosFlows"];
    if (qosFlows === undefined) {
      return;
    }

    for (let i = 0; i < qosFlows.length; i++) {
      if (
        qosFlows[i].snssai === flowKey &&
        qosFlows[i].dnn === dnn &&
        qosFlows[i].qosRef === qosRef
      ) {
        qosFlows[i].mbrUL = event.target.value;
      }
    }
    setValue("QosFlows", qosFlows);
  };

  const handleChangeDownlinkMBR = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    dnn: string,
    flowKey: string,
    qosRef: number,
  ): void => {
    const qosFlows = getValues()["QosFlows"];
    if (qosFlows === undefined) {
      return;
    }

    for (let i = 0; i < qosFlows.length; i++) {
      if (
        qosFlows[i].snssai === flowKey &&
        qosFlows[i].dnn === dnn &&
        qosFlows[i].qosRef === qosRef
      ) {
        qosFlows[i].mbrDL = event.target.value;
      }
    }
    setValue("QosFlows", qosFlows);
  };

  const handleChangeChargingMethod = (
    event: SelectChangeEvent<string>,
    dnn: string | undefined,
    flowKey: string,
    filter: string | undefined,
  ): void => {
    const chargingDatas = getValues()["ChargingDatas"];
    const chargingData = chargingDatas.find(
      (chargingData) =>
        chargingData.snssai === flowKey &&
        chargingData.dnn === dnn &&
        chargingData.filter === filter,
    );

    if (chargingData === undefined) {
      return;
    }

    chargingData.chargingMethod = event.target.value;
    setValue(`ChargingDatas.${chargingDatas.indexOf(chargingData)}`, chargingData);
  };

  const handleChangeChargingQuota = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    dnn: string | undefined,
    flowKey: string,
    filter: string | undefined,
  ): void => {
    const chargingDatas = getValues()["ChargingDatas"];
    const chargingData = chargingDatas.find(
      (chargingData) =>
        chargingData.snssai === flowKey &&
        chargingData.dnn === dnn &&
        chargingData.filter === filter,
    );

    if (chargingData === undefined) {
      return;
    }

    chargingData.quota = event.target.value;
    setValue(`ChargingDatas.${chargingDatas.indexOf(chargingData)}`, chargingData);
  };

  const handleChangeChargingUnitCost = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    dnn: string | undefined,
    flowKey: string,
    filter: string | undefined,
  ): void => {
    const chargingDatas = getValues()["ChargingDatas"];
    const chargingData = chargingDatas.find(
      (chargingData) =>
        chargingData.snssai === flowKey &&
        chargingData.dnn === dnn &&
        chargingData.filter === filter,
    );

    if (chargingData === undefined) {
      return;
    }

    chargingData.unitCost = event.target.value;
    setValue(`ChargingDatas.${chargingDatas.indexOf(chargingData)}`, chargingData);
  };

  const handleChangeUpIntegrity = (
    event: SelectChangeEvent<string>,
    sessionIndex: number,
    dnnKey?: string,
  ): void => {
    setValue(
      `SessionManagementSubscriptionData.${sessionIndex}.dnnConfigurations.${dnnKey}.upSecurity.upIntegr`,
      event.target.value,
    );
  };

  const handleChangeUpConfidentiality = (
    event: SelectChangeEvent<string>,
    sessionIndex: number,
    dnnKey?: string,
  ): void => {
    setValue(
      `SessionManagementSubscriptionData.${sessionIndex}.dnnConfigurations.${dnnKey}.upSecurity.upConfid`,
      event.target.value,
    );
  };

  const qosFlow = (
    sstSd: string,
    dnn: string,
    qosRef: number | undefined,
  ): QosFlows | undefined => {
    const qosFlows = watch("QosFlows");
    if (qosFlows === undefined) {
      return;
    }

    for (let i = 0; i < qosFlows.length; i++) {
      const qos = qosFlows[i];
      if (qos.snssai === sstSd && qos.dnn === dnn && qos.qosRef == qosRef) {
        return qos;
      }
    }
  };

  const chargingConfig = (dnn: string | undefined, snssai: Nssai, filter: string | undefined) => {
    const chargingDatas = watch("ChargingDatas");
    if (chargingDatas === undefined) {
      return;
    }

    const flowKey = toHex(snssai.sst) + snssai.sd;
    for (let i = 0; i < chargingDatas.length; i++) {
      const chargingData = chargingDatas[i];
      const idPrefix = snssai + "-" + dnn + "-" + chargingData.qosRef + "-";
      const isOnlineCharging = chargingData.chargingMethod === "Online";
      if (
        chargingData.snssai === flowKey &&
        chargingData.dnn === dnn &&
        chargingData.filter === filter
      ) {
        return (
          <>
            <Table>
              <TableBody id={idPrefix + "Charging Config"}>
                <TableCell style={{ width: "33%" }}>
                  <FormControl variant="outlined" fullWidth>
                    <InputLabel>Charging Method</InputLabel>
                    <Select
                      label="Charging Method"
                      variant="outlined"
                      required
                      fullWidth
                      value={chargingData.chargingMethod}
                      onChange={(ev) => handleChangeChargingMethod(ev, dnn, flowKey, filter)}
                    >
                      <MenuItem value="Offline">Offline</MenuItem>
                      <MenuItem value="Online">Online</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell style={{ width: "33%" }}>
                  <TextField
                    label="Quota (monetary)"
                    variant="outlined"
                    required={isOnlineCharging}
                    disabled={!isOnlineCharging}
                    fullWidth
                    value={chargingData.quota}
                    onChange={(ev) => handleChangeChargingQuota(ev, dnn, flowKey, filter)}
                  />
                </TableCell>
                <TableCell style={{ width: "33%" }}>
                  <TextField
                    label="Unit Cost (money per byte)"
                    variant="outlined"
                    required
                    fullWidth
                    value={chargingData.unitCost}
                    onChange={(ev) => handleChangeChargingUnitCost(ev, dnn, flowKey, filter)}
                  />
                </TableCell>
              </TableBody>
            </Table>
          </>
        );
      }
    }
  };

  const flowRule = (dnn: string, snssai: Nssai) => {
    const flowKey = toHex(snssai.sst) + snssai.sd;
    const idPrefix = flowKey + "-" + dnn + "-";

    const flowRules = watch(`FlowRules`).filter(
      (flow) => flow.dnn === dnn && flow.snssai === flowKey,
    );

    return flowRules.map((flow) => (
      <div key={flow.snssai}>
        <Box sx={{ m: 2 }} id={idPrefix + flow.qosRef}>
          <Grid container spacing={2}>
            <Grid item xs={10}>
              <h4>Flow Rules {flow.qosRef}</h4>
            </Grid>
            <Grid item xs={2}>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  color="secondary"
                  variant="contained"
                  onClick={() => onFlowRulesDelete(dnn, flowKey, flow.qosRef)}
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
                  <TableCell style={{ width: "25%" }}>
                    <TextField
                      label="IP Filter"
                      variant="outlined"
                      required
                      fullWidth
                      value={flow.filter}
                      onChange={(ev) => handleChangeFilter(ev, dnn, flowKey, flow.qosRef!)}
                    />
                  </TableCell>
                  <TableCell style={{ width: "25%" }}>
                    <TextField
                      label="Precedence"
                      variant="outlined"
                      required
                      fullWidth
                      type="number"
                      value={flow.precedence}
                      onChange={(ev) => handleChangePrecedence(ev, dnn, flowKey, flow.qosRef!)}
                    />
                  </TableCell>
                  <TableCell style={{ width: "25%" }}>
                    <TextField
                      label="5QI"
                      variant="outlined"
                      required
                      fullWidth
                      type="number"
                      value={qosFlow(flowKey, dnn, flow.qosRef)?.["5qi"]}
                      onChange={(ev) => handleChange5QI(ev, dnn, flowKey, flow.qosRef!)}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
              <TableBody>
                <TableRow>
                  <TableCell style={{ width: "25%" }}>
                    <TextField
                      label="Uplink GBR"
                      variant="outlined"
                      required
                      fullWidth
                      value={qosFlow(flowKey, dnn, flow.qosRef)?.gbrUL}
                      onChange={(ev) => handleChangeUplinkGBR(ev, dnn, flowKey, flow.qosRef!)}
                    />
                  </TableCell>
                  <TableCell style={{ width: "25%" }}>
                    <TextField
                      label="Downlink GBR"
                      variant="outlined"
                      required
                      fullWidth
                      value={qosFlow(flowKey, dnn, flow.qosRef)?.gbrDL}
                      onChange={(ev) => handleChangeDownlinkGBR(ev, dnn, flowKey, flow.qosRef!)}
                    />
                  </TableCell>
                  <TableCell style={{ width: "25%" }}>
                    <TextField
                      label="Uplink MBR"
                      variant="outlined"
                      required
                      fullWidth
                      value={qosFlow(flowKey, dnn, flow.qosRef)?.mbrUL}
                      onChange={(ev) => handleChangeUplinkMBR(ev, dnn, flowKey, flow.qosRef!)}
                    />
                  </TableCell>
                  <TableCell style={{ width: "25%" }}>
                    <TextField
                      label="Downlink MBR"
                      variant="outlined"
                      required
                      fullWidth
                      value={qosFlow(flowKey, dnn, flow.qosRef)?.mbrDL}
                      onChange={(ev) => handleChangeDownlinkMBR(ev, dnn, flowKey, flow.qosRef!)}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            {chargingConfig(dnn, snssai, flow.filter!)}
          </Card>
        </Box>
      </div>
    ));
  };

  const upSecurity = (sessionIndex: number, dnnKey?: string) => {
    const dnn = watch(
      `SessionManagementSubscriptionData.${sessionIndex}.dnnConfigurations.${dnnKey}`,
    );

    if (!(dnn !== undefined && dnn!.upSecurity !== undefined)) {
      return (
        <div>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Button
                    color="secondary"
                    variant="contained"
                    onClick={() => onUpSecurity(sessionIndex, dnnKey)}
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

    let security = dnn.upSecurity;

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
                  onClick={() => onUpSecurityDelete(sessionIndex, dnnKey)}
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
                        onChange={(ev) => handleChangeUpIntegrity(ev, sessionIndex, dnnKey)}
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
                        onChange={(ev) => handleChangeUpConfidentiality(ev, sessionIndex, dnnKey)}
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
  };

  return (
    <Dashboard title="Subscription" refreshAction={() => {}}>
      <form onSubmit={handleSubmit(onCreate)}>
        <Card variant="outlined">
          <Table>
            <TableBody id="Subscriber Data Number">
              <TableRow>
                <TableCell>
                  <TextField
                    {...register("userNumber", { required: true, valueAsNumber: true })}
                    type="number"
                    error={validationErrors.userNumber !== undefined}
                    helperText={validationErrors.userNumber?.message}
                    label="Subscriber data number (auto-incresed with SUPI)"
                    variant="outlined"
                    required
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    {...register("ueId", { required: true })}
                    error={validationErrors.ueId !== undefined}
                    helperText={validationErrors.ueId?.message}
                    label="SUPI (IMSI)"
                    variant="outlined"
                    required
                    fullWidth
                  />
                </TableCell>
              </TableRow>
            </TableBody>
            <TableBody id="PLMN ID">
              <TableRow>
                <TableCell>
                  <TextField
                    {...register("plmnID", { required: true })}
                    error={validationErrors.plmnID !== undefined}
                    helperText={validationErrors.plmnID?.message}
                    label="PLMN ID"
                    variant="outlined"
                    required
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    label="GPSI (MSISDN)"
                    variant="outlined"
                    required
                    fullWidth
                    value={msisdnValue(watch("AccessAndMobilitySubscriptionData"))}
                    onChange={handleChangeMsisdn}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
            <TableBody id="Authentication Management">
              <TableRow>
                <TableCell>
                  <TextField
                    {...register("AuthenticationSubscription.authenticationManagementField", {
                      required: true,
                    })}
                    error={
                      validationErrors.AuthenticationSubscription?.authenticationManagementField !==
                      undefined
                    }
                    helperText={
                      validationErrors.AuthenticationSubscription?.authenticationManagementField
                        ?.message
                    }
                    label="Authentication Management Field (AMF)"
                    variant="outlined"
                    fullWidth
                  />
                </TableCell>
                <TableCell align="left">
                  <FormControl variant="outlined" fullWidth>
                    <InputLabel>Authentication Method</InputLabel>
                    <Select
                      {...register("AuthenticationSubscription.authenticationMethod", {
                        required: true,
                      })}
                      error={
                        validationErrors.AuthenticationSubscription?.authenticationMethod !==
                        undefined
                      }
                      label="Authentication Method"
                      variant="outlined"
                      fullWidth
                      defaultValue="5G_AKA"
                    >
                      <MenuItem value="5G_AKA">5G_AKA</MenuItem>
                      <MenuItem value="EAP_AKA_PRIME">EAP_AKA_PRIME</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
              </TableRow>
            </TableBody>
            <TableBody id="OP">
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
            <TableBody id="SQN">
              <TableRow>
                <TableCell>
                  <TextField
                    {...register("AuthenticationSubscription.sequenceNumber", { required: true })}
                    error={
                      validationErrors.AuthenticationSubscription?.sequenceNumber !== undefined
                    }
                    helperText={
                      validationErrors.AuthenticationSubscription?.sequenceNumber?.message
                    }
                    label="SQN"
                    variant="outlined"
                    required
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    {...register("AuthenticationSubscription.permanentKey.permanentKeyValue", {
                      required: true,
                    })}
                    error={
                      validationErrors.AuthenticationSubscription?.permanentKey
                        ?.permanentKeyValue !== undefined
                    }
                    helperText={
                      validationErrors.AuthenticationSubscription?.permanentKey?.permanentKeyValue
                        ?.message
                    }
                    label="Permanent Authentication Key"
                    variant="outlined"
                    required
                    fullWidth
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
        <h3>Subscribed UE AMBR</h3>
        <Card variant="outlined">
          <Table>
            <TableBody id="Subscribed UE AMBR">
              <TableRow>
                <TableCell>
                  <TextField
                    {...register("AccessAndMobilitySubscriptionData.subscribedUeAmbr.uplink", {
                      required: true,
                    })}
                    error={
                      validationErrors.AccessAndMobilitySubscriptionData?.subscribedUeAmbr
                        ?.uplink !== undefined
                    }
                    helperText={
                      validationErrors.AccessAndMobilitySubscriptionData?.subscribedUeAmbr?.uplink
                        ?.message
                    }
                    label="Uplink"
                    variant="outlined"
                    required
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    {...register("AccessAndMobilitySubscriptionData.subscribedUeAmbr.downlink", {
                      required: true,
                    })}
                    error={
                      validationErrors.AccessAndMobilitySubscriptionData?.subscribedUeAmbr
                        ?.downlink !== undefined
                    }
                    helperText={
                      validationErrors.AccessAndMobilitySubscriptionData?.subscribedUeAmbr?.downlink
                        ?.message
                    }
                    label="Downlink"
                    variant="outlined"
                    required
                    fullWidth
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
        {sessionManagementSubscriptionData?.map((row, index) => (
          <div key={row.id} id={toHex(row.singleNssai!.sst) + row.singleNssai!.sd!}>
            <Grid container spacing={2}>
              <Grid item xs={10}>
                <h3>
                  S-NSSAI Configuragtion ({toHex(row.singleNssai!.sst) + row.singleNssai!.sd!})
                </h3>
              </Grid>
              <Grid item xs={2}>
                <Box display="flex" justifyContent="flex-end">
                  <Button
                    color="secondary"
                    variant="contained"
                    onClick={() => removeSessionSubscription(index)}
                    sx={{ m: 2, backgroundColor: "red", "&:hover": { backgroundColor: "red" } }}
                  >
                    DELETE
                  </Button>
                </Box>
              </Grid>
            </Grid>
            <Card variant="outlined">
              <Table>
                <TableBody
                  id={"S-NSSAI Configuragtion" + toHex(row.singleNssai!.sst) + row.singleNssai!.sd!}
                >
                  <TableRow>
                    <TableCell style={{ width: "50%" }}>
                      <TextField
                        {...register(`SessionManagementSubscriptionData.${index}.singleNssai.sst`, {
                          required: true,
                        })}
                        error={
                          validationErrors.SessionManagementSubscriptionData?.[index]?.singleNssai
                            ?.sst !== undefined
                        }
                        label="SST"
                        variant="outlined"
                        required
                        fullWidth
                        type="number"
                      />
                    </TableCell>
                    <TableCell style={{ width: "50%" }}>
                      <TextField
                        {...register(`SessionManagementSubscriptionData.${index}.singleNssai.sd`, {
                          required: true,
                        })}
                        error={
                          validationErrors.SessionManagementSubscriptionData?.[index]?.singleNssai
                            ?.sd !== undefined
                        }
                        label="SD"
                        variant="outlined"
                        required
                        fullWidth
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
                <TableBody
                  id={toHex(row.singleNssai!.sst) + row.singleNssai!.sd! + "-Default S-NSSAI"}
                >
                  <TableRow>
                    <TableCell>Default S-NSSAI</TableCell>
                    <TableCell align="right">
                      <Checkbox
                        checked={defaultSingleNssais.some(
                          (n) => n.sd === row.singleNssai!.sd && n.sst === row.singleNssai!.sst,
                        )}
                        onChange={(ev) => {
                          const nssai = {
                            sst: row.singleNssai!.sst,
                            sd: row.singleNssai!.sd,
                          };
                          const checked = ev.target.checked;

                          if (!checked) {
                            removeDefaultSingleNssai(nssai);
                          } else {
                            addDefaultSingleNssai(nssai);
                          }
                        }}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              {chargingConfig("", row.singleNssai!, "")}
              {row.dnnConfigurations &&
                Object.keys(row.dnnConfigurations!).map((dnn) => (
                  <div
                    key={dnn}
                    id={toHex(row.singleNssai!.sst!) + row.singleNssai!.sd! + "-" + dnn!}
                  >
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
                              onClick={() =>
                                onDnnDelete(
                                  index,
                                  dnn,
                                  toHex(row.singleNssai!.sst!) + row.singleNssai!.sd!,
                                )
                              }
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
                      <Card
                        variant="outlined"
                        id={
                          toHex(row.singleNssai!.sst!) +
                          row.singleNssai!.sd! +
                          "-" +
                          dnn! +
                          "-AddFlowRuleArea"
                        }
                      >
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell>
                                <b>{dnn}</b>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                          <TableBody
                            id={
                              toHex(row.singleNssai!.sst!) +
                              row.singleNssai!.sd! +
                              "-" +
                              dnn! +
                              "-AMBR&5QI"
                            }
                          >
                            <TableRow>
                              <TableCell>
                                <TextField
                                  {...register(
                                    `SessionManagementSubscriptionData.${index}.dnnConfigurations.${dnn}.sessionAmbr.uplink`,
                                    { required: true },
                                  )}
                                  label="Uplink AMBR"
                                  variant="outlined"
                                  required
                                  fullWidth
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  {...register(
                                    `SessionManagementSubscriptionData.${index}.dnnConfigurations.${dnn}.sessionAmbr.downlink`,
                                    { required: true },
                                  )}
                                  label="Downlink AMBR"
                                  variant="outlined"
                                  required
                                  fullWidth
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  {...register(
                                    `SessionManagementSubscriptionData.${index}.dnnConfigurations.${dnn}.5gQosProfile.5qi`,
                                    { required: true, valueAsNumber: true },
                                  )}
                                  label="Default 5QI"
                                  variant="outlined"
                                  required
                                  fullWidth
                                  type="number"
                                />
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>

                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell style={{ width: "20%" }}>
                                <FormControlLabel
                                  style={{ justifyItems: "end" }}
                                  control=<Switch
                                    checked={
                                      watch(
                                        `SessionManagementSubscriptionData.${index}.dnnConfigurations.${dnn}`,
                                      ).staticIpAddress?.length != 0
                                    }
                                    onChange={(ev) => handleToggleStaticIp(ev, index, dnn)}
                                  />
                                  label="Static IPv4 Address"
                                />
                              </TableCell>
                              <TableCell style={{ width: "68%" }}>
                                <TextField
                                  label="IPv4 Address"
                                  variant="outlined"
                                  fullWidth
                                  disabled={
                                    watch(
                                      `SessionManagementSubscriptionData.${index}.dnnConfigurations.${dnn}`,
                                    ).staticIpAddress?.length == 0
                                  }
                                  value={
                                    watch(
                                      `SessionManagementSubscriptionData.${index}.dnnConfigurations.${dnn}`,
                                    ).staticIpAddress?.[0]?.ipv4Addr ?? ""
                                  }
                                  onChange={(ev) => handleChangeStaticIp(ev, index, dnn)}
                                />
                              </TableCell>
                              <TableCell style={{ width: "12%" }}>
                                <Button
                                  color="secondary"
                                  variant="contained"
                                  // handleVerifyStaticIp = (sd: string, sst: number, dnn: string, ipaddr: string)
                                  onClick={() =>
                                    handleVerifyStaticIp(
                                      row.singleNssai!.sd!,
                                      row.singleNssai!.sst!,
                                      dnn,
                                      row.dnnConfigurations![dnn]["staticIpAddress"]![0].ipv4Addr!,
                                    )
                                  }
                                  sx={{
                                    m: 2,
                                    backgroundColor: "blue",
                                    "&:hover": { backgroundColor: "#7496c2" },
                                  }}
                                  disabled={
                                    row.dnnConfigurations![dnn]["staticIpAddress"] == null ||
                                    row.dnnConfigurations![dnn]["staticIpAddress"]?.length == 0
                                  }
                                >
                                  Verify
                                </Button>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>

                        {chargingConfig(dnn, row.singleNssai!, undefined)}

                        {flowRule(dnn, row.singleNssai!)}

                        <div>
                          <Table>
                            <TableBody>
                              <TableRow>
                                <TableCell>
                                  <Button
                                    color="secondary"
                                    variant="outlined"
                                    onClick={() => onFlowRulesAdd(dnn, row.singleNssai!)}
                                    sx={{ m: 0 }}
                                  >
                                    +FLOW RULE
                                  </Button>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                        {upSecurity(index, dnn)}
                      </Card>
                    </Box>
                  </div>
                ))}
              <Grid container spacing={2}>
                <Grid
                  item
                  xs={10}
                  id={toHex(row.singleNssai!.sst) + row.singleNssai!.sd! + "-AddDNNInputArea"}
                >
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
                <Grid
                  item
                  xs={2}
                  id={toHex(row.singleNssai!.sst) + row.singleNssai!.sd! + "-AddDNNButtonArea"}
                >
                  <Box display="flex" justifyContent="flex-end">
                    <Button
                      color="secondary"
                      variant="contained"
                      onClick={() => onDnnAdd(index)}
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
          <Button
            color="secondary"
            variant="contained"
            onClick={() =>
              appendSessionSubscription({
                singleNssai: {
                  sst: 1,
                },
                dnnConfigurations: {},
              })
            }
            sx={{ m: 1 }}
          >
            +SNSSAI
          </Button>
        </Grid>
        <br />
        <Grid item xs={12}>
          {isNewSubscriber ? (
            <Button color="primary" variant="contained" type="submit" sx={{ m: 1 }}>
              CREATE
            </Button>
          ) : (
            <Button color="primary" variant="contained" type="submit" sx={{ m: 1 }}>
              UPDATE
            </Button>
          )}
        </Grid>
      </form>
    </Dashboard>
  );
}
