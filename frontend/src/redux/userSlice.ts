import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { IUser } from "../types/user.types";
import { fetchLoggedInUser, logoutUser } from "./userThunk";

interface UserState {
    user: IUser | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: UserState = {
    user: null,
    isLoggedIn: false,
    isLoading: true,
    error: null,
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<IUser>) => {
            state.user = action.payload;
            state.isLoggedIn = true;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchLoggedInUser.pending, (state) => {
            state.isLoading = true;
        }).addCase(fetchLoggedInUser.fulfilled, (state, action) => {
            state.user = action.payload;
            state.isLoggedIn = true;
            state.isLoading = false;
        }).addCase(fetchLoggedInUser.rejected, (state) => {
            state.user = null;
            state.isLoggedIn = false;
            state.isLoading = false;
        }).addCase(logoutUser.fulfilled, (state) => {
            state.user = null;
            state.isLoggedIn = false;
        })
    }
})

export const { setUser } = userSlice.actions;
export default userSlice.reducer;