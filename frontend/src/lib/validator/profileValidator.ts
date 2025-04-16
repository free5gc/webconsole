import { Profile } from "../../api";
import { validateDNNAMBR, validateMBRGreaterThanGBR } from "./validtors";

export function validateProfile(profile: Profile): { isValid: boolean; error?: string } {
    var validation: { isValid: boolean; error?: string } = { isValid: true };

    validation = validateDNNAMBR(profile.SessionManagementSubscriptionData);
    if (!validation.isValid) {
        validation.isValid = false;
        validation.error = validation.error;
        return validation;
    }

    validation = validateMBRGreaterThanGBR(profile.QosFlows);
    if (!validation.isValid) {
        validation.isValid = false;
        validation.error = validation.error;
        return validation;
    }

    return validation;
}