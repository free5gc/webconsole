import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { config } from "../constants/config";
import Dashboard from "../Dashboard";
import axios from "../axios";
import { Profile } from "../api/api";
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
  TablePagination,
  TableRow,
  TextField,
} from "@mui/material";
import { ReportProblemRounded } from "@mui/icons-material";

interface Props {
  refresh: boolean;
  setRefresh: (v: boolean) => void;
}

function ProfileList(props: Props) {
  const navigation = useNavigate();
  const [data, setData] = useState<Profile[]>([]);
  const [limit, setLimit] = useState(50);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoadError, setIsLoadError] = useState(false);
  const [isDeleteError, setIsDeleteError] = useState(false);

  useEffect(() => {
    axios
      .get("/api/profile")
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

  const onCreate = () => {
    navigation("/profile/create");
  };

  const onDelete = (profileName: string) => {
    const result = window.confirm("Delete profile?");
    if (!result) {
      return;
    }
    axios
      .delete("/api/profile/" + profileName)
      .then((res) => {
        props.setRefresh(!props.refresh);
      })
      .catch((err) => {
        setIsDeleteError(true);
        console.error(err.response.data.message);
      });
  };

  const handleModify = (profile: Profile) => {
    navigation("/profile/" + profile.profileName);
  };

  const filteredData = data.filter((profile) =>
    profile.profileName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  if (data.length === 0) {
    return (
      <>
        <br />
        <div>
          No Profiles
          <br />
          <br />
          <Grid item xs={12}>
            <Button color="primary" variant="contained" onClick={() => onCreate()} sx={{ m: 1 }}>
              CREATE
            </Button>
          </Grid>
        </div>
      </>
    );
  }

  return (
    <>
      <br />
      <TextField
        label="Search Profile"
        variant="outlined"
        value={searchTerm}
        onChange={handleSearch}
        fullWidth
        margin="normal"
      />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Delete</TableCell>
            <TableCell>View</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.profileName}</TableCell>
              <TableCell>
                <Button
                  color="primary"
                  variant="contained"
                  onClick={() => onDelete(row.profileName)}
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

      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={isDeleteError}
        autoHideDuration={6000}
        onClose={() => setIsDeleteError(false)}
      >
        <Alert severity="error">Failed to delete profile</Alert>
      </Snackbar>
    </>
  );
}

function WithDashboard(Component: React.ComponentType<any>) {
  return function (props: any) {
    const [refresh, setRefresh] = useState<boolean>(false);

    return (
      <Dashboard title="PROFILE" refreshAction={() => setRefresh(!refresh)}>
        <Component {...props} refresh={refresh} setRefresh={(v: boolean) => setRefresh(v)} />
      </Dashboard>
    );
  };
}

export default WithDashboard(ProfileList);
