import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Button, Table } from "react-bootstrap";
import UserModal from "./components/UserModal";
import ApiHelper from "../../util/ApiHelper";

class UserOverview extends Component {
  state = {
    userModalOpen: false,
    userModalData: null,
  };

  async componentDidMount() {
    //eslint-disable-next-line
    const tenantId = this.props.match.url.replace(/^.*[\\\/]/, '');

    ApiHelper.fetchUsers(tenantId).then();

    const tenant = await ApiHelper.fetchTenantById(tenantId);
    this.setState({
      tenantId: tenantId,
      tenantName: tenant.tenantName,
    });
  }

  openAddUser() {
    this.setState({
      userModalOpen: true,
      userModalData: null,
    });
  }

  /**
   * @param userId  {string}
   */
  async openEditUser(userId) {
    const user = await ApiHelper.fetchUserById(this.state.tenantId, userId);

    this.setState({
      userModalOpen: true,
      userModalData: user,
    });
  }

  async addUser(userData) {
    this.setState({ userModalOpen: false });

    if (!await ApiHelper.createUser(this.state.tenantId, userData)) {
      alert("Error creating new user");
    }
    ApiHelper.fetchUsers(this.state.tenantId).then();
  }

  /**
   * @param userData
   */
  async updateUser(userData) {
    this.setState({ userModalOpen: false });

    const result = await ApiHelper.updateUser(this.state.tenantId, userData.userId, userData);

    if (!result) {
      alert("Error updating user: " + userData["userId"]);
    }
    ApiHelper.fetchUsers(this.state.tenantId).then();
  }

  /**
  * @param user  {User}
   */
  async deleteUser(user) {
    if (!window.confirm(`Delete user ${user.id}?`))
      return;

    const result = await ApiHelper.deleteUser(this.state.tenantId, user.id);
    ApiHelper.fetchUsers(this.state.tenantId).then();
    if (!result) {
      alert("Error deleting user: " + user.id);
    }
  }

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="header subscribers__header">
                <h4>Users ({this.state.tenantName})</h4>
                <Button bsStyle={"primary"} className="subscribers__button"
                  onClick={this.openAddUser.bind(this)}>
                  New User
                </Button>
              </div>
              <div className="content subscribers__content">
                <Table className="subscribers__table" striped bordered condensed hover>
                  <thead>
                    <tr>
                      <th style={{ width: 400 }}>User ID</th>
                      <th colSpan={2}>User Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.props.users.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.email}</td>
                        <td style={{ textAlign: 'center' }}>
                          <Button variant="danger" onClick={this.deleteUser.bind(this, user)}>Delete</Button>
                         &nbsp;&nbsp;&nbsp;&nbsp;
                        <Button variant="info" onClick={this.openEditUser.bind(this, user.id)}>Modify</Button>
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

        <UserModal open={this.state.userModalOpen}
          setOpen={val => this.setState({ userModalOpen: val })}
          user={this.state.userModalData}
          onModify={this.updateUser.bind(this)}
          onSubmit={this.addUser.bind(this)} />
      </div>
    );
  }
}

const mapStateToProps = state => ({
   users: state.user.users,
});

export default withRouter(connect(mapStateToProps)(UserOverview));
