import React from 'react';
import {Route} from 'react-router-dom';
import UserOverview from "./UserOverview";

const Users = ({match}) => (
  <div className="content">
    <Route exact path={`${match.url}/`} component={UserOverview} />
  </div>
);

export default Users;
