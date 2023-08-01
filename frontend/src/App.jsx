import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

import { history } from './_helpers';
import { PrivateRoute, SideBar } from './_components';
import { Dashboard } from './dashboard';
import { Login } from './login';
import { Subscribers } from './subscribers';
import { RegisteredUes } from './ues/RegisteredUes';

export { App };

function App() {
  // init custom history object to allow navigation from 
  // anywhere in the react app (inside or outside components)
  history.navigate = useNavigate();
  history.location = useLocation();

  return (
    <div className="wrapper">
      <SideBar />
      <Routes>
        <Route
          path="/"
          element={
            <div className="main-panel">
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            </div>
          }
        />
        <Route
          path="/subscribers"
          element={
            <div className="main-panel">
              <PrivateRoute>
                <Subscribers />
              </PrivateRoute>
            </div>
          }
        />
        <Route
          path="/ues"
          element={
            <div className="main-panel">
              <PrivateRoute>
                <RegisteredUes />
              </PrivateRoute>
            </div>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}
