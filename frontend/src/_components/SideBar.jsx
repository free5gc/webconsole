import { useSelector, useDispatch } from 'react-redux';
import Free5gcLogo from '../_assets/images/free5gc_logo.png';
import Nav from 'react-bootstrap/Nav';
import { NavLink, useLocation } from 'react-router-dom';

import { authActions } from '../_store';

export { SideBar };

function SideBar() {
  const path = useLocation().pathname;
  const authUser = useSelector(x => x.auth.user);
  const dispatch = useDispatch();
  const logout = () => dispatch(authActions.logout());

  // only show nav when logged in
  if (!authUser) return null;

  return (
    <div className="sidebar">
      <div className="brand">
        <a href="https://free5gc.org" className="brand-name">
          <img src={Free5gcLogo} alt="logo" className="logo" />
        </a>
      </div>

      <div style={{ marginLeft: '20px' }}>
        © 2023 <a href="https://free5gc.org">free5GC dev team</a>
      </div>

      <div className="sidebar-wrapper">
        <Nav defaultActiveKey="/" className="nav flex-column">
          <div className={path === '/' ? "active" : null}>
            <Nav.Link
              as={NavLink}
              to="/">
              <i className="pe-7s-network" />
              <p>Dashboard</p>
            </Nav.Link>
          </div>

          <div className={path === '/subscribers' ? "active" : null}>
            <Nav.Link as={NavLink} to="/subscribers">
              <i className="pe-7s-server" />
              <p>Subscribers</p>
            </Nav.Link>
          </div>

          <div className={path === '/ues' ? "active" : null}>
            <Nav.Link as={NavLink} to="/ues">
              <i className="pe-7s-phone" />
              <p>Registered UEs</p>
            </Nav.Link>
          </div>

          {/* fyi: this is non-functional and will redirect to /dashboard until changed */}

          <div className={path === '/analytics' ? "active" : null}>
            <Nav.Link as={NavLink} to="/analytics">
              <i className="pe-7s-graph1" />
              <p>Analytics</p>
            </Nav.Link>
          </div>

          <div className={path === '/tenants' ? "active" : null}>
            <Nav.Link as={NavLink} to="/tenants">
              <i className="pe-7s-users" />
              <p>Tenants and Users </p>
            </Nav.Link>
          </div>

          <div>
            <Nav.Link style={{ marginTop: '20px', border: '1px solid', borderColor: '#grey' }} onClick={logout}>
              <i className="pe-7s-close-circle" />
              <p>Logout</p>
            </Nav.Link>
          </div>
        </Nav>
      </div>
    </div>
  )
}
