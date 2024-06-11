import type { SelectChangeEvent } from "@mui/material";
import type { AccessAndMobilitySubscriptionData } from "../../api";
import { useSubscriptionForm } from "../../hooks/subscription-form";
import {
  Card,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
} from "@mui/material";

export default function SubscriberFormBasic() {
  const {
    register,
    watch,
    validationErrors,
    getValues,
    setValue,
    opcType,
    setOpcType,
    opcValue,
    setOpcValue,
  } = useSubscriptionForm();

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

  return (
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
                    validationErrors.AuthenticationSubscription?.authenticationMethod !== undefined
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
                error={validationErrors.AuthenticationSubscription?.sequenceNumber !== undefined}
                helperText={validationErrors.AuthenticationSubscription?.sequenceNumber?.message}
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
                  validationErrors.AuthenticationSubscription?.permanentKey?.permanentKeyValue !==
                  undefined
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
  );
}
