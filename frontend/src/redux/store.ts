import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";

export const store = configureStore({
    reducer: {
        user: userReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ReturnType: Take a function type and give me whatever it returns. & store.getState Gives state snapshot