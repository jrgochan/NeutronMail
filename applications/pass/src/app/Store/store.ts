import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

import { requestMiddleware } from '@proton/pass/store/middlewares/request-middleware';
import reducer from '@proton/pass/store/reducers';

export const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
    reducer,
    middleware: [requestMiddleware, sagaMiddleware],
    devTools: ENV === 'development',
});
