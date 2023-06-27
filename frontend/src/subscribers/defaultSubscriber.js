let defaultSubscriber = {
  supi: '001010000000001',
  plmnId: '00101',
  mcc: '001',
  mnc: '01',
  msin: 1,
  msisdn: '01013',

  authMethod: '5G_AKA',
  key: '00112233445566778899AABBCCDDEEFE',
  amf: '8000',
  sqn: '0',
  opCode: '000102030405060708090A0B0C0D0E0F',
  opCodeType: 'OP',
  slices: [
    {
      sst: 1,
      sd: '010203',
      isDefault: true,
      dnns: [
        {
          name: 'internet',
          uplinkAmbr: '1 Tbps',
          downlinkAmbr: '1 Tbps',
          default5qi: 2,
          upConfidentiality: 'REQUIRED',
          upIntegrity: 'REQUIRED',
          upSecurity: true,
          flows: [
            {
              filter: '0ab',
              precedence: 120,
              fiveQi: 5,
              gbrUL: '1 Tbps',
              gbrDL: '1 Tbps',
              mbrUL: '1 Tbps',
              mbrDL: '1 Tbps'
            }
          ]
        }
      ],
    },
    {
      sst: 2,
      sd: '112233',
      isDefault: true,
      dnns: [
        {
          name: 'internet2',
          uplinkAmbr: '1 Kbps',
          downlinkAmbr: '1 Kbps',
          default5qi: 10,
          flows: [
            {
              filter: 'hi',
              precedence: 127,
              fiveQi: 11,
              gbrUL: '2 Tbps',
              gbrDL: '2 Tbps',
              mbrUL: '2 Tbps',
              mbrDL: '2 Tbps'
            }
          ]
        }
      ],
    }
  ]
};

export { defaultSubscriber };
