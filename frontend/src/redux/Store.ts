import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
    persistReducer,
    persistStore,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from "reduxjs-toolkit-persist";
import storage from "reduxjs-toolkit-persist/lib/storage";
import AuthReducer from "./AuthReducer";

const persistConfig = {
    key: "root",
    storage: storage,
    whitelist: ["auth"], // On persiste explicitement le state auth
};

const reducers = combineReducers({
    auth: AuthReducer
});

const _persistedReducer = persistReducer(persistConfig, reducers);

const store = configureStore({
    reducer: _persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }).concat(),
});

const persistor = persistStore(store);
export { store, persistor };