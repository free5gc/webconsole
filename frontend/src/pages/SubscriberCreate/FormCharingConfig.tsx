import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TextField,
} from "@mui/material";
import type { Nssai } from "../../api";
import { useSubscriptionForm } from "../../hooks/subscription-form";
import { toHex } from "../../lib/utils";

interface FormCharginConfigProps {
  dnn: string | undefined;
  snssai: Nssai;
  filter: string | undefined;
}

export default function FormChargingConfig({ dnn, snssai, filter }: FormCharginConfigProps) {
  const { watch, getValues, setValue } = useSubscriptionForm();

  const chargingDatas = watch("ChargingDatas");
  if (chargingDatas === undefined) {
    return;
  }

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
}
