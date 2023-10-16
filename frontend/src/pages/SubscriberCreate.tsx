import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import axios from "../axios";
import {
  Subscription,
  Nssai,
  DnnConfiguration,
  AccessAndMobilitySubscriptionData,
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

let isNewSubscriber = false

export default function SubscriberCreate() {
  const { id, plmn } = useParams<{
    id: string;
    plmn: string;
  }>();

  isNewSubscriber = (id === undefined && plmn === undefined ? true : false)
  const navigation = useNavigate();

  const [data, setData] = useState<Subscription>({
    userNumber: 1,
    plmnID: "20893",
    ueId: "imsi-208930000000001",
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
        defaultSingleNssais: [
          {
            "sst": 1,
            "sd": "010203"
          }
        ],
        singleNssais: [],
      },
    },
    SessionManagementSubscriptionData: [
      {
        "singleNssai": {
          "sst": 1,
          "sd": "010203"
        },
        "dnnConfigurations": {
          "internet": {
            "pduSessionTypes": {
              "defaultSessionType": "IPV4",
              "allowedSessionTypes": [
                "IPV4"
              ]
            },
            "sscModes": {
              "defaultSscMode": "SSC_MODE_1",
              "allowedSscModes": [
                "SSC_MODE_2",
                "SSC_MODE_3"
              ]
            },
            "5gQosProfile": {
              "5qi": 9,
              "arp": {
                "priorityLevel": 8,
                "preemptCap": "",
                "preemptVuln": ""
              },
              "priorityLevel": 8
            },
            "sessionAmbr": {
              "uplink": "1000 Mbps",
              "downlink": "1000 Mbps"
            }
          }
        }
      },
      {
        "singleNssai": {
          "sst": 1,
          "sd": "112233"
        },
        "dnnConfigurations": {
          "internet": {
            "pduSessionTypes": {
              "defaultSessionType": "IPV4",
              "allowedSessionTypes": [
                "IPV4"
              ]
            },
            "sscModes": {
              "defaultSscMode": "SSC_MODE_1",
              "allowedSscModes": [
                "SSC_MODE_2",
                "SSC_MODE_3"
              ]
            },
            "5gQosProfile": {
              "5qi": 8,
              "arp": {
                "priorityLevel": 8,
                "preemptCap": "",
                "preemptVuln": ""
              },
              "priorityLevel": 8
            },
            "sessionAmbr": {
              "uplink": "1000 Mbps",
              "downlink": "1000 Mbps"
            }
          }
        }
      }
    ],
    SmfSelectionSubscriptionData: {
      "subscribedSnssaiInfos": {
        "01010203": {
          "dnnInfos": [
            {
              "dnn": "internet"
            }
          ]
        },
        "01112233": {
          "dnnInfos": [
            {
              "dnn": "internet"
            }
          ]
        }
      }
    },
    AmPolicyData: {
      subscCats: [
        "free5gc"
      ],
    },
    SmPolicyData: {
      "smPolicySnssaiData": {
        "01010203": {
          "snssai": {
            "sst": 1,
            "sd": "010203"
          },
          "smPolicyDnnData": {
            "internet": {
              "dnn": "internet"
            }
          }
        },
        "01112233": {
          "snssai": {
            "sst": 1,
            "sd": "112233"
          },
          "smPolicyDnnData": {
            "internet": {
              "dnn": "internet"
            }
          }
        }
      }
    },
    "FlowRules": [
      {
        "filter": "0.0.0.0/32",
        "precedence": 128,
        "snssai": "01010203",
        "dnn": "internet",
        "qosRef": 1
      },
      {
        "filter": "0.0.0.0/32",
        "precedence": 127,
        "snssai": "01112233",
        "dnn": "internet",
        "qosRef": 2
      }
    ],
    "QosFlows": [
      {
        "snssai": "01010203",
        "dnn": "internet",
        "qosRef": 1,
        "5qi": 8,
        "mbrUL": "208 Mbps",
        "mbrDL": "208 Mbps",
        "gbrUL": "108 Mbps",
        "gbrDL": "108 Mbps"
      },
      {
        "snssai": "01112233",
        "dnn": "internet",
        "qosRef": 2,
        "5qi": 7,
        "mbrUL": "407 Mbps",
        "mbrDL": "407 Mbps",
        "gbrUL": "207 Mbps",
        "gbrDL": "207 Mbps"
      }
    ],
    "ChargingDatas": [
      {
        "snssai": "01010203",
        "dnn": "internet",
        "qosRef": 1,
        "filter": "0.0.0.0/32",
        "chargingMethod": "Offline",
        "quota": "0",
        "unitCost": "1",
      },
      {
        "snssai": "01112233",
        "dnn": "internet",
        "qosRef": 2,
        "filter": "0.0.0.0/32",
        "chargingMethod": "Online",
        "quota": "2000",
        "unitCost": "2",
      },
    ]
  });
  const [opcType, setOpcType] = useState<string>("OPc");
  const [opcValue, setOpcValue] = useState<string>("8e27b6af0e692e750f32667a3b14605d");
  const [dnnName, setDnnName] = useState<string[]>([]);

  if (!isNewSubscriber) {
    useEffect(() => {
      axios.get("/api/subscriber/" + id + "/" + plmn).then((res) => {
        setData(res.data);
      });
    }, [id]);
  }
  function toHex(v: number | undefined): string {
    return ("00" + v?.toString(16).toUpperCase()).substr(-2);
  };

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
  }

  const onCreate = () => {

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
        .then((res) => {
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
      .then((res) => {
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

  const onFlowRulesDelete = (dnn: string, flowKey: string, qosRef: number | undefined) => {
    if (data.FlowRules !== undefined) {
      for (let i = 0; i < data.FlowRules!.length; i++) {
        if (data.FlowRules![i].dnn === dnn && data.FlowRules![i].snssai === flowKey && data.FlowRules![i].qosRef === qosRef) {
          data.FlowRules!.splice(i, 1);
          i--;
        }
      }
    }
    if (data.QosFlows !== undefined) {
      for (let i = 0; i < data.QosFlows!.length; i++) {
        if (data.QosFlows![i].dnn === dnn && data.QosFlows![i].snssai === flowKey && data.QosFlows![i].qosRef === qosRef) {
          data.QosFlows!.splice(i, 1);
          i--;
        }
      }
    }
    setData({ ...data });
  };

  const onUpSecurity = (dnn: DnnConfiguration | undefined) => {
    if (dnn !== undefined) {
      dnn.upSecurity = {};
    }
    setData({ ...data });
  };

  function selectQosRef (): number {
    const UsedQosRef = []
    for (let i = 0; i < data.QosFlows!.length; i++) {
      UsedQosRef.push(data.QosFlows![i]!.qosRef)
    }
    for (let i = 1; i < 256; i++){
      if (!UsedQosRef.includes(i)) {
        return i
      }
    }
    
    window.alert("Cannot select qosRef in 1~128.")
    return -1
  };

  function select5Qi (dnn: string, snssai: Nssai): number {
    const sstsd = toHex(snssai.sst) + snssai.sd!
    const filteredQosFlows = data.QosFlows!.filter((qos) => qos.dnn === dnn && qos.snssai === sstsd)
    const Used5Qi = []
    for (let i = 0; i < filteredQosFlows.length; i++) {
      Used5Qi.push(filteredQosFlows[i]["5qi"])
    }
    Used5Qi.sort((a,b) =>  a! - b!)
    if (Used5Qi[Used5Qi.length - 1]! < 255) {
      return Used5Qi[Used5Qi.length - 1]! + 1
    }
    return 255
  };

  const onFlowRulesAdd = (dnn: string, snssai: Nssai) => {
    if (dnn !== undefined) {
      const sstSd = toHex(snssai.sst) + snssai.sd!
      const filter = "permit out ip from any to 10.60.0.0/16"
      const selected5Qi = select5Qi(dnn, snssai)
      const selectedQosRef = selectQosRef()
      data.FlowRules!.push({
        "filter": filter,
        "precedence": 127,
        "snssai": sstSd,
        "dnn": dnn,
        "qosRef": selectedQosRef
      })
      data.QosFlows!.push({
        "snssai": sstSd,
        "dnn": dnn,
        "qosRef": selectedQosRef,
        "5qi": selected5Qi, 
        "mbrUL": "200 Mbps",
        "mbrDL": "200 Mbps",
        "gbrUL": "100 Mbps",
        "gbrDL": "100 Mbps"
    })
    data.ChargingDatas!.push({
        "snssai": sstSd,
        "dnn": dnn,
        "qosRef": selectedQosRef,
        "filter": filter,
        "chargingMethod": "Offline",
        "quota": "0",
        "unitCost": "1",
    })
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
    qosRef: number
  ): void => {
    if (data.FlowRules !== undefined) {
      for (let i = 0; i < data.FlowRules!.length; i++) {
        if (data.FlowRules![i].snssai === flowKey && data.FlowRules![i].dnn === dnn && data.QosFlows![i].qosRef === qosRef) {
          data.FlowRules![i].filter = event.target.value;
          setData({ ...data });
        }
      }
    }
    if (data.ChargingDatas !== undefined) {
      for (let i = 0; i < data.ChargingDatas!.length; i++) {
        if (data.ChargingDatas![i].snssai === flowKey && data.ChargingDatas![i].dnn === dnn && data.ChargingDatas![i].qosRef === qosRef) {
          data.ChargingDatas![i].filter = event.target.value;
          setData({ ...data });
        }
      }
    }
  };

  const handleChangePrecedence = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    dnn: string,
    flowKey: string,
    qosRef: number
  ): void => {
    if (data.FlowRules !== undefined) {
      for (let i = 0; i < data.FlowRules!.length; i++) {
        if (data.FlowRules![i].snssai === flowKey && data.FlowRules![i].dnn === dnn  && data.QosFlows![i].qosRef === qosRef) {
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
    qosRef: number
  ): void => {
    if (data.QosFlows !== undefined) {
      for (let i = 0; i < data.QosFlows!.length; i++) {
        if (data.QosFlows![i].snssai === flowKey && data.QosFlows![i].dnn === dnn && data.QosFlows![i].qosRef === qosRef) {
          if (event.target.value == "") {
            data.QosFlows![i]["5qi"] = undefined;
          } else {
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
    qosRef: number
  ): void => {
    if (data.QosFlows !== undefined) {
      for (let i = 0; i < data.QosFlows!.length; i++) {
        if (data.QosFlows![i].snssai === flowKey && data.QosFlows![i].dnn === dnn && data.QosFlows![i].qosRef === qosRef) {
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
    qosRef: number
  ): void => {
    if (data.QosFlows !== undefined) {
      for (let i = 0; i < data.QosFlows!.length; i++) {
        if (data.QosFlows![i].snssai === flowKey && data.QosFlows![i].dnn === dnn  && data.QosFlows![i].qosRef === qosRef) {
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
    qosRef: number
  ): void => {
    if (data.QosFlows !== undefined) {
      for (let i = 0; i < data.QosFlows!.length; i++) {
        if (data.QosFlows![i].snssai === flowKey && data.QosFlows![i].dnn === dnn && data.QosFlows![i].qosRef === qosRef) {
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
    qosRef: number
  ): void => {
    if (data.QosFlows !== undefined) {
      for (let i = 0; i < data.QosFlows!.length; i++) {
        if (data.QosFlows![i].snssai === flowKey && data.QosFlows![i].dnn === dnn && data.QosFlows![i].qosRef === qosRef) {
          data.QosFlows![i].mbrDL = event.target.value;
          setData({ ...data });
        }
      }
    }
  };

  const handleChangeChargingMethod = (
    event: SelectChangeEvent<string>,
    dnn: string,
    flowKey: string,
    qosRef: number
  ): void => {
    for (let i = 0; i < data.ChargingDatas!.length; i++) {
      if (data.ChargingDatas![i].snssai === flowKey && data.ChargingDatas![i].dnn === dnn  && data.QosFlows![i].qosRef === qosRef) {
        data.ChargingDatas![i]!.chargingMethod = event.target.value;
        setData({ ...data });
      }
    }
  };

  const handleChangeChargingQuota = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    dnn: string,
    flowKey: string,
    qosRef: number
  ): void => {
      for (let i = 0; i < data.ChargingDatas!.length; i++) {
        if (data.ChargingDatas![i].snssai === flowKey && data.ChargingDatas![i].dnn === dnn  && data.QosFlows![i].qosRef === qosRef) {
          data.ChargingDatas![i]!.quota = event.target.value;
          setData({ ...data });
        }
      }
  };

  const handleChangeChargingUnitCost = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    dnn: string,
    flowKey: string,
    qosRef: number
  ): void => {
      for (let i = 0; i < data.ChargingDatas!.length; i++) {
        if (data.ChargingDatas![i].snssai === flowKey && data.ChargingDatas![i].dnn === dnn && data.QosFlows![i].qosRef === qosRef) {
          data.ChargingDatas![i]!.unitCost = event.target.value;
          setData({ ...data });
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

  const qosFlow = (sstSd: string, dnn: string, qosRef: number | undefined): QosFlows | undefined => {
    if (data.QosFlows !== undefined) {
      for (let i = 0; i < data.QosFlows?.length; i++) {
        const qos = data.QosFlows![i];
        if (qos.snssai === sstSd && qos.dnn === dnn && qos.qosRef == qosRef) {
          return qos;
        }
      }
    }
  }

  const chargingConfig = (flow: any, dnn: string, snssai: Nssai) => {
    const flowKey = toHex(snssai.sst) + snssai.sd;
    for (let i = 0; i < data.ChargingDatas!.length; i++) {
      const chargingData = data.ChargingDatas![i]
      const idPrefix = snssai + "-" + dnn + "-" + chargingData.qosRef + "-"
      if (chargingData.snssai === flowKey && chargingData.dnn === dnn && chargingData.qosRef === flow.qosRef) {
        return (
          <div>
            <Box sx={{ m: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <h4>Charging Config</h4>
                </Grid>
              </Grid>
                <Card variant="outlined">
                  <Table>
                    <TableBody id={idPrefix + "Charging Config"}>
                      <TableCell style={{ width: "33%"}}>
                        <FormControl variant="outlined" fullWidth>
                          <InputLabel>Charging Method</InputLabel>
                          <Select
                            label="Charging Method"
                            variant="outlined"
                            required
                            fullWidth
                            value={chargingData.chargingMethod}
                            onChange={(ev) => handleChangeChargingMethod(ev, dnn, flowKey, flow.qosRef!)}
                          >
                            <MenuItem value="Offline">Offline</MenuItem>
                            <MenuItem value="Online">Online</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell style={{ width: "33%"}}>
                        {data.ChargingDatas![i].chargingMethod === 'Online' ? 
                          <TextField
                            label="Quota (monetary)"
                            variant="outlined"
                            required
                            fullWidth
                            value={chargingData.quota}
                            onChange={(ev) => handleChangeChargingQuota(ev, dnn, flowKey, flow.qosRef!)}
                          />
                        : 
                          <TextField
                            label="Quota (monetary)"
                            variant="outlined"
                            disabled
                            fullWidth
                            value={"0"}
                            onChange={(ev) => handleChangeChargingQuota(ev, dnn, flowKey, flow.qosRef!)}
                          />
                        }
                      </TableCell>
                      <TableCell style={{ width: "33%"}}>
                        <TextField
                          label="Unit Cost (money per byte)"
                          variant="outlined"
                          required
                          fullWidth
                          value={chargingData.unitCost}
                          onChange={(ev) => handleChangeChargingUnitCost(ev, dnn, flowKey, flow.qosRef!)}
                        />
                      </TableCell>
                    </TableBody>
                  </Table>
                </Card>
            </Box>
          </div>
        )
      }
    }
  };

  const flowRule = (dnn: string, snssai: Nssai) => {
    const flowKey = toHex(snssai.sst) + snssai.sd;
    const idPrefix = flowKey + "-" + dnn + "-" 
    if (data.FlowRules !== undefined) {
      return (
        data.FlowRules
        .filter((flow) => flow.dnn === dnn && flow.snssai === flowKey)
        .map((flow) => (
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
                      <TableCell style={{ width: "25%"}}>
                        <TextField
                          label="IP Filter"
                          variant="outlined"
                          required
                          fullWidth
                          value={flow.filter}
                          onChange={(ev) => handleChangeFilter(ev, dnn, flowKey, flow.qosRef!)}
                        />
                      </TableCell>
                      <TableCell style={{ width: "25%"}}>
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
                      <TableCell style={{ width: "25%"}}>
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
                      <TableCell style={{ width: "25%"}}>
                        <TextField
                          label="Uplink GBR"
                          variant="outlined"
                          required
                          fullWidth
                          value={qosFlow(flowKey, dnn, flow.qosRef)?.gbrUL}
                          onChange={(ev) => handleChangeUplinkGBR(ev, dnn, flowKey, flow.qosRef!)}
                        />
                      </TableCell>
                      <TableCell style={{ width: "25%"}}>
                        <TextField
                          label="Downlink GBR"
                          variant="outlined"
                          required
                          fullWidth
                          value={qosFlow(flowKey, dnn, flow.qosRef)?.gbrDL}
                          onChange={(ev) => handleChangeDownlinkGBR(ev, dnn, flowKey, flow.qosRef!)}
                        />
                      </TableCell>
                      <TableCell style={{ width: "25%"}}>
                        <TextField
                          label="Uplink MBR"
                          variant="outlined"
                          required
                          fullWidth
                          value={qosFlow(flowKey, dnn, flow.qosRef)?.mbrUL}
                          onChange={(ev) => handleChangeUplinkMBR(ev, dnn, flowKey, flow.qosRef!)}
                        />
                      </TableCell>
                      <TableCell style={{ width: "25%"}}>
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
                {chargingConfig(flow, dnn, snssai)}
              </Card>
            </Box>
          </div>
        ))
      )
    }
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
          <TableBody id="Subscriber Data Number">
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
          <TableBody id="PLMN ID">
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
              <TableCell>
                <TextField
                  label="GPSI (MSISDN)"
                  variant="outlined"
                  required
                  fullWidth
                  value={msisdnValue(data.AccessAndMobilitySubscriptionData)}
                  onChange={handleChangeMsisdn}
                />
              </TableCell>
            </TableRow>
          </TableBody>
          <TableBody id="Authentication Management">
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
                  label="SQN"
                  variant="outlined"
                  required
                  fullWidth
                  value={data.AuthenticationSubscription?.sequenceNumber}
                  onChange={handleChangeSQN}
                />
              </TableCell>
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
        </Table>
      </Card>
      <h3>Subscribed UE AMBR</h3>
      <Card variant="outlined">
        <Table>
          <TableBody id="Subscribed UE AMBR">
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
        <div key={index} id={toHex(row.singleNssai!.sst)+row.singleNssai!.sd!}>
          <Grid container spacing={2}>
            <Grid item xs={10}>
              <h3>S-NSSAI Configuragtion ({toHex(row.singleNssai!.sst)+row.singleNssai!.sd!})</h3>
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
              <TableBody id={"S-NSSAI Configuragtion" + toHex(row.singleNssai!.sst)+row.singleNssai!.sd!}>
                <TableRow>
                  <TableCell style={{ width: "50%" }}>
                    <TextField
                      label="SST"
                      variant="outlined"
                      required
                      fullWidth
                      type="number"
                      value={row.singleNssai!.sst!}
                      onChange={(ev) => handleChangeSST(ev, index)}
                    />
                  </TableCell>
                  <TableCell style={{ width: "50%" }}>
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
              <TableBody id={toHex(row.singleNssai!.sst)+row.singleNssai!.sd! + "-Default S-NSSAI"}>
                <TableRow>
                  <TableCell>Default S-NSSAI</TableCell>
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
                <div key={dnn} id={toHex(row.singleNssai!.sst!) + row.singleNssai!.sd! + '-' + dnn!}>
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
                    <Card variant="outlined" id={toHex(row.singleNssai!.sst!) + row.singleNssai!.sd! + '-' + dnn! + "-AddFlowRuleArea"}>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <b>{dnn}</b>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                        <TableBody id={toHex(row.singleNssai!.sst!) + row.singleNssai!.sd! + '-' + dnn! + "-AMBR&5QI"}>
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
                      {upSecurity(row.dnnConfigurations![dnn])}
                    </Card>
                  </Box>
                </div>
              ))}
            <Grid container spacing={2}>
              <Grid item xs={10} id={toHex(row.singleNssai!.sst) + row.singleNssai!.sd! + '-AddDNNInputArea'}>
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
              <Grid item xs={2} id={toHex(row.singleNssai!.sst) + row.singleNssai!.sd! + '-AddDNNButtonArea'}>
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
        {
        isNewSubscriber ? 
        <Button color="primary" variant="contained" onClick={onCreate} sx={{ m: 1 }}>
          CREATE
        </Button>
        :
        <Button color="primary" variant="contained" onClick={onUpdate} sx={{ m: 1 }}>
          UPDATE
        </Button>
        }
      </Grid>
    </Dashboard>
  );
}
