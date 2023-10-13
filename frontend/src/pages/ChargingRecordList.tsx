import React, { useState, useEffect } from "react";
import axios from "../axios";
import { ChargingRecord } from "../api/api";
import Dashboard from "../Dashboard";

import {
  Table,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";


export default function ChargingRecordList() {
  const [data, setData] = useState<ChargingRecord[]>([]);
  const [limit, setLimit] = useState(50);
  const [page, setPage] = useState(0);
  const [refresh, setRefresh] = useState<boolean>(false);

  useEffect(() => {
    axios
      .get("/api/charging-record")
      .then((res) => {
        setData(res.data);
      })
      .catch((e) => {
        console.log(e);
      });
  }, [limit, page, refresh]);

  const tableView = (
    <Table>
      <TableHead>
          <TableRow>
            <TableCell>SUPI</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Quota Left</TableCell>
            <TableCell>Data Total Volume</TableCell>
            <TableCell>Data Volume Uplink</TableCell>
            <TableCell>Data Volume Downlink</TableCell>
          </TableRow>
        </TableHead>
    </Table>
  )
  return (
    <Dashboard title="UE CHARGING RECORD">
      <br />
      {tableView}
    </Dashboard>
  );

}