import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

import { history } from './_helpers';
import { Footer, PrivateRoute, SideBar } from './_components';
import { Dashboard } from './dashboard';
import { Login } from './login';
import { Subscribers } from './subscribers';
import { RegisteredUes } from './ues/RegisteredUes';
import { Topology } from './topology/Topology';

export { App };

function App() {
  // init custom history object to allow navigation from 
  // anywhere in the react app (inside or outside components)
  history.navigate = useNavigate();
  history.location = useLocation();

  return (
    <div className="wrapper">
      <SideBar />
      <div className="main-panel">
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/subscribers"
            element={
              <PrivateRoute>
                <Subscribers />
              </PrivateRoute>
            }
          />
          <Route
            path="/ues"
            element={
              <PrivateRoute>
                <RegisteredUes />
              </PrivateRoute>
            }
          />
          <Route
            path="/topology"
            element={
              <PrivateRoute>
                <Topology />
              </PrivateRoute>
            }
          />

          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}
