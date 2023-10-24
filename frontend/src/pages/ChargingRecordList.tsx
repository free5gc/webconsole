import React, { Component, useState, useEffect } from "react";
import axios from "../axios";
import { ChargingRecord } from "../api/api";
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
        console.log(err)
      })
  }

  useEffect(() => {
    fetchUEWithCR()
  }, [])

  const onRefresh = () => {
    fetchUEWithCR()
  }

  const onExpand = () => {
    if (expand === true) {
      setExpand(false)
    } else {
      setExpand(true)
    }
  }

  const tableView = (
    <Table>
      <TableHead>
          <TableRow>
            <TableCell>SUPI</TableCell>
            <TableCell>Status/IP Filter</TableCell>
            <TableCell>Quota Left</TableCell>
            <TableCell>Data Total Volume</TableCell>
            <TableCell>Data Volume Uplink</TableCell>
            <TableCell>Data Volume Downlink</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cr.map((row, index) => (
            <TableRow key={index}>
              <TableCell>
                {row.Supi}
                <Button
                  onClick={() => onExpand()}
                >
                {expand === true ? <ExpandMoreIcon viewBox="0 0 24 24"/> : <ExpandLessIcon viewBox="0 0 24 24"/>}
                </Button>
              </TableCell>
              <TableCell>{row.CmState}</TableCell>
              <TableCell>{row.Quota}</TableCell>
              <TableCell>{row.DataTotalVolume}</TableCell>
              <TableCell>{row.DataVolumeUplink}</TableCell>
              <TableCell>{row.DataVolumeDownlink}</TableCell>
            </TableRow>
          ))}
          {expand === true ? cr.map((row, index) => (
            row.flowInfos?.map((flowChargingRecord, i) => (
              <TableRow key={i}>
                <TableCell>{}</TableCell>
                <TableCell>{flowChargingRecord.Filter}</TableCell>
                <TableCell>{flowChargingRecord.QuotaLeft}</TableCell>
                <TableCell>{flowChargingRecord.DataTotalVolume}</TableCell>
                <TableCell>{flowChargingRecord.DataVolumeUplink}</TableCell>
                <TableCell>{flowChargingRecord.DataVolumeDownlink}</TableCell>
              </TableRow>
            ))
          )): 
              <></>
          }
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