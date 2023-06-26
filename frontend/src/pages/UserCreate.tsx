import React from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import axios from "../axios";
import { User } from "../api/api";

import Dashboard from "../Dashboard";
import { Button, Grid, TextField, Table, TableBody, TableCell, TableRow } from "@mui/material";

export default function UserCreate() {
  const navigation = useNavigate();
  const [user, setUser] = useState<User>({});

  const { id } = useParams<{
    id: string;
  }>();

  const handleCreate = () => {
    axios
      .post("/api/tenant/" + id + "/user", user)
      .then((res) => {
        console.log("post result:" + res);
        navigation("/tenant/" + id + "/user");
      })
      .catch((err) => {
        alert(err.response.data.message);
      });
  };

  const handleChangeEmail = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    setUser({ ...user, email: event.target.value });
  };

  const handleChangePassword = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    setUser({ ...user, encryptedPassword: event.target.value });
  };

  return (
    <Dashboard title="User">
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>
              <TextField
                label="User Email"
                variant="outlined"
                required
                fullWidth
                value={user.email}
                onChange={handleChangeEmail}
              />
            </TableCell>
          </TableRow>
        </TableBody>
        <TableBody>
          <TableRow>
            <TableCell>
              <TextField
                label="Password"
                variant="outlined"
                required
                fullWidth
                value={user.encryptedPassword}
                onChange={handleChangePassword}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <br />
      <Grid item xs={12}>
        <Button color="primary" variant="contained" onClick={handleCreate} sx={{ m: 1 }}>
          CREATE
        </Button>
      </Grid>
    </Dashboard>
  );
}
