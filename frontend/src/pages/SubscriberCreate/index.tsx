import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import axios from "../../axios";

import Dashboard from "../../Dashboard";
import {
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Typography,
  Alert,
} from "@mui/material";
import { SubscriberFormProvider, useSubscriptionForm } from "../../hooks/subscription-form";
import SubscriberFormBasic from "./SubscriberFormBasic";
import SubscriberFormUeAmbr from "./SubscriberFormUeAmbr";
import SubscriberFormSessions from "./SubscriberFormSessions";
import { FlowsMapperImpl as SubscriptionFlowsMapperImpl, SubscriptionMapperImpl } from "../../lib/dtos/subscription";
import { FlowsMapperImpl as ProfileFlowsMapperImpl, ProfileMapperImpl } from "../../lib/dtos/profile";
import { validateSubscription } from "../../lib/validator/subscriptionValidator";

// Max concurrent requests per batch. Keeps browser + server from being overwhelmed.
const BATCH_SIZE = 10;

function FormHOC(Component: React.ComponentType<any>) {
  return function (props: any) {
    return (
      <SubscriberFormProvider>
        <Component {...props} />
      </SubscriberFormProvider>
    );
  };
}

export default FormHOC(SubscriberCreate);

function SubscriberCreate() {
  const { id, plmn } = useParams<{
    id: string;
    plmn: string;
  }>();

  const isNewSubscriber = id === undefined && plmn === undefined;
  const navigation = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<string[]>([]);
  const [selectedProfile, setSelectedProfile] = useState("");

  // FIX: track batch creation progress
  const [createProgress, setCreateProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  // FIX: accumulate per-subscriber errors to show summary at the end
  const [createErrors, setCreateErrors] = useState<string[]>([]);

  const { handleSubmit, getValues, reset } = useSubscriptionForm();

  useEffect(() => {
    axios
      .get("/api/profile")
      .then((res) => {
        setProfiles(res.data);
      })
      .catch((e) => {
        console.log(e.message);
      });
  }, []);

  if (!isNewSubscriber) {
    useEffect(() => {
      setLoading(true);

      axios
        .get("/api/subscriber/" + id + "/" + plmn)
        .then((res) => {
          const subscriberMapper = new SubscriptionMapperImpl(new SubscriptionFlowsMapperImpl());
          const subscription = subscriberMapper.mapFromSubscription(res.data);
          reset(subscription);
        })
        .finally(() => {
          setLoading(false);
        });
    }, [id]);
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  const supiIncrement = (supi: string): string => {
    const imsi = supi.split("-", 2);
    if (imsi.length !== 2) {
      return supi;
    }
    let number = Number(imsi[1]);
    number += 1;
    return "imsi-" + number;
  };

  // FIX: async onCreate with batched requests and progress tracking.
  //
  // Root cause of Issue #158:
  //   The original loop fired ALL axios.post() calls synchronously without
  //   awaiting, creating thousands of concurrent requests. This overwhelmed
  //   the browser networking stack and the backend, causing a "Network Error".
  //   Additionally, navigation("/subscriber") was called inside every .then(),
  //   so the component unmounted after the first success while hundreds/thousands
  //   of in-flight requests continued updating dead state.
  //
  // Fix:
  //   1. Process requests in controlled batches of BATCH_SIZE using Promise.allSettled.
  //   2. Navigate exactly once after all batches complete.
  //   3. Track and display progress so the user knows the operation is running.
  //   4. Collect per-request errors and show a summary instead of spamming alerts.
  const onCreate = async () => {
    console.log("trace: onCreate");

    const data = getValues();

    if (data.SnssaiConfigurations.length === 0) {
      alert("Please add at least one S-NSSAI");
      return;
    }

    const subscriberMapper = new SubscriptionMapperImpl(new SubscriptionFlowsMapperImpl());
    const subscription = subscriberMapper.mapFromDto(data);

    const validation = validateSubscription(subscription);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    const total = subscription.userNumber!;
    setCreateErrors([]);
    setCreateProgress({ current: 0, total });
    // NOTE: do NOT set setLoading(true) here — loading is only for edit mode
    // (fetching existing subscriber). Setting it here causes the component to
    // return <div>Loading...</div> which hides the form and progress bar.

    // Build the full list of (supi, payload) pairs upfront so the loop body
    // is free of mutation side effects.
    const tasks: Array<{ supi: string; payload: typeof subscription }> = [];
    let supi = subscription.ueId;
    for (let i = 0; i < total; i++) {
      tasks.push({ supi, payload: { ...subscription, ueId: supi } });
      supi = supiIncrement(supi);
    }

    const errors: string[] = [];
    let completed = 0;

    // Process in batches to cap concurrency.
    for (let batchStart = 0; batchStart < tasks.length; batchStart += BATCH_SIZE) {
      const batch = tasks.slice(batchStart, batchStart + BATCH_SIZE);

      const results = await Promise.allSettled(
        batch.map(({ supi: taskSupi, payload }) =>
          axios.post(
            "/api/subscriber/" + taskSupi + "/" + payload.plmnID,
            payload
          )
        )
      );

      results.forEach((result, idx) => {
        completed += 1;
        if (result.status === "rejected") {
          const err = result.reason;
          const taskSupi = batch[idx].supi;
          if (err.response) {
            const msg = `${taskSupi} — HTTP ${err.response.status}${
              err.response.data?.cause ? ": " + err.response.data.cause : ""
            }`;
            errors.push(msg);
          } else {
            errors.push(`${taskSupi} — ${err.message}`);
          }
        }
      });

      setCreateProgress({ current: completed, total });
    }

    setCreateProgress(null);

    if (errors.length > 0) {
      setCreateErrors(errors);
      // Don't navigate — let the user see which subscribers failed.
    } else {
      navigation("/subscriber");
    }
  };

  const onUpdate = () => {
    console.log("trace: onUpdate");

    const data = getValues();
    const subscriberMapper = new SubscriptionMapperImpl(new SubscriptionFlowsMapperImpl());
    const subscription = subscriberMapper.mapFromDto(data);

    const validation = validateSubscription(subscription);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    axios
      .put(
        "/api/subscriber/" + subscription.ueId + "/" + subscription.plmnID,
        subscription
      )
      .then(() => {
        navigation(
          "/subscriber/" + subscription.ueId + "/" + subscription.plmnID
        );
      })
      .catch((err) => {
        if (err.response) {
          const msg = "Status: " + err.response.status;
          if (err.response.data.cause) {
            alert(msg + ", cause: " + err.response.data.cause);
          } else if (err.response.data) {
            alert(msg + ", data:" + err.response.data);
          } else {
            alert(msg);
          }
        } else {
          alert(err.message);
        }
      });
  };

  const formSubmitFn = isNewSubscriber ? onCreate : onUpdate;
  const formSubmitText = isNewSubscriber ? "CREATE" : "UPDATE";
  const isCreating = createProgress !== null;
  const progressPercent = isCreating
    ? Math.round((createProgress.current / createProgress.total) * 100)
    : 0;

  const handleProfileChange = (event: any) => {
    const profileName = event.target.value;
    setSelectedProfile(profileName);

    if (profileName) {
      setLoading(true);
      axios
        .get("/api/profile/" + profileName)
        .then((res) => {
          const profileMapper = new ProfileMapperImpl(new ProfileFlowsMapperImpl());
          const profile = profileMapper.mapFromProfile(res.data);

          const currentValues = getValues();
          const basicInfo = {
            userNumber: currentValues.userNumber,
            ueId: currentValues.ueId,
            plmnID: currentValues.plmnID,
            gpsi: currentValues.gpsi,
            auth: {
              authenticationManagementField:
                currentValues.auth?.authenticationManagementField,
              authenticationMethod: currentValues.auth?.authenticationMethod,
              operatorCodeType: currentValues.auth?.operatorCodeType,
              operatorCode: currentValues.auth?.operatorCode,
              sequenceNumber: currentValues.auth?.sequenceNumber,
              permanentKey: currentValues.auth?.permanentKey,
            },
          };

          reset({
            ...basicInfo,
            ...profile,
          });
        })
        .catch((e) => {
          console.log(e.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return (
    <Dashboard title="Subscription" refreshAction={() => {}}>
      <form
        onSubmit={handleSubmit(formSubmitFn, (err) => {
          console.log("form error: ", err);
        })}
      >
        {profiles.length > 0 && (
          <Grid item xs={12} sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel id="profile-select-label">Select Profile</InputLabel>
              <Select
                labelId="profile-select-label"
                id="profile-select"
                value={selectedProfile}
                label="Select Profile"
                onChange={handleProfileChange}
              >
                {profiles.map((profile) => (
                  <MenuItem key={profile} value={profile}>
                    {profile}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        <SubscriberFormBasic />

        <h3>Subscribed UE AMBR</h3>
        <SubscriberFormUeAmbr />

        <SubscriberFormSessions />

        <br />

        {/* FIX: progress bar shown during batch creation */}
        {isCreating && (
          <Grid item xs={12} sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Creating subscribers: {createProgress.current} / {createProgress.total}
            </Typography>
            <LinearProgress variant="determinate" value={progressPercent} />
          </Grid>
        )}

        {/* FIX: error summary shown after partial/full failure */}
        {createErrors.length > 0 && (
          <Grid item xs={12} sx={{ mb: 2 }}>
            <Alert severity="error">
              <strong>
                {createErrors.length} subscriber(s) failed to create:
              </strong>
              <ul style={{ margin: "4px 0 0 0", paddingLeft: "1.2em" }}>
                {createErrors.slice(0, 20).map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
                {createErrors.length > 20 && (
                  <li>...and {createErrors.length - 20} more</li>
                )}
              </ul>
            </Alert>
          </Grid>
        )}

        <Grid item xs={12}>
          <Button
            color="primary"
            variant="contained"
            type="submit"
            disabled={isCreating}
            sx={{ m: 1 }}
          >
            {isCreating
              ? `Creating… ${progressPercent}%`
              : formSubmitText}
          </Button>
        </Grid>
      </form>
    </Dashboard>
  );
}
