import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { config } from "../constants/config";

import axios from "../axios";
import { Subscriber } from "../api/api";

import Dashboard from "../Dashboard";
import {
  Alert,
  Box,
  Button,
  Grid,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
} from "@mui/material";
import { ReportProblemRounded } from "@mui/icons-material";

interface Props {
  refresh: boolean;
  setRefresh: (v: boolean) => void;
}

function SubscriberList(props: Props) {
  const navigation = useNavigate();
  const [data, setData] = useState<Subscriber[]>([]);
  const [limit, setLimit] = useState(50);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoadError, setIsLoadError] = useState(false);
  const [isDeleteError, setIsDeleteError] = useState(false);

  useEffect(() => {
    console.log("get subscribers");
    axios
      .get("/api/subscriber")
      .then((res) => {
        setData(res.data);
      })
      .catch((e) => {
        setIsLoadError(true);
      });
  }, [props.refresh, limit, page]);

  if (isLoadError) {
    return (
      <Stack sx={{ mx: "auto", py: "2rem" }} spacing={2} alignItems={"center"}>
        <ReportProblemRounded sx={{ fontSize: "3rem" }} />
        <Box fontWeight={700}>Something went wrong</Box>
      </Stack>
    );
  }

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
        props.setRefresh(!props.refresh);
      })
      .catch((err) => {
        setIsDeleteError(true);
        console.error(err.response.data.message);
      });
  };

  const onCreate = () => {
    navigation("/subscriber/create");
  };

  const handleModify = (subscriber: Subscriber) => {
    navigation("/subscriber/" + subscriber.ueId + "/" + subscriber.plmnID);
  };

  const handleEdit = (subscriber: Subscriber) => {
    navigation("/subscriber/create/" + subscriber.ueId + "/" + subscriber.plmnID);
  };

  const filteredData = data.filter((subscriber) =>
    subscriber.ueId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subscriber.plmnID?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  if (data == null || data.length === 0) {
    return (
      <>
        <br />
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
      </>
    )
  }

  return (
    <>
      <br />
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
            <TableCell>Edit</TableCell>
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
              <TableCell>
                <Button color="primary" variant="contained" onClick={() => handleEdit(row)}>
                  EDIT
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

      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={isDeleteError}
        autoHideDuration={6000}
        onClose={() => setIsDeleteError(false)}
      >
        <Alert severity="error">Failed to delete subscriber</Alert>
      </Snackbar>
    </>
  );
}

function WithDashboard(Component: React.ComponentType<any>) {
  return function (props: any) {
    const [refresh, setRefresh] = useState<boolean>(false);

    return (
      <Dashboard title="SUBSCRIBER" refreshAction={() => setRefresh(!refresh)}>
        <Component {...props} refresh={refresh} setRefresh={(v: boolean) => setRefresh(v)} />
      </Dashboard>
    );
  };
}

export default WithDashboard(SubscriberList);
