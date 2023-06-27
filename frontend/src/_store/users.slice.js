import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { fetchWrapper } from '../_helpers';

// create slice

const name = 'users';
const initialState = createInitialState();
const extraActions = createExtraActions();
const extraReducers = createExtraReducers();
const slice = createSlice({ name, initialState, extraReducers });

// exports

export const userActions = { ...slice.actions, ...extraActions };
export const usersReducer = slice.reducer;

// implementation

function createInitialState() {
  return {
    users: {}
  }
}

function createExtraActions() {
  const baseUrl = `${process.env.REACT_APP_API_URL_TEST}/users`;

  return {
    getAll: getAll()
  };

  function getAll() {
    return createAsyncThunk(
      `${name}/getAll`,
      async () => await fetchWrapper.get(baseUrl)
    );
  }
}

function createExtraReducers() {
  return (builder) => {
    getAll();

    function getAll() {
      let { pending, fulfilled, rejected } = extraActions.getAll;
      builder
        .addCase(pending, (state) => {
          //state.users = { loading: true };
        })
        .addCase(fulfilled, (state, action) => {
          state.users = action.payload;
        })
        .addCase(rejected, (state, action) => {
          state.users = { error: action.error };
        });
    }
  };
}
