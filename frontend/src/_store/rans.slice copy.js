import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { fetchWrapper } from '../_helpers';

// create slice
const name = 'rans';
const initialState = createInitialState();
const extraActions = createExtraActions();
const extraReducers = createExtraReducers();
const slice = createSlice({ name, initialState, extraReducers });

// exports
export const ransActions = { ...slice.actions, ...extraActions };
export const ransReducer = slice.reducer;

// implementation
function createInitialState() {
  return {
    refreshInterval: 0,
    rans: {},
    error: null
  }
}

// couple API calls with state directly
function createExtraActions() {
  const baseUrl = `${process.env.REACT_APP_API_URL}/connected-rans`;

  return {
    getConnectedRans: getConnectedRans()
  };

  function getConnectedRans() {
    console.log('get connected rans called');
    return createAsyncThunk(
      `${name}/getConnectedRans`,
      async () => await fetchWrapper.get(baseUrl)
    );
  }
}

function createExtraReducers() {

  return (builder) => {
    getConnectedRans();

    function getConnectedRans() {
      let { pending, fulfilled, rejected } = extraActions.getConnectedRans;
      builder
        .addCase(pending, (state) => {
          //state.rans = { loading: true };
        })
        .addCase(fulfilled, (state, action) => {
          state.rans = [];

          _.forEach(action.payload, function(o) {
            let ran = JSON.parse(JSON.stringify(o), function (prop, value) {
              let lower = prop.toLocaleLowerCase();
              if (prop === lower) return value;
              else this[lower] = value;
            });
            state.rans.push(ran);
          }, []);

          if (state.rans.length === 0)
            state.rans = { info: { message:'No connected RANs found!'} }
        })
        .addCase(rejected, (state, action) => {
          state.rans = { error: action.error };
        });
    }
  };
}
