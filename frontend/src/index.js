import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import './_assets/styles/base.scss';

import { store } from './_store';
import { App } from './App';

// setup fake backend (e.g., you can use it for testing new features)
import { fakeBackend } from './_helpers';
fakeBackend();

const container = document.getElementById('root');
const root = createRoot(container);

// useful hint: if you see the dispatch executed twice while using the dev server: StrictMode is the reason

/*root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);*/

root.render(
    <Provider store={store}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Provider>
);
