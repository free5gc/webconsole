import React from "react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import axios from "../../axios";
import type { IpAddress, Nssai } from "../../api/api";

import Dashboard from "../../Dashboard";
import { Button, Grid } from "@mui/material";
import { SubscriberFormProvider, useSubscriptionForm } from "../../hooks/subscription-form";
import SubscriberFormBasic from "./SubscriberFormBasic";
import SubscriberFormUeAmbr from "./SubscriberFormUeAmbr";
import { toHex } from "../../lib/utils";
import SubscriberFormSessions from "./SubscriberFormSessions";

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

  const {
    handleSubmit,
    watch,
    getValues,
    reset,
    sessionSubscriptionFields: { append: appendSessionSubscription },
  } = useSubscriptionForm();

  if (!isNewSubscriber) {
    useEffect(() => {
      axios.get("/api/subscriber/" + id + "/" + plmn).then((res) => {
        reset(res.data);
      });
    }, [id]);
  }

  const nssai2KeyString = (nssai: Nssai) => {
    return toHex(nssai.sst) + nssai.sd;
  };

  const supiIncrement = (supi: string): string => {
    const imsi = supi.split("-", 2);
    if (imsi.length !== 2) {
      return supi;
    }
    let number = Number(imsi[1]);
    number += 1;
    return "imsi-" + number;
  };

  const onCreate = () => {
    const data = getValues();

    if (data.SessionManagementSubscriptionData === undefined) {
      alert("Please add at least one S-NSSAI");
      return;
    }
    for (let i = 0; i < data.SessionManagementSubscriptionData!.length; i++) {
      const nssai = data.SessionManagementSubscriptionData![i];
      const key = nssai2KeyString(nssai.singleNssai!);
      Object.keys(nssai.dnnConfigurations!).map((dnn) => {
        if (data.SmfSelectionSubscriptionData!.subscribedSnssaiInfos![key] === undefined) {
          data.SmfSelectionSubscriptionData!.subscribedSnssaiInfos![key] = {
            dnnInfos: [{ dnn: dnn }],
          };
        } else {
          data.SmfSelectionSubscriptionData!.subscribedSnssaiInfos![key].dnnInfos!.push({
            dnn: dnn,
          });
        }
        if (data.SmPolicyData!.smPolicySnssaiData![key] === undefined) {
          data.SmPolicyData!.smPolicySnssaiData![key] = {
            snssai: nssai.singleNssai,
            smPolicyDnnData: {},
          };
        }
        data.SmPolicyData!.smPolicySnssaiData![key].smPolicyDnnData![dnn] = {
          dnn: dnn,
        };
      });
    }
    // Iterate subscriber data number.
    let supi = data.ueId!;
    for (let i = 0; i < data.userNumber!; i++) {
      data.ueId = supi;
      axios
        .post("/api/subscriber/" + data.ueId + "/" + data.plmnID, data)
        .then(() => {
          navigation("/subscriber");
        })
        .catch((err) => {
          if (err.response) {
            if (err.response.data.cause) {
              alert(err.response.data.cause);
            } else {
              alert(err.response.data);
            }
          } else {
            alert(err.message);
          }
          return;
        });
      supi = supiIncrement(supi);
    }
  };

  const onUpdate = () => {
    const data = getValues();

    data.SmfSelectionSubscriptionData = {
      subscribedSnssaiInfos: {},
    };
    data.SmPolicyData = {
      smPolicySnssaiData: {},
    };
    for (let i = 0; i < data.SessionManagementSubscriptionData!.length; i++) {
      const nssai = data.SessionManagementSubscriptionData![i];
      const key = nssai2KeyString(nssai.singleNssai!);
      if (nssai.dnnConfigurations !== undefined) {
        Object.keys(nssai.dnnConfigurations!).map((dnn) => {
          if (data.SmfSelectionSubscriptionData!.subscribedSnssaiInfos![key] === undefined) {
            data.SmfSelectionSubscriptionData!.subscribedSnssaiInfos![key] = {
              dnnInfos: [{ dnn: dnn }],
            };
          } else {
            data.SmfSelectionSubscriptionData!.subscribedSnssaiInfos![key].dnnInfos!.push({
              dnn: dnn,
            });
          }
          if (data.SmPolicyData!.smPolicySnssaiData![key] === undefined) {
            data.SmPolicyData!.smPolicySnssaiData![key] = {
              snssai: nssai.singleNssai,
              smPolicyDnnData: {},
            };
          }
          data.SmPolicyData!.smPolicySnssaiData![key].smPolicyDnnData![dnn] = {
            dnn: dnn,
          };
        });
      }
    }
    axios
      .put("/api/subscriber/" + data.ueId + "/" + data.plmnID, data)
      .then(() => {
        navigation("/subscriber/" + data.ueId + "/" + data.plmnID);
      })
      .catch((err) => {
        if (err.response) {
          if (err.response.data.cause) {
            alert(err.response.data.cause);
          } else {
            alert(err.response.data);
          }
        } else {
          alert(err.message);
        }
      });
  };

  const isDefaultNssai = (nssai: Nssai) => {
    const defaultNssais = watch("AccessAndMobilitySubscriptionData.nssai.defaultSingleNssais");
    return defaultNssais.some((n) => n.sd === nssai.sd && n.sst === nssai.sst);
  };

  const imsiValue = (imsi: string | undefined) => {
    if (imsi === undefined) {
      return "";
    } else {
      return imsi.replace("imsi-", "");
    }
  };

  const formSubmitFn = isNewSubscriber ? onCreate : onUpdate;
  const formSubmitText = isNewSubscriber ? "CREATE" : "UPDATE";

  return (
    <Dashboard title="Subscription" refreshAction={() => {}}>
      <form onSubmit={handleSubmit(formSubmitFn)}>
        <SubscriberFormBasic />

        <h3>Subscribed UE AMBR</h3>
        <SubscriberFormUeAmbr />

        <SubscriberFormSessions />

        <br />
        <Grid item xs={12}>
          <Button
            color="secondary"
            variant="contained"
            onClick={() =>
              appendSessionSubscription({
                singleNssai: {
                  sst: 1,
                },
                dnnConfigurations: {},
              })
            }
            sx={{ m: 1 }}
          >
            +SNSSAI
          </Button>
        </Grid>
        <br />
        <Grid item xs={12}>
          <Button color="primary" variant="contained" type="submit" sx={{ m: 1 }}>
            {formSubmitText}
          </Button>
        </Grid>
      </form>
    </Dashboard>
  );
}
