import React from 'react';
import {Route} from 'react-router-dom';
import TenantOverview from "./TenantOverview";

const Tenants = ({match}) => (
  <div className="content">
    <Route exact path={`${match.url}/`} component={TenantOverview} />
  </div>
);

export default Tenants;
