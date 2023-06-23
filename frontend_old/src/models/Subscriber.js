
export default class Subscriber {
  id = '';
  plmn = '';
  msisdn = '';

  constructor(id, plmn, msisdn) {
    this.id = id;
    this.plmn = plmn;
    this.msisdn = msisdn;
  };
}
