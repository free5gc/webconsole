import React, { useState, useEffect } from "react";
import axios from "../../axios";
import { FlowChargingRecord, ChargingData } from "../../api/api";
import Dashboard from "../../Dashboard";

import OnlineChargingList from "./OnlineChargingList";
import OfflineChargingList from "./OfflineChargingList";

import { Button, Grid } from "@mui/material";

export default function ChargingTable() {
  const [expand, setExpand] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  const [onlineChargingData, setOnlineChargingData] = useState<ChargingData[]>([]);
  const [offlineChargingData, setOfflineChargingData] = useState<ChargingData[]>([
    {
      snssai: "Test",
      dnn: "internet",
      qosRef: 1,
      filter: "1.2.3.4/32",
      chargingMethod: "Offline",
      quota: "unlimited",
      unitCost: "1",
    },
  ]);
  const [chargingRecord, setChargingRecord] = useState<FlowChargingRecord[]>([]);

  const fetchChargingRecord = () => {
    const MSG_FETCH_ERROR = "Get Charging Record error";
    axios
      .get("/api/charging-record")
      .then((res) => {
        setChargingRecord(res.data ? res.data : []);
        console.log("Charging Record", chargingRecord);
      })
      .catch((err) => {
        console.log(MSG_FETCH_ERROR, err);
      });
  };

  const fetchChargingData = (
    chargingMethod: string,
    setChargingData: React.Dispatch<React.SetStateAction<ChargingData[]>>,
  ) => {
    const MSG_FETCH_ERROR = "Get Charging Data error";
    axios
      .get("/api/charging-data/" + chargingMethod)
      .then((res) => {
        setChargingData(res.data ? res.data : []);
        console.log(chargingMethod, "charging-data", res.data);
      })
      .catch((err) => {
        console.log(MSG_FETCH_ERROR, err);
      });
  };

  const onRefresh = () => {
    fetchChargingData("Online", setOnlineChargingData);
    fetchChargingData("Offline", setOfflineChargingData);
    fetchChargingRecord();
    setCurrentTime(new Date());
  };

  useEffect(() => {
    const id = setInterval(() => {
      onRefresh();
    }, 60000);
    return () => clearInterval(id);
  }, []);

  const onExpand = () => {
    setExpand(!expand);
  };

  return (
    <Dashboard title="UE CHARGING RECORD">
      <Grid container spacing="2">
        <Grid item>
          <Button
            color="secondary"
            variant="contained"
            onClick={() => onRefresh()}
            sx={{ m: 2, backgroundColor: "blue", "&:hover": { backgroundColor: "blue" } }}
          >
            Refresh
          </Button>
        </Grid>
        <Grid item>
          <Button
            color="secondary"
            variant="contained"
            onClick={() => onExpand()}
            sx={{ m: 2, backgroundColor: "blue", "&:hover": { backgroundColor: "blue" } }}
          >
            {expand ? "Fold" : "Expand"}
          </Button>
        </Grid>
        <Grid item>
          <Button color="success" variant="contained" sx={{ m: 2 }} disabled>
            Last update: {currentTime.toISOString().slice(0, 19).replace("T", " ")}
          </Button>
        </Grid>
      </Grid>

      <br />
      <OnlineChargingList
        expand={expand}
        chargingData={onlineChargingData}
        chargingRecord={chargingRecord}
      />
      <br />
      <OfflineChargingList
        expand={expand}
        chargingData={offlineChargingData}
        chargingRecord={chargingRecord}
      />
    </Dashboard>
  );
}
