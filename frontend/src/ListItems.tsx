import React, { useContext } from "react";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import BarChartIcon from "@mui/icons-material/BarChart";
import PhoneAndroid from "@mui/icons-material/PhoneAndroid";
import InsertDriveFile from "@mui/icons-material/InsertDriveFile";
import FontDownload from "@mui/icons-material/FontDownload";

import { Link } from "react-router-dom";
import { LoginContext } from "./LoginContext";
import { config } from "./constants/config";

export const MainListItems = () => {
  const { user } = useContext(LoginContext);

  const isAdmin = () => {
    if (config.enableCognitoAuth) {
      return true;
    }
    if (user !== null && user.username === "admin") {
      return true;
    }
    return false;
  };

  return (
    <React.Fragment>
      <Link to="/status" style={{ color: "inherit", textDecoration: "inherit" }}>
        <ListItemButton>
          <ListItemIcon>
            <PhoneAndroid />
          </ListItemIcon>
          <ListItemText primary="REALTIME STATUS" />
        </ListItemButton>
      </Link>
      <Link to="/subscriber" style={{ color: "inherit", textDecoration: "inherit" }}>
        <ListItemButton>
          <ListItemIcon>
            <BarChartIcon />
          </ListItemIcon>
          <ListItemText primary="SUBSCRIBERS" />
        </ListItemButton>
      </Link>
      <Link to="/analysis" style={{ color: "inherit", textDecoration: "inherit" }}>
        <ListItemButton>
          <ListItemIcon>
            <FontDownload />
          </ListItemIcon>
          <ListItemText primary="ANALYSIS" />
        </ListItemButton>
      </Link>
      {isAdmin() ? (
        <Link to="/tenant" style={{ color: "inherit", textDecoration: "inherit" }}>
          <ListItemButton>
            <ListItemIcon>
              <InsertDriveFile />
            </ListItemIcon>
            <ListItemText primary="TENANT AND USER" />
          </ListItemButton>
        </Link>
      ) : (
        <div />
      )}
    </React.Fragment>
  );
};
