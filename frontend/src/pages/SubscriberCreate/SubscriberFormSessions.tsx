import {
  Button,
  Box,
  Card,
  Checkbox,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useSubscriptionForm } from "../../hooks/subscription-form";
import { toHex } from "../../lib/utils";
import FormChargingConfig from "./FormCharingConfig";
import FormFlowRule from "./FormFlowRule";
import FormUpSecurity from "./FormUpSecurity";
import type { IpAddress, Nssai } from "../../api";
import axios from "../../axios";

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

export default function SubscriberFormSessions() {
  const {
    register,
    validationErrors,
    watch,
    getValues,
    setValue,
    sessionSubscriptionFields,
    defaultSingleNssais,
    addDefaultSingleNssai,
    removeDefaultSingleNssai,
    dnnName,
    setDnnName,
  } = useSubscriptionForm();

  const {
    fields: sessionManagementSubscriptionData,
    append: appendSessionSubscription,
    remove: removeSessionSubscription,
  } = sessionSubscriptionFields;

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

  const select5Qi = (dnn: string, snssai: Nssai) => {
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
  };

  const selectQosRef = () => {
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

  return (
    <>
      {sessionManagementSubscriptionData?.map((row, index) => (
        <div key={row.id} id={toHex(row.singleNssai!.sst) + row.singleNssai!.sd!}>
          <Grid container spacing={2}>
            <Grid item xs={10}>
              <h3>S-NSSAI Configuragtion ({toHex(row.singleNssai!.sst) + row.singleNssai!.sd!})</h3>
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

            <FormChargingConfig dnn="" snssai={row.singleNssai!} filter="" />

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

                      <FormChargingConfig dnn={dnn} snssai={row.singleNssai!} filter={undefined} />

                      <FormFlowRule dnn={dnn} snssai={row.singleNssai!} />

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
                      <FormUpSecurity sessionIndex={index} dnnKey={dnn} />
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
    </>
  );
}
