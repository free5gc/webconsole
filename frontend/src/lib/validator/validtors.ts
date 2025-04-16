import { parseDataRate } from "../utils";

export function validateMBRGreaterThanGBR(QosFlows: any[]): { isValid: boolean; error?: string } {
    for (let i = 0; i < QosFlows.length; i++) {
        const qosFlow = QosFlows[i];
        const gbrDL = parseDataRate(qosFlow.gbrDL);
        const mbrDL = parseDataRate(qosFlow.mbrDL);
        const gbrUL = parseDataRate(qosFlow.gbrUL);
        const mbrUL = parseDataRate(qosFlow.mbrUL);

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