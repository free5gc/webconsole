import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { history, fetchWrapper } from '../_helpers';

// create slice

const name = 'auth';
const initialState = createInitialState();
const reducers = createReducers();
const extraActions = createExtraActions();
const extraReducers = createExtraReducers();
const slice = createSlice({ name, initialState, reducers, extraReducers });

// exports

export const authActions = { ...slice.actions, ...extraActions };
export const authReducer = slice.reducer;

// implementation

function createInitialState() {
  return {
    // initialize state from local storage to enable user to stay logged in
    user: JSON.parse(localStorage.getItem('user')),
    error: null
  }
}

// see e.g. https://stackoverflow.com/questions/66425645/what-is-difference-between-reducers-and-extrareducers-in-redux-toolkit
function createReducers() {
  return {
    logout
  };

  function logout(state) {
    state.user = null;
    localStorage.removeItem('user');
    history.navigate('/login');
  }
}

function createExtraActions() {
  const baseUrl = `${process.env.REACT_APP_API_URL}`;

  return {
    login: login()
  };

  function login() {
    return createAsyncThunk(
      `${name}/login`,
      //TODO note: api call not working correctly in backend, fake-backend used for /login
      async ({ username, password }) => await fetchWrapper.post(`${baseUrl}/login`, { username, password })
    );
  }
}

function createExtraReducers() {
  return (builder) => {
    login();

    function login() {
      // handle pending state from async thunk in "login"
      let { pending, fulfilled, rejected } = extraActions.login;
      builder
        .addCase(pending, (state) => {
          state.error = null;
        })
        .addCase(fulfilled, (state, action) => {
          const user = action.payload;

          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('user', JSON.stringify(user));
          state.user = user;

          // get return url from location state or default to home page
          const { from } = history.location.state || { from: { pathname: '/' } };
          history.navigate(from);
        })
        .addCase(rejected, (state, action) => {
          state.error = action.error;
        });
    }
  };
}
