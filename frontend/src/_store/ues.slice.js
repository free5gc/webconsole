import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import _ from 'lodash';

import { fetchWrapper } from '../_helpers';

// create slice

const name = 'ues';
const initialState = createInitialState();
const extraActions = createExtraActions();
const extraReducers = createExtraReducers();
const slice = createSlice({ name, initialState, extraReducers });

// exports

export const uesActions = { ...slice.actions, ...extraActions };
export const uesReducer = slice.reducer;

// implementation

function createInitialState() {
  return {
    ues: {},
    detailedUe: {},
    error: null
  }
}

// for all actions that require thunk, aka are async
function createExtraActions() {
  const baseUrlAmf = `${process.env.REACT_APP_API_URL}/amf-ue-contexts`;
  const baseUrlSmf = `${process.env.REACT_APP_API_URL}/ue-session-contexts`;

  return {
    getRegisteredUesAndAmfContexts: getRegisteredUesAndAmfContexts(),
    getUeSessionInfoById: getUeSessionInfoById()
  };

  function getRegisteredUesAndAmfContexts() {
    return createAsyncThunk(
      `${name}/getRegisteredUesAndAmfContexts`,
      async () => await fetchWrapper.get(baseUrlAmf)
    );
  };

  function getUeSessionInfoById() {
    return createAsyncThunk(
      `${name}/getUeSessionInfoById`,
      async (supi, { getState }) => {
        const state = getState();
        let ue = _.find(state.ues.ues, { 'supi': supi });
        const { pdusessions } = ue;
        const { smcontextref } = pdusessions.find(x => x !== undefined);
        const response = await fetchWrapper.get(`${baseUrlSmf}/${smcontextref}`);
        return response;
      }
      //async (supi) => {
      //  let amfContext = await fetchWrapper.get(`${baseUrlAmf}/${supi}`);
      //  console.log(amfContext);
      //  const { pdusessions } = amfContext;
      //  const { smContextRef } = pdusessions.find(x => x !== undefined);
      //  const smfContext = await fetchWrapper.get(`${baseUrlSmf}/${smContextRef}`);
      //  return {
      //    amfContext: amfContext,
      //    smfContext: smfContext,
      //  }
      //}
    );
  };
};

// for all reducers that require fine-grained state management via pending, fulfilled, rejected
function createExtraReducers() {
  return (builder) => {
    let { pending: getAmfContextsPending, fulfilled: getAmfContextsFulfilled, rejected: getAmfContextsRejected } = extraActions.getRegisteredUesAndAmfContexts;
    let { pending: getSessionContextPending, fulfilled: getSessionContextFulfilled, rejected: getSessionContextRejected } = extraActions.getUeSessionInfoById;

    builder
      .addCase(getAmfContextsPending, (state) => {
        //state.ues = { loading: true };
      })
      .addCase(getAmfContextsFulfilled, (state, action) => {
        state.ues = [];
        _.forEach(action.payload, function (o) {
          let ue = JSON.parse(JSON.stringify(o), function (prop, value) {
            let lower = prop.toLocaleLowerCase();
            if (prop === lower) return value;
            else this[lower] = value;
          });
          state.ues.push(ue);
        }, []);

        if (state.ues.length === 0)
          state.ues = { info: { message: 'No registered UEs found!' } };
      })
      .addCase(getAmfContextsRejected, (state, action) => {
        state.ues = { error: action.error };
      })

      .addCase(getSessionContextPending, (state) => {
        state.detailedUe = { loading: true };
      })
      .addCase(getSessionContextFulfilled, (state, action) => {
        // we have the AMF information already in ues, extract

        let smfInfo = JSON.parse(JSON.stringify(action.payload), function (prop, value) {
          let lower = prop.toLocaleLowerCase();
          if (prop === lower) return value;
          else this[lower] = value;
        });

        let amfInfo = _.find(state.ues, { 'supi': smfInfo.supi }, null);
        if (!amfInfo)
          state.detailedUe = { error: { message: 'Cannot find matching UE context in AMF. Check SUPI of SMF context!' } };
        else {
          state.detailedUe = {
            amfInfo: amfInfo,
            smfInfo: smfInfo,
          }
        }
      })
      .addCase(getSessionContextRejected, (state, action) => {
        state.detailedUe = { error: action.error };
      });
  };
}
