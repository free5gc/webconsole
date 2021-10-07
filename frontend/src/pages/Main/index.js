import React from 'react';
import {Route, withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import cx from 'classnames';
import {setMobileNavVisibility} from '../../redux/reducers/layout';

import Header from './Header';
import Footer from './Footer';
import SideBar from '../../components/SideBar';
/**
 * Pages
 */
import Subscribers from '../Subscribers';
import Tasks from '../Tasks';
import UEInfo from '../Dashboard';
import UEInfoDetail from '../UEInfoDetail';
import Tenants from '../Tenants';
import Users from '../Users';

const Main = ({
                mobileNavVisibility,
                hideMobileMenu,
                isLoggedIn,
                history
              }) => {
  if (!isLoggedIn) {
    return null;
  }

  history.listen(() => {
    if (mobileNavVisibility === true) {
      hideMobileMenu();
    }
  });

  return (
    <div className={cx({
      'nav-open': mobileNavVisibility === true
    })}>
      <div className="wrapper">
        <div className="close-layer" onClick={hideMobileMenu}/>
        <SideBar/>

        <div className="main-panel">
          <Header/>

          <Route exact path="/" component={UEInfo}/>
          <Route exact path="/subscriber" component={Subscribers}/>
          <Route exact path="/tasks" component={Tasks}/>
          <Route exact path="/ueinfo" component={UEInfo}/>
          <Route exact path="/ueinfo/:id" component={UEInfoDetail}/>
          <Route exact path="/tenants" component={Tenants}/>
          <Route exact path="/users/:id" component={Users}/>

          <Footer/>
        </div>
      </div>
    </div>
  )
};

const mapStateToProp = state => ({
  mobileNavVisibility: state.layout.mobileNavVisibility
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  hideMobileMenu: () => dispatch(setMobileNavVisibility(false))
});

export default withRouter(connect(mapStateToProp, mapDispatchToProps)(Main));
