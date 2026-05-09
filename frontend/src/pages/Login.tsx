import React from "react";
import { useState, useContext } from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import axios from "../axios";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "../LoginContext";

const theme = createTheme({
  palette: {
    primary: {
      main: "#146ef5",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#FFFFFF",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#080808",
      secondary: "#363636",
    },
  },
  shape: {
    borderRadius: 4,
  },
  typography: {
    fontFamily: '"WF Visual Sans Variable", Arial, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 40,
          borderRadius: 4,
          textTransform: "none",
          fontWeight: 500,
          border: "1px solid transparent",
          boxShadow: "none",
          transition: "transform 0.33s, border-color 0.33s, background-color 0.33s, color 0.33s, box-shadow 0.25s",
          "&:hover": {
            transform: "translateX(6px)",
          },
        },
        containedPrimary: {
          "&:hover": {
            backgroundColor: "#0055d4",
            boxShadow: "none",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiInputBase-root": {
            borderRadius: 4,
          },
        },
      },
    },
  },
});

export default function SignIn() {
  const navigation = useNavigate();
  const [error, setError] = useState<string>("");
  const context = useContext(LoginContext);
  if (context === undefined) {
    throw new Error("LoginContext must be used within a LoginContext.Provider");
  }
  const { setUser } = context;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    axios
      .post("/api/login", { username: data.get("email"), password: data.get("password") })
      .then((res) => {
        if (data.get("email") !== null) {
          setUser({ username: data.get("email")!.toString(), token: res.data.access_token });
        }
        setError("");
        navigation("/");
      })
      .catch((err) => {
        console.log(err.message);
        setError("Wrong credentials");
      });
  };

  return (
    <ThemeProvider theme={theme}>
      <Container
        component="main"
        maxWidth={false}
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 20% -10%, rgba(122, 61, 255, 0.12) 0%, rgba(122, 61, 255, 0) 35%), radial-gradient(circle at 85% 15%, rgba(20, 110, 245, 0.12) 0%, rgba(20, 110, 245, 0) 40%), #ffffff",
        }}
      >
        <CssBaseline />
        <Paper
          sx={{
            width: "100%",
            maxWidth: 420,
            p: 4,
            border: "1px solid #d8d8d8",
            borderTop: "4px solid #146ef5",
            boxShadow:
              "rgba(0, 0, 0, 0) 0px 84px 24px, rgba(0, 0, 0, 0.01) 0px 54px 22px, rgba(0, 0, 0, 0.04) 0px 30px 18px, rgba(0, 0, 0, 0.08) 0px 13px 13px, rgba(0, 0, 0, 0.09) 0px 3px 7px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <img src="/free5gc_logo.png" className="App-logo" alt="logo" />
            <Typography
              sx={{
                mt: 2,
                fontFamily: '"WF Visual Sans Variable", Arial, sans-serif',
                fontWeight: 600,
                fontSize: "2rem",
                color: "#080808",
              }}
            >
              Webconsole
            </Typography>
            <Typography component="h1" sx={{ mt: 1, fontSize: "0.9rem", color: "#d32f2f" }}>
              {error}
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: "100%" }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Username"
                name="email"
                autoComplete="email"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
              />
              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 1 }}>
                Sign In
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}
