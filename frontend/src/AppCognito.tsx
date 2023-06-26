import React from "react";
import Top from "./Top";
import { cognitoConstants } from "./constants/aws";
import axios from "./axios";

import { Amplify } from "aws-amplify";
Amplify.configure(cognitoConstants);

import { withAuthenticator, Greetings, SignUp } from "amplify-material-ui";

function AppCognito() {
  axios.defaults.headers.common.Token = "admin";
  return <Top />;
}

export default withAuthenticator(AppCognito, {
  hide: [Greetings, SignUp],
  hideSignUpLink: true,
  hideForgotPasswordLink: true,
});
