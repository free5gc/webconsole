import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { fetchWrapper } from '../_helpers';

// create slice
const name = 'slices';
const initialState = createInitialState();
const extraActions = createExtraActions();
const extraReducers = createExtraReducers();
const slice = createSlice({ name, initialState, extraReducers });

// exports
export const slicesActions = { ...slice.actions, ...extraActions };
export const slicesReducer = slice.reducer;

// implementation
function createInitialState() {
  return {
    refreshInterval: 0,
    supportedSlices: {},
    error: null
  }
}

// couple API calls with state directly
function createExtraActions() {
  const baseUrl = `${process.env.REACT_APP_API_URL}/supported-slices`;

  return {
    getSupportedSlices: getSupportedSlices()
  };

  function getSupportedSlices() {
    console.log('get supported slices called');
    return createAsyncThunk(
      `${name}/getSupportedSlices`,
      async () => await fetchWrapper.get(baseUrl)
    );
  }
}

function createExtraReducers() {

  return (builder) => {
    getSupportedSlices();

    function getSupportedSlices() {
      let { pending, fulfilled, rejected } = extraActions.getSupportedSlices;
      builder
        .addCase(pending, (state) => {
          //state.supportedSlices = { loading: true };
        })
        .addCase(fulfilled, (state, action) => {
          state.supportedSlices = [];
        _.forEach(action.payload, function(o) {
          let slice = JSON.parse(JSON.stringify(o), function (prop, value) {
            let lower = prop.toLocaleLowerCase();
            if (prop === lower) return value;
            else this[lower] = value;
          });
          state.supportedSlices.push(slice);
        }, []);

        if (state.supportedSlices.length === 0)
          state.supportedSlices = { info: { message: 'No supported slices configured in core!' } };
        })
        .addCase(rejected, (state, action) => {
          console.log(action);
          state.supportedSlices = { error: action.error };
        });
    }
  };
}
