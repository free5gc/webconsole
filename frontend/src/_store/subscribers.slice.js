import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { fetchWrapper } from '../_helpers';

// create slice

const name = 'subscribers';
const initialState = createInitialState();
const reducers = createReducers();
const extraActions = createExtraActions();
const extraReducers = createExtraReducers();
const slice = createSlice({ name, initialState, reducers, extraReducers });

// exports

export const subscribersActions = { ...slice.actions, ...extraActions };
export const subscribersReducer = slice.reducer;

// implementation

function createInitialState() {
  return {
    subscribers: {},
    detailedSubscriber: {},
    error: null
  }
}

// for all actions that require thunk, aka are async
function createExtraActions() {
  const baseUrl = `${process.env.REACT_APP_API_URL}/subscribers`;

  return {
    getAllSubscribers: getAllSubscribers(),
    getSubscriberById: getSubscriberById(),
    deleteSubscriberById: deleteSubscriberById(),
    updateSubscriberById: updateSubscriberById(),
    createSubscriberById: createSubscriberById()
  };

  function getAllSubscribers() {
    return createAsyncThunk(
      `${name}/getAllSubscribers`,
      async () => await fetchWrapper.get(baseUrl)
    );
  };

  function getSubscriberById() {
    return createAsyncThunk(
      `${name}/getSubscriberById`,
      async ({ supi, plmnId }) => await fetchWrapper.get(`${baseUrl}/${supi}/${plmnId}`)
    );
  };

  //function sleep(ms) {
  //  return new Promise(resolve => setTimeout(resolve, ms));
  //}

  // delete subscriber and reload subscribers
  // see e.g. https://stackoverflow.com/questions/63516716/redux-toolkit-is-it-possible-to-dispatch-other-actions-from-the-same-slice-in-o
  function deleteSubscriberById() {
    return createAsyncThunk(
      `${name}/deleteSubscriberById`,
      async ({ supi, plmnId }) => {
        return fetchWrapper.delete(`${baseUrl}/${supi}/${plmnId}`);
      }
    );
  };

  // update an existing subscriber
  // no reload of subscribers required, as plmnId and supi cannot change
  function updateSubscriberById() {
    return createAsyncThunk(
      `${name}/updateSubscriberById`,
      async (subscriberData) => {
        await fetchWrapper.put(`${baseUrl}/${subscriberData.supi}/${subscriberData.plmnId}`, subscriberData);
      }
    );
  };

  function createSubscriberById() {
    return createAsyncThunk(
      `${name}/createSubscriberById`,
      async (subscriberData) => {
        await fetchWrapper.post(`${baseUrl}/${subscriberData.supi}/${subscriberData.plmnId}`, subscriberData);
      }
    );
  };
}

// these reducers don't need any special state management
// only syncronous actions!
function createReducers() {
  return {
    setDetailedSubscriber
  };

  function setDetailedSubscriber(state, action) {
    state.detailedSubscriber = action.payload;
  }
}

// for all reducers that require fine-grained state management via pending, fulfilled, rejected
// https://stackoverflow.com/questions/66425645/what-is-difference-between-reducers-and-extrareducers-in-redux-toolkit#:~:text=The%20reducers%20property%20both%20creates,create%20an%20action%20creator%20function.
function createExtraReducers() {
  return (builder) => {
    builder
      //get all
      .addCase(extraActions.getAllSubscribers.pending, (state) => {
        //state.subscribers = { loading: true };
      })
      .addCase(extraActions.getAllSubscribers.fulfilled, (state, action) => {
        state.subscribers = action.payload;

        if (!state.subscribers || state.subscribers.length === 0)
          state.subscribers = { info: { message: 'No subscribers in database' } };
      })
      .addCase(extraActions.getAllSubscribers.rejected, (state, action) => {
        state.subscribers = { error: action.error };
      })

      // get one
      .addCase(extraActions.getSubscriberById.pending, (state) => {
        state.detailedSubscriber = { loading: true };
      })
      .addCase(extraActions.getSubscriberById.fulfilled, (state, action) => {
        state.detailedSubscriber = action.payload;
      })
      .addCase(extraActions.getSubscriberById.rejected, (state, action) => {
        state.detailedSubscriber = { error: action.error };
      })

      // delete one
      .addCase(extraActions.deleteSubscriberById.pending, (state) => {
      })
      .addCase(extraActions.deleteSubscriberById.fulfilled, (state, action) => {
      })
      .addCase(extraActions.deleteSubscriberById.rejected, (state, action) => {
        state.error = action.error;
      })

      // add new
      .addCase(extraActions.createSubscriberById.pending, (state) => {
      })
      .addCase(extraActions.createSubscriberById.fulfilled, (state, action) => {
      })
      .addCase(extraActions.createSubscriberById.rejected, (state, action) => {
        state.error = action.error;
      });
  };
}
