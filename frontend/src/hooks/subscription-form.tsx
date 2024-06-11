import { ReactNode, useState } from "react";
import { Nssai, Subscription } from "../api";
import {
  FormProvider,
  UseFormProps,
  useFieldArray,
  useForm,
  useFormContext,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subscriptionSchema } from "../lib/schemas/subscription";

const defaultSubscription: Subscription = {
  userNumber: 1,
  plmnID: "20893",
  ueId: "imsi-208930000000001",
  AuthenticationSubscription: {
    authenticationMethod: "5G_AKA",
    sequenceNumber: "000000000023",
    authenticationManagementField: "8000",
    permanentKey: {
      permanentKeyValue: "8baf473f2f8fd09487cccbd7097c6862",
      encryptionKey: 0,
      encryptionAlgorithm: 0,
    },
    milenage: {
      op: {
        opValue: "",
        encryptionKey: 0,
        encryptionAlgorithm: 0,
      },
    },
    opc: {
      opcValue: "8e27b6af0e692e750f32667a3b14605d",
      encryptionKey: 0,
      encryptionAlgorithm: 0,
    },
  },
  AccessAndMobilitySubscriptionData: {
    gpsis: ["msisdn-"],
    subscribedUeAmbr: {
      uplink: "1 Gbps",
      downlink: "2 Gbps",
    },
    nssai: {
      defaultSingleNssais: [
        {
          sst: 1,
          sd: "010203",
        },
      ],
      singleNssais: [
        {
          sst: 1,
          sd: "112233",
        },
      ],
    },
  },
  SessionManagementSubscriptionData: [
    {
      singleNssai: {
        sst: 1,
        sd: "010203",
      },
      dnnConfigurations: {
        internet: {
          pduSessionTypes: {
            defaultSessionType: "IPV4",
            allowedSessionTypes: ["IPV4"],
          },
          sscModes: {
            defaultSscMode: "SSC_MODE_1",
            allowedSscModes: ["SSC_MODE_2", "SSC_MODE_3"],
          },
          "5gQosProfile": {
            "5qi": 9,
            arp: {
              priorityLevel: 8,
              preemptCap: "",
              preemptVuln: "",
            },
            priorityLevel: 8,
          },
          sessionAmbr: {
            uplink: "1000 Mbps",
            downlink: "1000 Mbps",
          },
          staticIpAddress: [],
        },
      },
    },
    {
      singleNssai: {
        sst: 1,
        sd: "112233",
      },
      dnnConfigurations: {
        internet: {
          pduSessionTypes: {
            defaultSessionType: "IPV4",
            allowedSessionTypes: ["IPV4"],
          },
          sscModes: {
            defaultSscMode: "SSC_MODE_1",
            allowedSscModes: ["SSC_MODE_2", "SSC_MODE_3"],
          },
          "5gQosProfile": {
            "5qi": 8,
            arp: {
              priorityLevel: 8,
              preemptCap: "",
              preemptVuln: "",
            },
            priorityLevel: 8,
          },
          sessionAmbr: {
            uplink: "1000 Mbps",
            downlink: "1000 Mbps",
          },
          staticIpAddress: [],
        },
      },
    },
  ],
  SmfSelectionSubscriptionData: {
    subscribedSnssaiInfos: {
      "01010203": {
        dnnInfos: [
          {
            dnn: "internet",
          },
        ],
      },
      "01112233": {
        dnnInfos: [
          {
            dnn: "internet",
          },
        ],
      },
    },
  },
  AmPolicyData: {
    subscCats: ["free5gc"],
  },
  SmPolicyData: {
    smPolicySnssaiData: {
      "01010203": {
        snssai: {
          sst: 1,
          sd: "010203",
        },
        smPolicyDnnData: {
          internet: {
            dnn: "internet",
          },
        },
      },
      "01112233": {
        snssai: {
          sst: 1,
          sd: "112233",
        },
        smPolicyDnnData: {
          internet: {
            dnn: "internet",
          },
        },
      },
    },
  },
  FlowRules: [
    {
      filter: "1.1.1.1/32",
      precedence: 128,
      snssai: "01010203",
      dnn: "internet",
      qosRef: 1,
    },
    {
      filter: "1.1.1.1/32",
      precedence: 127,
      snssai: "01112233",
      dnn: "internet",
      qosRef: 2,
    },
  ],
  QosFlows: [
    {
      snssai: "01010203",
      dnn: "internet",
      qosRef: 1,
      "5qi": 8,
      mbrUL: "208 Mbps",
      mbrDL: "208 Mbps",
      gbrUL: "108 Mbps",
      gbrDL: "108 Mbps",
    },
    {
      snssai: "01112233",
      dnn: "internet",
      qosRef: 2,
      "5qi": 7,
      mbrUL: "407 Mbps",
      mbrDL: "407 Mbps",
      gbrUL: "207 Mbps",
      gbrDL: "207 Mbps",
    },
  ],
  ChargingDatas: [
    {
      snssai: "01010203",
      dnn: "",
      filter: "",
      chargingMethod: "Offline",
      quota: "100000",
      unitCost: "1",
    },
    {
      snssai: "01010203",
      dnn: "internet",
      qosRef: 1,
      filter: "1.1.1.1/32",
      chargingMethod: "Offline",
      quota: "100000",
      unitCost: "1",
    },
    {
      snssai: "01112233",
      dnn: "",
      filter: "",
      chargingMethod: "Online",
      quota: "100000",
      unitCost: "1",
    },
    {
      snssai: "01112233",
      dnn: "internet",
      qosRef: 2,
      filter: "1.1.1.1/32",
      chargingMethod: "Online",
      quota: "5000",
      unitCost: "1",
    },
  ],
};

const SubscriberFormOptions = {
  mode: "onBlur",
  reValidateMode: "onChange",
  resolver: zodResolver(subscriptionSchema),
  defaultValues: defaultSubscription,
} satisfies UseFormProps<Subscription>;

export const SubscriberFormProvider = ({ children }: { children: ReactNode }) => {
  const method = useForm<Subscription>(SubscriberFormOptions);
  return <FormProvider {...method}>{children}</FormProvider>;
};

export const useSubscriptionForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    reset,
    control,
    formState: { errors: validationErrors },
  } = useFormContext<Subscription>();

  const defaultSingleNssais = watch("AccessAndMobilitySubscriptionData.nssai.defaultSingleNssais");
  const addDefaultSingleNssai = (nssai: Nssai) => {
    setValue("AccessAndMobilitySubscriptionData.nssai.defaultSingleNssais", [
      ...defaultSingleNssais,
      nssai,
    ]);
  };
  const removeDefaultSingleNssai = (nssai: Nssai) => {
    setValue(
      "AccessAndMobilitySubscriptionData.nssai.defaultSingleNssais",
      defaultSingleNssais.filter((n) => n.sd !== nssai.sd || n.sst !== nssai.sst),
    );
  };

  const sessionSubscriptionFields = useFieldArray({
    control,
    name: "SessionManagementSubscriptionData",
  });

  const [opcType, setOpcType] = useState<string>("OPc");
  const [opcValue, setOpcValue] = useState<string>("8e27b6af0e692e750f32667a3b14605d");
  const [dnnName, setDnnName] = useState<string[]>([]);

  return {
    register,
    validationErrors,
    handleSubmit,
    watch,
    control,
    getValues,
    setValue,
    reset,
    sessionSubscriptionFields,
    defaultSingleNssais,
    addDefaultSingleNssai,
    removeDefaultSingleNssai,
    opcType,
    setOpcType,
    opcValue,
    setOpcValue,
    dnnName,
    setDnnName,
  };
};
