import { Card, Table, TableBody, TableCell, TableRow, TextField } from "@mui/material";
import { useSubscriptionForm } from "../../hooks/subscription-form";

export default function SubscriberFormUeAmbr() {
  const { register, validationErrors } = useSubscriptionForm();

  return (
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
                  validationErrors.AccessAndMobilitySubscriptionData?.subscribedUeAmbr?.uplink !==
                  undefined
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
                  validationErrors.AccessAndMobilitySubscriptionData?.subscribedUeAmbr?.downlink !==
                  undefined
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
  );
}
