import React, { useContext, useState, useEffect } from "react";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import useMediaQuery from "@mui/material/useMediaQuery";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import { MainListItems } from "./ListItems";
import { LoginContext } from "./LoginContext";
import SimpleListMenu from "./SimpleListMenu";
import { useNavigate } from "react-router-dom";

const drawerWidth = 300;

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    "& .MuiDrawer-paper": {
      position: "relative",
      whiteSpace: "nowrap",
      width: drawerWidth,
      backgroundColor: "#FCFCFD",
      borderRight: "1px solid #EEEEEE",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: "border-box",
      ...(!open && {
        overflowX: "hidden",
        transition: theme.transitions.create("width", {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up("sm")]: {
          width: theme.spacing(9),
        },
      }),
    },
  }),
);

const mdTheme = createTheme();

const teslaTheme = createTheme({
  palette: {
    primary: {
      main: "#3E6AE1",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#171A20",
    },
    background: {
      default: "#FFFFFF",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#171A20",
      secondary: "#393C41",
    },
    divider: "#EEEEEE",
  },
  shape: {
    borderRadius: 4,
  },
  typography: {
    fontFamily: '"Universal Sans Text", -apple-system, Arial, sans-serif',
    h6: {
      fontSize: "1rem",
      fontWeight: 500,
      letterSpacing: 0,
    },
    button: {
      fontSize: "0.875rem",
      fontWeight: 500,
      textTransform: "none",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          minHeight: 40,
          transition: "border-color 0.33s, background-color 0.33s, color 0.33s, box-shadow 0.25s",
          boxShadow: "none",
          border: "3px solid transparent",
        },
        containedPrimary: {
          backgroundColor: "#3E6AE1",
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: "#365FCC",
            boxShadow: "none",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          border: "1px solid #EEEEEE",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: "#171A20",
          fontWeight: 500,
          fontSize: "0.875rem",
        },
        body: {
          color: "#393C41",
          fontSize: "0.875rem",
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
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          margin: "4px 10px",
          minHeight: 40,
          transition: "color 0.33s, background-color 0.33s",
          "&.Mui-selected, &.Mui-selected:hover, &:hover": {
            backgroundColor: "rgba(62, 106, 225, 0.08)",
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#EEEEEE",
        },
      },
    },
  },
});

export interface DashboardProps {
  children: React.ReactNode;
  title: string;
  refreshAction: () => void;
}

function Dashboard(props: DashboardProps) {
  const [open, setOpen] = React.useState(true);
  const isMobile = useMediaQuery(mdTheme.breakpoints.down("md"));

  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [isMobile]);

  const toggleDrawer = () => {
    setOpen(!open);
  };
  const context = useContext(LoginContext);
  if (context === undefined) {
    throw new Error("LoginContext must be used within a LoginContext.Provider");
  }
  const { user } = context;

  const navigation = useNavigate();

  const [time, setTime] = useState<Date>(new Date());
  const [refreshInterval, setRefreshInterval] = useState(0);
  const [refreshString, setRefreshString] = useState("manual");

  // execute every time the refreshInterval changes to set the interval correctly
  // update the time value every x ms, which triggers refresh (see below)
  useEffect(() => {
    if (refreshInterval === 0) {
      console.log("refreshInterval is 0");
      return;
    }
    const interval = setInterval(() => setTime(new Date()), refreshInterval);
    return () => {
      console.log("clear refreshInterval");
      clearInterval(interval);
    };
  }, [refreshInterval]);

  // refresh every time the 'time' value changes
  useEffect(() => {
    console.log("reload page at", time.toISOString());
    props.refreshAction();
  }, [time]);

  const handleUserNameClick = (event: React.MouseEvent<HTMLElement>, index: number) => {
    switch (index) {
      case 0:
        navigation("/password");
        break;
      case 1:
        // setUser(null);
        navigation("/login");
        break;
      default:
        break;
    }
  };

  const refreshStrings = ["manual", "1s", "5s", "10s", "30s"];

  const handleRefreshClick = (event: React.MouseEvent<HTMLElement>, index: number) => {
    switch (index) {
      case 0: // manual
        setRefreshInterval(0);
        setRefreshString(refreshStrings.at(index)!);
        break;
      case 1: // 1s
        setRefreshInterval(1000);
        setRefreshString(refreshStrings.at(index)!);
        break;
      case 2: // 5s
        setRefreshInterval(5000);
        setRefreshString(refreshStrings.at(index)!);
        break;
      case 3: // 10s
        setRefreshInterval(10000);
        setRefreshString(refreshStrings.at(index)!);
        break;
      case 4: // 30s
        setRefreshInterval(30000);
        setRefreshString(refreshStrings.at(index)!);
        break;
      default:
        break;
    }
  };
  return (
    <ThemeProvider theme={teslaTheme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          open={open && !isMobile}
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.75)",
            color: "#171A20",
            backdropFilter: "blur(8px)",
            borderBottom: "1px solid #EEEEEE",
            boxShadow: "none",
            transition: "background-color 0.33s, color 0.33s",
          }}
        >
          <Toolbar
            sx={{
              pr: "24px",
            }}
          >
            <IconButton
              edge="start"
              color="secondary"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: "36px",
                ...(!isMobile && open && { display: "none" }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
              <Typography component="h1" variant="h6" color="#171A20" noWrap>
                {props.title}
              </Typography>
              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  mx: 2,
                  borderColor: "#D0D1D2",
                }}
              />
              <SimpleListMenu
                title={`Refresh: ${refreshString}`}
                options={refreshStrings}
                handleMenuItemClick={handleRefreshClick}
              />
            </Box>
            <SimpleListMenu
              title={user?.username}
              options={["Change Password", "Logout"]}
              handleMenuItemClick={handleUserNameClick}
            />
          </Toolbar>
        </AppBar>
        {isMobile ? (
          <MuiDrawer
            variant="temporary"
            open={open}
            onClose={toggleDrawer}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                borderRight: "1px solid #EEEEEE",
              },
            }}
          >
            <Toolbar
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                px: [1],
              }}
            >
              <IconButton onClick={toggleDrawer}>
                <ChevronLeftIcon />
              </IconButton>
            </Toolbar>
            <Divider />
            <List component="nav">
              <MainListItems />
              <Divider sx={{ my: 1 }} />
            </List>
          </MuiDrawer>
        ) : (
          <Drawer variant="permanent" open={open}>
            <Toolbar
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                px: [1],
              }}
            >
              <IconButton onClick={toggleDrawer}>
                <ChevronLeftIcon />
              </IconButton>
            </Toolbar>
            <Divider />
            <List component="nav">
              <MainListItems />
              <Divider sx={{ my: 1 }} />
            </List>
          </Drawer>
        )}
        <Box
          component="main"
          sx={{
            backgroundColor: "#F4F4F4",
            flexGrow: 1,
            height: "100vh",
            overflow: "auto",
            pb: 10,
          }}
        >
          <Toolbar />
          <Box
            sx={{
              minHeight: 180,
              backgroundColor: "#171A20",
              borderBottom: "1px solid #EEEEEE",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                width: "320px",
                height: "320px",
                borderRadius: "12px",
                backgroundColor: "rgba(62, 106, 225, 0.35)",
                transform: "rotate(32deg)",
                right: "-140px",
                top: "-140px",
              },
              "&::after": {
                content: '""',
                position: "absolute",
                width: "220px",
                height: "220px",
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                transform: "rotate(25deg)",
                left: "-110px",
                bottom: "-110px",
              },
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Universal Sans Display", -apple-system, Arial, sans-serif',
                fontWeight: 500,
                fontSize: { xs: "1.7rem", md: "2.2rem" },
                color: "#FFFFFF",
                zIndex: 1,
              }}
            >
              {props.title}
            </Typography>
          </Box>
          <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper
                  sx={{
                    p: { xs: 2, md: 3 },
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#FFFFFF",
                    borderRadius: "12px",
                  }}
                >
                  {props.children}
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>

        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: isMobile ? 0 : open ? `${drawerWidth}px` : 0,
            right: 0,
            backgroundColor: "#FFFFFF",
            borderTop: "1px solid #EEEEEE",
            px: 2,
            py: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 2,
            zIndex: teslaTheme.zIndex.appBar,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#3E6AE1" }}>
            <EventAvailableIcon sx={{ fontSize: "1rem" }} />
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
              Schedule a Drive Today
            </Typography>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default Dashboard;
