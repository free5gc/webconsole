import { store, authActions } from '../_store';

export const fetchWrapper = {
  get: request('GET'),
  post: request('POST'),
  put: request('PUT'),
  delete: request('DELETE')
};


// see https://javascript.info/fetch-crossorigin
// for an introduction to CORS
function request(method) {
  return (url, body) => {
    // fake login activated for '/login', see src/index.js

    const requestOptions = {
      method,
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      }
    };

    console.log(method, url, body);

    makeAuthHeader(requestOptions.headers, url);

    if (body) {
      requestOptions.headers['Content-Type'] = 'application/json';
      requestOptions.body = JSON.stringify(body);
    }

    return fetch(url, requestOptions).then(handleResponse);
  }
}

// helper functions

function makeAuthHeader(headers, url) {
  // return auth header with jwt if user is logged in and request is to the api url
  const token = authToken();
  console.log('auth header token string ', token);
  const isLoggedIn = !!token;
  //const isApiUrl = url.endsWith(process.env.REACT_APP_API_URL) ;
  if (isLoggedIn /*&& isApiUrl*/) {
    headers['Token'] = `${token}`;
    return;
  } else {
    return {};
  }
}

function authToken() {
  return store.getState().auth.token;
}

function handleResponse(response) {
  return response.text().then(text => {
    if (!response.ok && [404].includes(response.status)) {
      return Promise.reject(response.statusText);
    }

    const data = text && JSON.parse(text);

    if (!response.ok) {
      if ([401, 403].includes(response.status) && authToken()) {
        // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
        console.log('401 Unauthorized or 403 Forbidden response returned from api');
        const logout = () => store.dispatch(authActions.logout());
        logout();
      }

      const error = {
        message: data?.cause,
        statusText: response.statusText,
        status: response.status,
      };
      return Promise.reject(error);
    }

    return data;
  });
}
