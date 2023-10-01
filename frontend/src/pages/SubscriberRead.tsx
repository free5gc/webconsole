import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import axios from "../axios";
import {
  Subscription,
  Nssai,
  AuthenticationSubscription,
  AccessAndMobilitySubscriptionData,
  DnnConfiguration,
  QosFlows,
} from "../api/api";

import Dashboard from "../Dashboard";
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
} from "@mui/material";

export default function SubscriberRead() {
  const { id, plmn } = useParams<{
    id: string;
    plmn: string;
  }>();
  const navigation = useNavigate();

  const [data, setData] = useState<Subscription>({});
  // const [update, setUpdate] = useState<boolean>(false);

  useEffect(() => {
    axios.get("/api/subscriber/" + id + "/" + plmn).then((res) => {
      setData(res.data);
    });
  }, [id]);

  const handleEdit = () => {
    navigation("/subscriber/update/" + id + "/" + plmn);
  };

  const isDefaultNssai = (nssai: Nssai | undefined) => {
    if (nssai === undefined) {
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

  const operationCodeType = (auth: AuthenticationSubscription | undefined) => {
    if (auth !== undefined) {
      if (
        auth.milenage !== undefined &&
        auth.milenage.op !== undefined &&
        auth.milenage.op.opValue !== ""
      ) {
        return "OP";
      } else {
        return "OPc";
      }
    }
    return "";
  };

  const operationCodeValue = (auth: AuthenticationSubscription | undefined) => {
    if (auth !== undefined) {
      if (
        auth.milenage !== undefined &&
        auth.milenage.op !== undefined &&
        auth.milenage.op.opValue !== ""
      ) {
        return auth.milenage.op.opValue;
      }
      if (auth.opc !== undefined && auth.opc.opcValue !== "") {
        return auth.opc.opcValue;
      }
    }
    return "";
  };

  const qosFlow = (flowKey: string, dnn: string): QosFlows|undefined => {
    if (data.QosFlows !== undefined) {
      for (let i = 0; i < data.QosFlows?.length; i++) {
        const qos = data.QosFlows![i];
        if (qos.snssai === flowKey && qos.dnn === dnn) {
          return qos;
        }
      }
    }
  }

  const flowRule = (dnn: string, snssai: Nssai) => {
    function toHex(v: number | undefined) {
      return ("00" + v?.toString(16).toUpperCase()).substr(-2);
    }
    const flowKey = toHex(snssai.sst) + snssai.sd;
    if (data.FlowRules !== undefined) {
      for (let i = 0; i < data.FlowRules?.length; i++) {
        const flow = data.FlowRules![i];
        if (flow.snssai === flowKey && flow.dnn === dnn) {
          const qos = qosFlow(flowKey, dnn);
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
                    </TableBody>
                    <TableBody>
                      <TableRow>
                        <TableCell style={{ width: "40%" }}>Precedence</TableCell>
                        <TableCell>{flow.precedence}</TableCell>
                      </TableRow>
                    </TableBody>
                    <TableBody>
                      <TableRow>
                        <TableCell style={{ width: "40%" }}>5QI</TableCell>
                        <TableCell>{flow.qfi}</TableCell>
                      </TableRow>
                    </TableBody>
                    <TableBody>
                      <TableRow>
                        <TableCell style={{ width: "40%" }}>Uplink GBR</TableCell>
                        <TableCell>{qos!.gbrUL}</TableCell>
                      </TableRow>
                    </TableBody>
                    <TableBody>
                      <TableRow>
                        <TableCell style={{ width: "40%" }}>Downlink GBR</TableCell>
                        <TableCell>{qos!.gbrDL}</TableCell>
                      </TableRow>
                    </TableBody>
                    <TableBody>
                      <TableRow>
                        <TableCell style={{ width: "40%" }}>Uplink MBR</TableCell>
                        <TableCell>{qos!.mbrUL}</TableCell>
                      </TableRow>
                    </TableBody>
                    <TableBody>
                      <TableRow>
                        <TableCell style={{ width: "40%" }}>Downlink MBR</TableCell>
                        <TableCell>{qos!.mbrDL}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Card>
              </Box>
            </div>
          );
        }
      }
    }
    return <div></div>;
  };

  const upSecurity = (dnn: DnnConfiguration | undefined) => {
    if (dnn !== undefined && dnn!.upSecurity !== undefined) {
      const security = dnn!.upSecurity!;
      return (
        <div key={security.upIntegr}>
          <Box sx={{ m: 2 }}>
            <h4>UP Security</h4>
            <Card variant="outlined">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell style={{ width: "40%" }}>Integrity of UP Security</TableCell>
                    <TableCell>{security.upIntegr}</TableCell>
                  </TableRow>
                </TableBody>
                <TableBody>
                  <TableRow>
                    <TableCell style={{ width: "40%" }}>Confidentiality of UP Security</TableCell>
                    <TableCell>{security.upConfid}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Card>
          </Box>
        </div>
      );
    } else {
      return <div></div>;
    }
  };

  return (
    <Dashboard title="Subscription">
      <Card variant="outlined">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>PLMN ID</TableCell>
              <TableCell>{data.plmnID}</TableCell>
            </TableRow>
          </TableBody>
          <TableBody>
            <TableRow>
              <TableCell style={{ width: "40%" }}>SUPI (IMSI)</TableCell>
              <TableCell>{imsiValue(data.ueId)}</TableCell>
            </TableRow>
          </TableBody>
          <TableBody>
            <TableRow>
              <TableCell style={{ width: "40%" }}>MSISDN</TableCell>
              <TableCell>{msisdnValue(data.AccessAndMobilitySubscriptionData)}</TableCell>
            </TableRow>
          </TableBody>
          <TableBody>
            <TableRow>
              <TableCell style={{ width: "40%" }}>Authentication Management Field (AMF)</TableCell>
              <TableCell>
                {data.AuthenticationSubscription?.authenticationManagementField}
              </TableCell>
            </TableRow>
          </TableBody>
          <TableBody>
            <TableRow>
              <TableCell style={{ width: "40%" }}>Authentication Method</TableCell>
              <TableCell>{data.AuthenticationSubscription?.authenticationMethod}</TableCell>
            </TableRow>
          </TableBody>
          <TableBody>
            <TableRow>
              <TableCell style={{ width: "40%" }}>K</TableCell>
              <TableCell>
                {data.AuthenticationSubscription?.permanentKey?.permanentKeyValue}
              </TableCell>
            </TableRow>
          </TableBody>
          <TableBody>
            <TableRow>
              <TableCell style={{ width: "40%" }}>Operator Code Type</TableCell>
              <TableCell>{operationCodeType(data.AuthenticationSubscription)}</TableCell>
            </TableRow>
          </TableBody>
          <TableBody>
            <TableRow>
              <TableCell style={{ width: "40%" }}>Operator Code Value</TableCell>
              <TableCell>{operationCodeValue(data.AuthenticationSubscription)}</TableCell>
            </TableRow>
          </TableBody>
          <TableBody>
            <TableRow>
              <TableCell style={{ width: "40%" }}>SQN</TableCell>
              <TableCell>{data.AuthenticationSubscription?.sequenceNumber}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
      <h3>Subscribed UE AMBR</h3>
      <Card variant="outlined">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell style={{ width: "40%" }}>Uplink</TableCell>
              <TableCell>
                {data.AccessAndMobilitySubscriptionData?.subscribedUeAmbr?.uplink}
              </TableCell>
            </TableRow>
          </TableBody>
          <TableBody>
            <TableRow>
              <TableCell style={{ width: "40%" }}>Downlink</TableCell>
              <TableCell>
                {data.AccessAndMobilitySubscriptionData?.subscribedUeAmbr?.downlink}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
      {data.SessionManagementSubscriptionData?.map((row, index) => (
        <div key={index}>
          <h3>S-NSSAI Configuragtion</h3>
          <Card variant="outlined">
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell style={{ width: "40%" }}>SST</TableCell>
                  <TableCell>{row.singleNssai?.sst}</TableCell>
                </TableRow>
              </TableBody>
              <TableBody>
                <TableRow>
                  <TableCell style={{ width: "40%" }}>SD</TableCell>
                  <TableCell>{row.singleNssai?.sd}</TableCell>
                </TableRow>
              </TableBody>
              <TableBody>
                <TableRow>
                  <TableCell style={{ width: "40%" }}>Default S-NSSAI</TableCell>
                  <TableCell>
                    <Checkbox checked={isDefaultNssai(row.singleNssai)} />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            {row.dnnConfigurations &&
              Object.keys(row.dnnConfigurations!).map((dnn) => (
                <div key={dnn}>
                  <Box sx={{ m: 2 }}>
                    <h4>DNN Configurations</h4>
                    <Card variant="outlined">
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell style={{ width: "40%" }}>Data Network Name</TableCell>
                            <TableCell>{dnn}</TableCell>
                          </TableRow>
                        </TableBody>
                        <TableBody>
                          <TableRow>
                            <TableCell style={{ width: "40%" }}>Uplink AMBR</TableCell>
                            <TableCell>{row.dnnConfigurations![dnn].sessionAmbr?.uplink}</TableCell>
                          </TableRow>
                        </TableBody>
                        <TableBody>
                          <TableRow>
                            <TableCell style={{ width: "40%" }}>Downlink AMBR</TableCell>
                            <TableCell>
                              {row.dnnConfigurations![dnn].sessionAmbr?.downlink}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                        <TableBody>
                          <TableRow>
                            <TableCell style={{ width: "40%" }}>Default 5QI</TableCell>
                            <TableCell>
                              {row.dnnConfigurations![dnn]["5gQosProfile"]?.["5qi"]}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                      {flowRule(dnn, row.singleNssai!)}
                      {upSecurity(row.dnnConfigurations![dnn])}
                    </Card>
                  </Box>
                </div>
              ))}
          </Card>
        </div>
      ))}
      <br />
      <Grid item xs={12}>
        <Button color="primary" variant="contained" onClick={handleEdit} sx={{ m: 1 }}>
          EDIT
        </Button>
      </Grid>
    </Dashboard>
  );
}
