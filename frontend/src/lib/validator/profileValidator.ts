import { Profile } from "../../api";
import { validateMBRGreaterThanGBR } from "./validtors";
export function validateProfile(profile: Profile): { isValid: boolean; error?: string } {
    var validation: { isValid: boolean; error?: string } = { isValid: true };

    validation = validateMBRGreaterThanGBR(profile.QosFlows);
    if (!validation.isValid) {
        validation.isValid = false;
        validation.error = validation.error;
        return validation;
    }

    return validation;
}