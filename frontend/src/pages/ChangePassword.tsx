import React, { useContext } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "../axios";
import { User } from "../api/api";

import { LoginContext } from "../LoginContext";

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

export interface Password {
  password?: string;
  passwordAgain?: string;
}

export default function ChangePassword() {
  const navigation = useNavigate();

  const { user } = useContext(LoginContext);

  const [password, setPassword] = useState<Password>({});

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = () => setShowPassword(!showPassword);

  const [showPasswordAgain, setShowPasswordAgain] = useState(false);
  const handleClickShowPasswordAgain = () => setShowPasswordAgain(!showPasswordAgain);
  const handleMouseDownPasswordAgain = () => setShowPasswordAgain(!showPasswordAgain);

  const onUpdate = () => {
    if (password.password === undefined || password.password === "") {
      alert("Password can't be empty");
      return;
    }
    if (password.passwordAgain === undefined || password.passwordAgain === "") {
      alert("Password can't be empty");
      return;
    }
    if (password.password !== password.passwordAgain) {
      alert("Password mismatch");
      return;
    }
    const newUser: User = {
      email: user?.username,
      encryptedPassword: password.password,
    };
    axios.post("/api/change-password", newUser).then((res) => {
      console.log("put result:" + res);
      navigation("/");
    });
  };

  const handleChangePassword = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    setPassword({ ...password, password: event.target.value });
  };

  const handleChangePasswordAgain = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    setPassword({ ...password, passwordAgain: event.target.value });
  };

  return (
    <Dashboard title="Change Password">
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>
              <TextField
                label="Password"
                variant="outlined"
                required
                fullWidth
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
        <TableBody>
          <TableRow>
            <TableCell>
              <TextField
                label="Password Again"
                variant="outlined"
                required
                fullWidth
                type={showPasswordAgain ? "text" : "password"}
                onChange={handleChangePasswordAgain}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPasswordAgain}
                        onMouseDown={handleMouseDownPasswordAgain}
                      >
                        {showPasswordAgain ? <Visibility /> : <VisibilityOff />}
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
