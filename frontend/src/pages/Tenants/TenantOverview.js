import React, { Component } from 'react';
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Button, Table } from "react-bootstrap";
import TenantModal from "./components/TenantModal";
import ApiHelper from "../../util/ApiHelper";

class TenantOverview extends Component {
  state = {
    tenantModalOpen: false,
    tenantModalData: null,
  };

  componentDidMount() {
    ApiHelper.fetchTenants().then();
  }

  openAddTenant() {
    this.setState({
      tenantModalOpen: true,
      tenantModalData: null,
    });
  }

  /**
   * @param tenantId  {string}
   */
  async openEditTenant(tenantId) {
    const tenant = await ApiHelper.fetchTenantById(tenantId);

    this.setState({
      tenantModalOpen: true,
      tenantModalData: tenant,
    });
  }

  async addTenant(tenantData) {
    this.setState({ tenantModalOpen: false });

    if (!await ApiHelper.createTenant(tenantData)) {
      alert("Error creating new tenant");
    }
    ApiHelper.fetchTenants().then();
  }

  /**
   * @param tenantData
   */
  async updateTenant(tenantData) {
    this.setState({ tenantModalOpen: false });

    const result = await ApiHelper.updateTenant(tenantData);

    if (!result) {
      alert("Error updating tenant: " + tenantData["ueId"]);
    }
    ApiHelper.fetchTenants().then();
  }

  /**
  * @param tenant  {Tenant}
   */
  async deleteTenant(tenant) {
    if (!window.confirm(`Delete tenant ${tenant.id}?`))
      return;

    const result = await ApiHelper.deleteTenant(tenant.id);
    ApiHelper.fetchTenants().then();
    if (!result) {
      alert("Error deleting tenant: " + tenant.id);
    }
  }

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="header subscribers__header">
                <h4>Tenants</h4>
                <Button bsStyle={"primary"} className="subscribers__button"
                  onClick={this.openAddTenant.bind(this)}>
                  New Tenant
                </Button>
              </div>
              <div className="content subscribers__content">
                <Table className="subscribers__table" striped bordered condensed hover>
                  <thead>
                    <tr>
                      <th style={{ width: 400 }}>Tenant ID</th>
                      <th colSpan={2}>Tenant Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.props.tenants.map(tenant => (
                      <tr key={tenant.id}>
                        <td>{tenant.id}</td>
                        <td><font color="blue"><u><Link to={"/users/"+tenant.id}>{tenant.name}</Link></u></font></td>
                        <td style={{ textAlign: 'center' }}>
                          <Button variant="danger" onClick={this.deleteTenant.bind(this, tenant)}>Delete</Button>
                         &nbsp;&nbsp;&nbsp;&nbsp;
                        <Button variant="info" onClick={this.openEditTenant.bind(this, tenant.id)}>Modify</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <p>&nbsp;</p><p>&nbsp;</p>
                <p>&nbsp;</p><p>&nbsp;</p>
                <p>&nbsp;</p><p>&nbsp;</p>
              </div>
            </div>
          </div>
        </div>

        <TenantModal open={this.state.tenantModalOpen}
          setOpen={val => this.setState({ tenantModalOpen: val })}
          tenant={this.state.tenantModalData}
          onModify={this.updateTenant.bind(this)}
          onSubmit={this.addTenant.bind(this)} />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  tenants: state.tenant.tenants,
});

export default withRouter(connect(mapStateToProps)(TenantOverview));
