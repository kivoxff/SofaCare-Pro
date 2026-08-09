import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../services/axios";
import type { LoginResponse, LogoutResponse, IUser } from "../types/user.types";
import type { AxiosResponse } from "axios";

export const fetchLoggedInUser = createAsyncThunk<IUser, void, { rejectValue: string }>("user/fetchLoggedInUser", async (_, thunkAPI) => {
    try {
        const response: AxiosResponse<LoginResponse> = await axiosClient.get<LoginResponse>("/api/auth/me");
        return response.data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue("Failed to load user.");
    }
})

export const logoutUser = createAsyncThunk<string, void, { rejectValue: string }>("user/logoutUser", async (_, thunkAPI) => {
    try {
        const response: AxiosResponse<LogoutResponse> = await axiosClient.post<LogoutResponse>("/api/auth/logout");
        return response.data.message;
    } catch (error) {
        return thunkAPI.rejectWithValue("Failed to logout.");
    }
})