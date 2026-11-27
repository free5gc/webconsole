import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
} from "@mui/material";
import { useSubscriptionForm } from "../../hooks/subscription-form";
import { Controller } from "react-hook-form";

interface FormCharginConfigProps {
  snssaiIndex: number;
  dnn?: string;
  filterIndex?: number;
}

function FormSliceChargingConfig({ snssaiIndex }: FormCharginConfigProps) {
  const { register, validationErrors, watch, control } = useSubscriptionForm();

  const isOnlineCharging =
    watch(`SnssaiConfigurations.${snssaiIndex}.chargingData.chargingMethod`) === "Online";

  return (
    <Table>
      <TableBody id={snssaiIndex + "-charging-config"}>
        <TableRow>
          <TableCell style={{ width: "33%" }}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel>Charging Method</InputLabel>
              <Controller
                control={control}
                name={`SnssaiConfigurations.${snssaiIndex}.chargingData.chargingMethod`}
                rules={{ required: true }}
                render={(props) => (
                  <Select
                    {...props.field}
                    error={props.fieldState.error !== undefined}
                    label="Charging Method"
                    variant="outlined"
                    required
                    fullWidth
                    defaultValue=""
                  >
                    <MenuItem value="Offline">Offline</MenuItem>
                    <MenuItem value="Online">Online</MenuItem>
                  </Select>
                )}
              />
            </FormControl>
          </TableCell>

          <TableCell style={{ width: "33%" }}>
            <TextField
              {...register(`SnssaiConfigurations.${snssaiIndex}.chargingData.quota`, {
                required: true,
              })}
              error={
                validationErrors.SnssaiConfigurations?.[snssaiIndex]?.chargingData?.quota !==
                undefined
              }
              helperText={
                validationErrors.SnssaiConfigurations?.[snssaiIndex]?.chargingData?.quota?.message
              }
              label="Quota (monetary)"
              variant="outlined"
              required={isOnlineCharging}
              disabled={!isOnlineCharging}
              fullWidth
            />
          </TableCell>

          <TableCell style={{ width: "33%" }}>
            <TextField
              {...register(`SnssaiConfigurations.${snssaiIndex}.chargingData.unitCost`, {
                required: true,
              })}
              error={
                validationErrors.SnssaiConfigurations?.[snssaiIndex]?.chargingData?.unitCost !==
                undefined
              }
              helperText={
                validationErrors.SnssaiConfigurations?.[snssaiIndex]?.chargingData?.unitCost
                  ?.message
              }
              label="Unit Cost (money per byte)"
              variant="outlined"
              required
              fullWidth
            />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

function FormFlowChargingConfig({ snssaiIndex, dnn, filterIndex }: FormCharginConfigProps) {
  const { register, validationErrors, watch, control } = useSubscriptionForm();

  if (dnn === undefined) {
    throw new Error("dnn is undefined");
  }
  if (filterIndex === undefined) {
    throw new Error("filterIndex is undefined");
  }

  const flowPath =
    `SnssaiConfigurations.${snssaiIndex}.dnnConfigurations.${dnn}.flowRules.${filterIndex}` as const;
  const chargingMethod = watch(`${flowPath}.chargingData.chargingMethod`);
  const hasCharging = chargingMethod === "Online" || chargingMethod === "Offline";
  const errors =
    validationErrors.SnssaiConfigurations?.[snssaiIndex]?.dnnConfigurations?.[dnn]?.flowRules?.[
      filterIndex
    ]?.chargingData;
  const labelId = `${snssaiIndex}-${dnn}-${filterIndex}-charging-method-label`;

  return (
    <Table>
      <TableBody id={`${snssaiIndex}-${dnn}-${filterIndex}-charging-config`}>
        <TableRow>
          <TableCell style={{ width: "33%" }}>
            <FormControl variant="outlined" fullWidth error={Boolean(errors?.chargingMethod)}>
              <InputLabel id={labelId}>Charging Method</InputLabel>
              <Controller
                control={control}
                name={`${flowPath}.chargingData.chargingMethod`}
                render={({ field }) => (
                  <Select
                    {...field}
                    value={field.value ?? ""}
                    labelId={labelId}
                    label="Charging Method"
                    required
                  >
                    <MenuItem value="None">Do not charge</MenuItem>
                    <MenuItem value="Offline">Offline</MenuItem>
                    <MenuItem value="Online">Online</MenuItem>
                  </Select>
                )}
              />
              {errors?.chargingMethod && (
                <FormHelperText>{errors.chargingMethod.message}</FormHelperText>
              )}
            </FormControl>
          </TableCell>
          {hasCharging && (
            <>
              <TableCell style={{ width: "33%" }}>
                <TextField
                  {...register(`${flowPath}.chargingData.quota`)}
                  error={Boolean(errors?.quota)}
                  helperText={errors?.quota?.message}
                  label="Quota (monetary)"
                  variant="outlined"
                  required={chargingMethod === "Online"}
                  disabled={chargingMethod !== "Online"}
                  fullWidth
                />
              </TableCell>
              <TableCell style={{ width: "33%" }}>
                <TextField
                  {...register(`${flowPath}.chargingData.unitCost`)}
                  error={Boolean(errors?.unitCost)}
                  helperText={errors?.unitCost?.message}
                  label="Unit Cost (money per byte)"
                  variant="outlined"
                  required
                  fullWidth
                />
              </TableCell>
            </>
          )}
        </TableRow>
      </TableBody>
    </Table>
  );
}

export default function FormChargingConfig(props: FormCharginConfigProps) {
  if (props.dnn === undefined) {
    return <FormSliceChargingConfig {...props} />;
  }

  return <FormFlowChargingConfig {...props} />;
}
