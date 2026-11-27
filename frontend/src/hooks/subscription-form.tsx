import { ReactNode } from "react";
import { FormProvider, useForm, useFormContext, type FieldError, type Resolver, type UseFormProps } from "react-hook-form";
import { toNestErrors } from "@hookform/resolvers";
import { defaultSubscriptionDTO, subscriptionDTOSchema, type SubscriptionDTO } from "../lib/dtos/subscription";

export const resolveSubscriberForm: Resolver<SubscriptionDTO> = (values, _context, options) => {
  const result = subscriptionDTOSchema.safeParse(values);
  if (result.success) {
    return { values: result.data, errors: {} };
  }
  const errors: Record<string, FieldError> = {};
  for (const issue of result.error.issues) {
    errors[issue.path.join(".")] ??= { type: issue.code, message: issue.message };
  }
  return { values: {}, errors: toNestErrors(errors, options) };
};

const SubscriberFormOptions = {
  mode: "onBlur",
  reValidateMode: "onChange",
  resolver: resolveSubscriberForm,
  defaultValues: defaultSubscriptionDTO(),
} satisfies UseFormProps<SubscriptionDTO>;

export const SubscriberFormProvider = ({ children }: { children: ReactNode }) => {
  const method = useForm<SubscriptionDTO>(SubscriberFormOptions);
  return <FormProvider {...method}>{children}</FormProvider>;
};

export const useSubscriptionForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    setFocus,
    reset,
    control,
    formState: { errors: validationErrors },
  } = useFormContext<SubscriptionDTO>();

  return {
    register,
    validationErrors,
    handleSubmit,
    watch,
    getValues,
    control,
    setValue,
    setFocus,
    reset,
  };
};
