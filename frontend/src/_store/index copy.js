import { configureStore } from '@reduxjs/toolkit';

import { authReducer } from './auth.slice';
import { usersReducer } from './users.slice';
import { slicesReducer } from './slices.slice';
import { subscribersReducer } from './subscribers.slice';
import { topologyReducer } from './topology.slice';
import { ransReducer } from './rans.slice';
import { uesReducer } from './ues.slice';

export * from './auth.slice';
export * from './users.slice';
export * from './slices.slice';
export * from './subscribers.slice'
export * from './topology.slice'
export * from './rans.slice'
export * from './ues.slice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        users: usersReducer,
        slices: slicesReducer,
        subscribers: subscribersReducer,
        topology: topologyReducer,
        rans: ransReducer,
        ues: uesReducer,
    },
});
