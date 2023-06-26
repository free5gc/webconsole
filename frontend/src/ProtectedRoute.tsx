import React, { useContext } from "react";
import { Navigate } from "react-router-dom";

import { LoginContext } from "./LoginContext";

export const ProtectedRoute = (props: any) => {
  const { user } = useContext(LoginContext);

  if (user === null) {
    return <Navigate to="/login" />;
  }
  return props.children;
};
