import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { ChargingData, FlowChargingRecord } from "../../api/api";

import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const OfflineChargingList: React.FC<{
  expand: boolean;
  chargingData: ChargingData[];
  chargingRecord: FlowChargingRecord[];
}> = (props) => {
  const tableColumnNames = [
    "SUPI",
    "S-NSSAI",
    "DNN",
    "IP Filter",
    "Usage",
    "Data Total Volume",
    "Data Volume UL",
    "Data Volume DL",
  ];

  const FlowUsageCell: React.FC<{
    supi: string;
    dnn: string;
    snssai: string;
    filter: string;
    unitcost: string;
  }> = (Props) => {
    const chargingRecordMatch = props.chargingRecord.find(
      (a) =>
        a.Supi === Props.supi! &&
        a.Dnn! === Props.dnn &&
        a.Snssai! === Props.snssai &&
        a.Filter! === Props.filter,
    );

    let usage = 0;
    if (chargingRecordMatch) {
      usage = chargingRecordMatch.TotalVol ? Number(chargingRecordMatch.TotalVol) : 0;
      usage = usage * Number(Props.unitcost);
    }

    return (
      <>
        {/* <TableCell>{chargingRecordMatch ? usage : "-"}</TableCell> */}
        <TableCell>{chargingRecordMatch ? chargingRecordMatch.Usage : "-"}</TableCell>
        <TableCell>{chargingRecordMatch ? chargingRecordMatch.TotalVol : "-"}</TableCell>
        <TableCell>{chargingRecordMatch ? chargingRecordMatch.UlVol : "-"}</TableCell>
        <TableCell>{chargingRecordMatch ? chargingRecordMatch.DlVol : "-"}</TableCell>
      </>
    );
  };

  const PerFlowTableView: React.FC<{ Supi: string; Snssai: string }> = (Props) => (
    <>
      {props.expand === true ? (
        props.chargingData
          .filter((a) => a!.filter !== "" && a!.ueId === Props.Supi && a!.snssai === Props.Snssai)
          .map((cd, idx) => (
            <TableRow key={idx}>
              <TableCell></TableCell>
              <TableCell>{cd.snssai}</TableCell>
              <TableCell>{cd.dnn}</TableCell>
              <TableCell>{cd.filter}</TableCell>
              {
                <FlowUsageCell
                  supi={Props.Supi}
                  dnn={cd.dnn!}
                  snssai={Props.Snssai}
                  filter={cd.filter!}
                  unitcost={cd.unitCost!}
                />
              }
            </TableRow>
          ))
      ) : (
        <></>
      )}
    </>
  );

  return (
    <Table>
      <TableHead>
        <h3>Offline Charging</h3>
        <TableRow>
          {tableColumnNames.map((colName, idx) => {
            return <TableCell key={idx}>{colName}</TableCell>;
          })}
        </TableRow>
      </TableHead>
      <TableBody>
        {props.chargingData
          .filter((a) => a!.filter === "")
          .map((cd, idx) => {
            return (
              <>
                <TableRow key={idx}>
                  <TableCell>{cd.ueId}</TableCell>
                  <TableCell>{cd.snssai}</TableCell>
                  <TableCell>{cd.dnn}</TableCell>
                  <TableCell>{cd.filter}</TableCell>
                  <FlowUsageCell
                    supi={cd.ueId!}
                    dnn={cd.dnn!}
                    snssai={cd.snssai!}
                    filter={cd.filter!}
                    unitcost={cd.unitCost!}
                  />
                </TableRow>
                {<PerFlowTableView Supi={cd.ueId!} Snssai={cd.snssai!} />}
              </>
            );
          })}
      </TableBody>
    </Table>
  );
};

export default OfflineChargingList;
