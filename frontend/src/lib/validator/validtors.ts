import { parseDataRate } from "../utils";

export function validateMBRGreaterThanGBR(QosFlows: any[]): { isValid: boolean; error?: string } {
    for (let i = 0; i < QosFlows.length; i++) {
        const qosFlow = QosFlows[i];
        const gbrDL = parseDataRate(qosFlow.gbrDL);
        if (gbrDL === -1) {
            return {
                isValid: false,
                error: `In S-NSSAI ${qosFlow.snssai}'s Flow Rule\nDownlink GBR is invalid`
            };
        }
        const mbrDL = parseDataRate(qosFlow.mbrDL);
        if (mbrDL === -1) {
            return {
                isValid: false,
                error: `In S-NSSAI ${qosFlow.snssai}'s Flow Rule\nDownlink MBR is invalid`
            };
        }
        const gbrUL = parseDataRate(qosFlow.gbrUL);
        if (gbrUL === -1) {
            return {
                isValid: false,
                error: `In S-NSSAI ${qosFlow.snssai}'s Flow Rule\nUplink GBR is invalid`
            };
        }
        const mbrUL = parseDataRate(qosFlow.mbrUL);
        if (mbrUL === -1) {
            return {
                isValid: false,
                error: `In S-NSSAI ${qosFlow.snssai}'s Flow Rule\nUplink MBR is invalid`
            };
        }

        if (gbrDL && mbrDL && gbrDL >= mbrDL) {
            return {
                isValid: false,
                error: `In S-NSSAI ${qosFlow.snssai}'s Flow Rule\nDownlink MBR must be greater than Downlink GBR`
            };
        }

        if (gbrUL && mbrUL && gbrUL >= mbrUL) {
            return {
                isValid: false,
                error: `In S-NSSAI ${qosFlow.snssai}'s Flow Rule\nUplink MBR must be greater than Uplink GBR`
            };
        }
    }
    
    return { isValid: true };
}