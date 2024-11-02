import React from "react";
import {
    Box,
    Card,
    Table,
    TableBody,
    TableRow,
    TableCell,
} from "@mui/material";
import { QosFlows, Nssai } from "../../api/api";

const FlowRule = ({
    dnn,
    flow,
    data,
    chargingConfig,
    qosFlow,
}: {
    dnn: string;
    flow: any;
    data: any;
    chargingConfig: (dnn: string, snssai: Nssai, filter: string | undefined) => JSX.Element | undefined;
    qosFlow: (sstSd: string, dnn: string, qosRef: number | undefined) => QosFlows | undefined;
}) => {
    const flowKey = toHex(flow.sst) + flow.sd;

    return (
        <div key={flow.snssai}>
            <Box sx={{ m: 2 }}>
                <h4>Flow Rules</h4>
                <Card variant="outlined">
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell style={{ width: "40%" }}>IP Filter</TableCell>
                                <TableCell>{flow.filter}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell style={{ width: "40%" }}>Precedence</TableCell>
                                <TableCell>{flow.precedence}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell style={{ width: "40%" }}>5QI</TableCell>
                                <TableCell>{qosFlow(flowKey, dnn, flow.qosRef)?.["5qi"]}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell style={{ width: "40%" }}>Uplink GBR</TableCell>
                                <TableCell>{qosFlow(flowKey, dnn, flow.qosRef!)?.gbrUL}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell style={{ width: "40%" }}>Downlink GBR</TableCell>
                                <TableCell>{qosFlow(flowKey, dnn, flow.qosRef!)?.gbrDL}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell style={{ width: "40%" }}>Uplink MBR</TableCell>
                                <TableCell>{qosFlow(flowKey, dnn, flow.qosRef!)?.mbrUL}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell style={{ width: "40%" }}>Downlink MBR</TableCell>
                                <TableCell>{qosFlow(flowKey, dnn, flow.qosRef!)?.mbrDL}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell style={{ width: "40%" }}>Charging Characteristics</TableCell>
                                <TableCell>{chargingConfig(dnn, flow.snssai, flow.filter)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Card>
            </Box>
        </div>
    );
};

const toHex = (v: number | undefined): string => {
    return ("00" + v?.toString(16).toUpperCase()).substr(-2);
};

export default FlowRule;
