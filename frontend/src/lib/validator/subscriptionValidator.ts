import { Subscription } from "../../api";
import { validateMBRGreaterThanGBR } from "./validtors";

export function validateSubscription(subscription: Subscription): { isValid: boolean; error?: string } {
    var validation: { isValid: boolean; error?: string } = { isValid: true };

    validation = validateMBRGreaterThanGBR(subscription.QosFlows);
    if (!validation.isValid) {
        validation.isValid = false;
        validation.error = validation.error;
        return validation;
    }

    return validation;
}