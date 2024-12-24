export function toHex(v: number | undefined): string {
  return ("00" + v?.toString(16).toUpperCase()).substr(-2);
}

function parseDataRate(rate: string | undefined): number {
    if (!rate) return 0;
    
    const match = rate.match(/^(\d+)\s*(Gbps|Mbps|Kbps|bps)$/i);
    if (!match) return 0;
    
    const [, value, unit] = match;
    const numValue = parseFloat(value);
    
    switch (unit.toLowerCase()) {
        case 'gbps':
            return numValue * 1000000;
        case 'mbps':
            return numValue * 1000;
        case 'kbps':
            return numValue;
        case 'bps':
            return numValue / 1000;
        default:
            return 0;
    }
}

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
                error: `In S-NSSAI ${qosFlow.snssai}'s Flow Rule ${i+1}\nDownlink MBR must be greater than Downlink GBR`
            };
        }

        if (gbrUL && mbrUL && gbrUL >= mbrUL) {
            return {
                isValid: false,
                error: `In S-NSSAI ${qosFlow.snssai}'s Flow Rule ${i+1}\nUplink MBR must be greater than Uplink GBR`
            };
        }
    }
    
    return { isValid: true };
}