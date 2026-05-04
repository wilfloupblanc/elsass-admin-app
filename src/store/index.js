import {adminApiSlice} from "./ApiSlice/adminApiSlice";
import {configureStore} from "@reduxjs/toolkit";

const store = configureStore({
    reducer: {
        adminApi: adminApiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    }).concat(adminApiSlice.middleware),
})

export default store