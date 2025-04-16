import { Subscription } from "../../api";
import { validateDNNAMBR, validateMBRGreaterThanGBR, validateSUPIPrefixSameToPLMN } from "./validtors";

export function validateSubscription(subscription: Subscription): { isValid: boolean; error?: string } {
    var validation: { isValid: boolean; error?: string } = { isValid: true };

    validation = validateSUPIPrefixSameToPLMN(subscription);
    if (!validation.isValid) {
        validation.isValid = false;
        validation.error = validation.error;
        return validation;
    }

    validation = validateDNNAMBR(subscription.SessionManagementSubscriptionData);
    if (!validation.isValid) {
        validation.isValid = false;
        validation.error = validation.error;
        return validation;
    }

    validation = validateMBRGreaterThanGBR(subscription.QosFlows);
    if (!validation.isValid) {
        validation.isValid = false;
        validation.error = validation.error;
        return validation;
    }

    return validation;
}