
export default class tenantActions {
  static SET_TENANTS = 'TENANT/SET_TENANTS';

  static setTenants(tenants) {
    return {
      type: this.SET_TENANTS,
      tenants: tenants,
    };
  }
}
