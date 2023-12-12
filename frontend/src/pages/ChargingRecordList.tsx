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
  const [cr, setCr] = useState<flowChargingRecord[]>([]) // cr: charging record
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
    //FlowCharingRecords: flowChargingRecord[] | undefined
    Supi: string | undefined
    Snssai: string | undefined
  }
  /* eslint-disable react/prop-types */
  const PerFlowTableView = ({ Supi, Snssai }: Props): React.ReactElement => (
    <>
      {expand === true ? cr.filter((a) => a!.Filter !== "" && a!.Dnn! !== "" && a!.Supi === Supi && a!.Snssai === Snssai).map((row, index) => (
            <TableRow key={index}>
              <TableCell>{}</TableCell>
              <TableCell>{row.Snssai}</TableCell>
              <TableCell>{row.Dnn}</TableCell>
              <TableCell>{row.Filter}</TableCell>
              <TableCell>{row.QuotaLeft}</TableCell>
              <TableCell>{row.TotalVol}</TableCell>
              <TableCell>{row.UlVol}</TableCell>
              <TableCell>{row.DlVol}</TableCell>
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
            <TableCell>IP Filter</TableCell>
            <TableCell>Quota Left</TableCell>
            <TableCell>Data Total Volume</TableCell>
            <TableCell>Data Volume Uplink</TableCell>
            <TableCell>Data Volume Downlink</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cr.filter((a) => a!.Filter === "" && a!.Dnn === "" ).sort((a, b) => (a!.Snssai! > b!.Snssai!) ? 1 : -1).map((row, index) => (
            <>
              <TableRow key={index}>
                <TableCell>
                  {row.Supi}
                  {<Button
                    onClick={() => onExpand()}
                  >
                  {expand === true ? <ExpandMoreIcon viewBox="0 0 24 24"/> : <ExpandLessIcon viewBox="0 0 24 24"/>}
                  </Button>}
                </TableCell>
                <TableCell>{row.Snssai}</TableCell>
                <TableCell>{row.Dnn}</TableCell>
                <TableCell>{row.Filter}</TableCell>
                <TableCell>{row.QuotaLeft}</TableCell>
                <TableCell>{row.TotalVol}</TableCell>
                <TableCell>{row.UlVol}</TableCell>
                <TableCell>{row.DlVol}</TableCell>
              </TableRow>
              {<PerFlowTableView Supi={row.Supi} Snssai={row.Snssai} />}
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