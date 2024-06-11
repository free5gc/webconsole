import {
  Button,
  Box,
  Card,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
} from "@mui/material";
import type { Nssai, QosFlows } from "../../api";
import { useSubscriptionForm } from "../../hooks/subscription-form";
import { toHex } from "../../lib/utils";
import FormChargingConfig from "./FormCharingConfig";

interface FormFlowRuleProps {
  dnn: string;
  snssai: Nssai;
}

export default function FormFlowRule({ dnn, snssai }: FormFlowRuleProps) {
  const { watch, getValues, setValue } = useSubscriptionForm();

  const flowKey = toHex(snssai.sst) + snssai.sd;
  const idPrefix = flowKey + "-" + dnn + "-";

  const flowRules = watch(`FlowRules`).filter(
    (flow) => flow.dnn === dnn && flow.snssai === flowKey,
  );

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
          <FormChargingConfig dnn={dnn} snssai={snssai} filter={flow.filter!} />
        </Card>
      </Box>
    </div>
  ));
}
