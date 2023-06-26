import React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import axios from "../axios";
import { User } from "../api/api";

import Dashboard from "../Dashboard";

import {
  Button,
  Grid,
  InputAdornment,
  IconButton,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function UserUpdate() {
  const { id, uid } = useParams<{
    id: string;
    uid: string;
  }>();
  const navigation = useNavigate();
  const [user, setUser] = useState<User>({});

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = () => setShowPassword(!showPassword);

  useEffect(() => {
    axios.get("/api/tenant/" + id + "/user/" + uid).then((res) => {
      setUser(res.data);
    });
  }, [id]);

  const onUpdate = () => {
    axios.put("/api/tenant/" + id + "/user/" + uid, user).then((res) => {
      console.log("put result:" + res);
      navigation("/tenant/" + id + "/user");
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
                label="User Id"
                variant="outlined"
                fullWidth
                value={user.userId}
                InputLabelProps={{ shrink: true }}
                inputProps={{ readonly: true, disabled: true }}
              />
            </TableCell>
          </TableRow>
        </TableBody>
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
                InputLabelProps={{ shrink: true }}
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
                type={showPassword ? "text" : "password"}
                onChange={handleChangePassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <br />
      <Grid item xs={12}>
        <Button color="primary" variant="contained" onClick={onUpdate} sx={{ m: 1 }}>
          Update
        </Button>
      </Grid>
    </Dashboard>
  );
}
