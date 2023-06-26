import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import PhoneAndroid from "@mui/icons-material/PhoneAndroid";

import { config } from "../constants/config";
import { Auth } from "aws-amplify";

import { LoginContext } from "../LoginContext";

export const Logout = () => {
  const navigation = useNavigate();
  const { setUser } = useContext(LoginContext);

  function onLogout() {
    if (config.enableCognitoAuth) {
      Auth.signOut();
    } else {
      setUser(null);
      navigation("/login");
    }
  }

  return (
    <React.Fragment>
      <ListItemButton onClick={() => onLogout()}>
        <ListItemIcon>
          <PhoneAndroid />
        </ListItemIcon>
        <ListItemText primary="LOGOUT" />
      </ListItemButton>
    </React.Fragment>
  );
};
