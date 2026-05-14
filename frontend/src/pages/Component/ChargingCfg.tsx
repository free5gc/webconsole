import React from "react";
import {
    Box,
    Card,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography,
} from "@mui/material";
import { ChargingData } from "../../api/api";

const ChargingCfg = ({
    chargingData,
}: {
    chargingData: ChargingData;
}) => {
    const isOnlineCharging = chargingData.chargingMethod === "Online";

    return (
        <Box sx={{ mt: 1.5 }}>
            <Card
                variant="outlined"
                sx={{
                    borderColor: "#ccd9ea",
                    backgroundColor: "rgba(20, 110, 245, 0.02)",
                    boxShadow: "0 6px 14px rgba(8, 8, 8, 0.08), 0 2px 4px rgba(8, 8, 8, 0.05)",
                }}
            >
                <Box sx={{ px: 2, py: 1.2, borderBottom: "1px solid #d8d8d8" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#1b2b44" }}>
                        Charging Config
                    </Typography>
                </Box>
                <Table size="small">
                    <TableBody>
                        <TableRow>
                            <TableCell style={{ width: "40%" }}>Charging Method</TableCell>
                            <TableCell>{chargingData.chargingMethod}</TableCell>
                        </TableRow>
                    </TableBody>
                    {isOnlineCharging && (
                        <TableBody>
                            <TableRow>
                                <TableCell style={{ width: "40%" }}>Quota</TableCell>
                                <TableCell>{chargingData.quota}</TableCell>
                            </TableRow>
                        </TableBody>
                    )}
                    <TableBody>
                        <TableRow>
                            <TableCell style={{ width: "40%" }}>Unit Cost</TableCell>
                            <TableCell>{chargingData.unitCost}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Card>
        </Box>
    );
};

export default ChargingCfg; 