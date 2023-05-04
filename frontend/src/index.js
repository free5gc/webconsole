import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {HashRouter} from 'react-router-dom';

import App from './pages/App';
import configureStore from './config/configureStore';
import registerServiceWorker from './registerServiceWorker';

// dependency CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import './assets/styles/base.scss';


export const store = configureStore();
const rootElement = document.getElementById('root');

const renderApp = Component => {
  ReactDOM.render(
    <Provider store={store}>
      <HashRouter>
        <Component />
      </HashRouter>
    </Provider>,
    rootElement
  );
};

renderApp(App);

if (module.hot) {
  module.hot.accept('./pages/App', () => {
    const NextApp = require('./pages/App').default;
    renderApp(NextApp);
  });
}

registerServiceWorker();
