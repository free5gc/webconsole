import { configureStore } from '@reduxjs/toolkit';

import { authReducer } from './auth.slice';
import { usersReducer } from './users.slice';
import { subscribersReducer } from './subscribers.slice';
import { uesReducer } from './ues.slice';

export * from './auth.slice';
export * from './users.slice';
export * from './subscribers.slice'
export * from './ues.slice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        users: usersReducer,
        subscribers: subscribersReducer,
        ues: uesReducer,
    },
});
