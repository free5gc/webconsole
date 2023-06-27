import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { fetchWrapper } from '../_helpers';

// create slice

const name = 'topology';
const initialState = createInitialState();
const extraActions = createExtraActions();
const extraReducers = createExtraReducers();
const slice = createSlice({ name, initialState, extraReducers });

// exports

export const topologyActions = { ...slice.actions, ...extraActions };
export const topologyReducer = slice.reducer;

// implementation

function createInitialState() {
  return {
    nodes: {},
    error: null
  }
}

// for all actions that require thunk, aka are async
function createExtraActions() {
  const baseUrl = `${process.env.REACT_APP_API_URL}/topology`;

  return {
    getTopology: getTopology()
  };

  function getTopology() {
    return createAsyncThunk(
      `${name}/getTopology`,
      async () => await fetchWrapper.get(baseUrl)
    );
  }
}

// for all reducers that require fine-grained state management via pending, fulfilled, rejected
function createExtraReducers() {
  return (builder) => {
    getTopology();

    function getTopology() {
      let { pending, fulfilled, rejected } = extraActions.getTopology;
      builder
        .addCase(pending, (state) => {
          //state.nodes = { loading: true };
        })
        .addCase(fulfilled, (state, action) => {
          state.nodes = action.payload;
        })
        .addCase(rejected, (state, action) => {
          state.nodes = { error: action.error };
        });
    }
  };
}
