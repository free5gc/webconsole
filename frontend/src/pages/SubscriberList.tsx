import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { config } from "../constants/config";

import axios from "../axios";
import { Subscriber } from "../api/api";

import Dashboard from "../Dashboard";
import {
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
} from "@mui/material";

export default function SubscriberList() {
  const navigation = useNavigate();
  const [refresh, setRefresh] = useState<boolean>(false);
  const [data, setData] = useState<Subscriber[]>([]);
  const [limit, setLimit] = useState(50);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    console.log("get subscribers");
    axios
      .get("/api/subscriber")
      .then((res) => {
        setData(res.data);
      })
      .catch((e) => {
        console.log(e.message);
      });
  }, [refresh, limit, page]);

  const handlePageChange = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage?: number,
  ) => {
    if (newPage !== null) {
      setPage(newPage!);
    }
  };

  const handleLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLimit(Number(event.target.value));
  };

  const count = () => {
    return 0;
  };

  const pager = () => {
    if (config.enablePagination) {
      return (
        <TablePagination
          component="div"
          count={count()}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleLimitChange}
          page={page}
          rowsPerPage={limit}
          rowsPerPageOptions={[50, 100, 200]}
        />
      );
    } else {
      return <br />;
    }
  };

  const onDelete = (id: string, plmn: string) => {
    const result = window.confirm("Delete subscriber?");
    if (!result) {
      return;
    }
    axios
      .delete("/api/subscriber/" + id + "/" + plmn)
      .then((res) => {
        console.log(res);
        setRefresh(!refresh);
      })
      .catch((err) => {
        alert(err.response.data.message);
      });
  };

  const onCreate = () => {
    navigation("/subscriber/create");
  };

  const handleModify = (subscriber: Subscriber) => {
    navigation("/subscriber/" + subscriber.ueId + "/" + subscriber.plmnID);
  };

  const filteredData = data.filter((subscriber) =>
    subscriber.ueId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subscriber.plmnID?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const tableView = (
    <React.Fragment>
      <TextField
        label="Search Subscriber"
        variant="outlined"
        value={searchTerm}
        onChange={handleSearch}
        fullWidth
        margin="normal"
      />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>PLMN</TableCell>
            <TableCell>UE ID</TableCell>
            <TableCell>Delete</TableCell>
            <TableCell>View</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.plmnID}</TableCell>
              <TableCell>{row.ueId}</TableCell>
              <TableCell>
                <Button
                  color="primary"
                  variant="contained"
                  onClick={() => onDelete(row.ueId!, row.plmnID!)}
                >
                  DELETE
                </Button>
              </TableCell>
              <TableCell>
                <Button color="primary" variant="contained" onClick={() => handleModify(row)}>
                  VIEW
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {pager()}
      <Grid item xs={12}>
        <Button color="primary" variant="contained" onClick={() => onCreate()} sx={{ m: 1 }}>
          CREATE
        </Button>
      </Grid>
    </React.Fragment>
  );

  return (
    <Dashboard title="SUBSCRIBER" refreshAction={() => setRefresh(!refresh)}>
      <br />
      {data == null || data.length === 0 ? (
        <div>
          No Subscription
          <br />
          <br />
          <Grid item xs={12}>
            <Button color="primary" variant="contained" onClick={() => onCreate()} sx={{ m: 1 }}>
              CREATE
            </Button>
          </Grid>
        </div>
      ) : (
        tableView
      )}
    </Dashboard>
  );
}
