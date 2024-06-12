import {
  Button,
  Box,
  Card,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableRow,
  SelectChangeEvent,
} from "@mui/material";
import { useSubscriptionForm } from "../../hooks/subscription-form";

interface FormUpSecurityProps {
  sessionIndex: number;
  dnnKey?: string;
}

interface NoUpSecurityProps {
  createUpSecurity: () => void;
}
function NoUpSecurity(props: NoUpSecurityProps) {
  return (
    <div>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>
              <Button
                color="secondary"
                variant="contained"
                onClick={props.createUpSecurity}
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

export default function FormUpSecurity({ sessionIndex, dnnKey }: FormUpSecurityProps) {
  const { watch, getValues, setValue } = useSubscriptionForm();

  const dnn = watch(
    `SessionManagementSubscriptionData.${sessionIndex}.dnnConfigurations.${dnnKey}`,
  );

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

  if (!(dnn !== undefined && dnn!.upSecurity !== undefined)) {
    return <NoUpSecurity createUpSecurity={() => onUpSecurity(sessionIndex, dnnKey)} />;
  }

  let security = dnn.upSecurity;

  const onUpSecurityDelete = (sessionIndex: number, dnnKey?: string) => {
    setValue(
      `SessionManagementSubscriptionData.${sessionIndex}.dnnConfigurations.${dnnKey}.upSecurity`,
      undefined,
    );
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
}
