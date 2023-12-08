import React, { useState, useEffect } from "react";
import axios from "../axios";
import { ChargingRecord, flowChargingRecord } from "../api/api";
import Dashboard from "../Dashboard";

import {
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function ChargingRecordList() {
  const [cr, setCr] = useState<ChargingRecord[]>([]) // cr: charging record
  const [expand, setExpand] = useState(false)


  function fetchUEWithCR() {
    const MSG_FETCH_ERROR = "Error fetching registered UEs. Is the core network up?";
    axios
      .get("/api/charging-record")
      .then((res) => {
        setCr(res.data)
        console.log(res.data)
      })
      .catch((err) => {
        console.log(MSG_FETCH_ERROR, err)
      })
  }

  useEffect(() => {
    const id = setInterval(() => {
      fetchUEWithCR()
    }, 1000 );
    return () => clearInterval(id);
  }, [])

  const onRefresh = () => {
    fetchUEWithCR()
  }

  const onExpand = () => {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const ret = (expand === true) ? setExpand(false) : setExpand(true)
  }
  
  interface Props {
    FlowCharingRecords: flowChargingRecord[] | undefined
  }
  /* eslint-disable react/prop-types */
  const PerFlowTableView = ({ FlowCharingRecords }: Props): React.ReactElement => (
    <>
      {expand === true ? FlowCharingRecords?.sort((a, b) => (a!.Filter! > b!.Filter!) ? 1 : -1).map((FlowChargingRecord, i) => (
            <TableRow key={i}>
              <TableCell>{}</TableCell>
              <TableCell>{}</TableCell>
              <TableCell>{}</TableCell>
              <TableCell>{FlowChargingRecord.Filter}</TableCell>
              <TableCell>{FlowChargingRecord.QuotaLeft}</TableCell>
              <TableCell>{FlowChargingRecord.DataTotalVolume}</TableCell>
              <TableCell>{FlowChargingRecord.DataVolumeUplink}</TableCell>
              <TableCell>{FlowChargingRecord.DataVolumeDownlink}</TableCell>
            </TableRow>
         )) : <></>
      }
    </>
  )
  
  const tableView = (
    <Table>
      <TableHead>
          <TableRow>
            <TableCell>SUPI</TableCell>
            <TableCell>S-NSSAI</TableCell>
            <TableCell>DNN</TableCell>
            <TableCell>Status/IP Filter</TableCell>
            <TableCell>Quota Left</TableCell>
            <TableCell>Data Total Volume</TableCell>
            <TableCell>Data Volume Uplink</TableCell>
            <TableCell>Data Volume Downlink</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cr.sort((a, b) => (a!.Supi! > b!.Supi!) ? 1 : -1).map((row, index) => (
            <>
              <TableRow key={index}>
                <TableCell>
                  {row.Supi}
                  <Button
                    onClick={() => onExpand()}
                  >
                  {expand === true ? <ExpandMoreIcon viewBox="0 0 24 24"/> : <ExpandLessIcon viewBox="0 0 24 24"/>}
                  </Button>
                </TableCell>
                <TableCell>{row["S-NSSAI"]}</TableCell>
                <TableCell>{row.DNN}</TableCell>
                <TableCell>{row.CmState}</TableCell>
                <TableCell>{row.Quota}</TableCell>
                <TableCell>{row.DataTotalVolume}</TableCell>
                <TableCell>{row.DataVolumeUplink}</TableCell>
                <TableCell>{row.DataVolumeDownlink}</TableCell>
              </TableRow>
              <PerFlowTableView FlowCharingRecords={row.flowInfos} />
            </>
          ))}
        </TableBody>
    </Table>
  )
  
  return (
    <Dashboard title="UE CHARGING RECORD">
      <Grid container spacing={2}>
        <Button
          color="secondary"
          variant="contained"
          onClick={() => onRefresh()}
          sx={{ m:2, backgroundColor: "blue", "&:hover": { backgroundColor: "blue" }}}
        >
          Refresh
        </Button>
      </Grid>
      <br />
      {tableView}
    </Dashboard>
  );

}