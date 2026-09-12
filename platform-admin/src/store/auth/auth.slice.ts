import { authApi, type LoginPayload } from "@/api/auth";
import { getApiErrorMessage } from "@/lib/api-error";
import { storage } from "@/lib/storage";
import type { AsyncStatus } from "@/types/common";
import type { User, UserType } from "@/types/user";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  userType: UserType | null;
  status: AsyncStatus;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: storage.getAccessToken(),
  refreshToken: storage.getRefreshToken(),
  userType: "PLATFORM_ADMIN",
  status: "idle",
  error: null,
};

export const fetchLogin = createAsyncThunk(
  "auth/login",
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await authApi.login(payload);

      if (!response.data) {
        return rejectWithValue(response.message);
      }

      const { accessToken, refreshToken, userType } = response.data;

      storage.setToken(accessToken, refreshToken);

      return { accessToken, refreshToken, userType };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Could not sign in"));
    }
  },
);

export const fetchMe = createAsyncThunk(
  "auth/me",
  async (_payload, { rejectWithValue }) => {
    try {
      const response = await authApi.me();

      if (!response.data) {
        return rejectWithValue(response.message);
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to fetch"));
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_payload, { rejectWithValue }) => {
    try {
      const response = await authApi.logout();

      if (!response.success) {
        return rejectWithValue(response.message);
      }

      storage.clear();
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to fetch"));
    }
  },
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLogin.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchLogin.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.userType = action.payload.userType;
      })
      .addCase(fetchLogin.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
        state.accessToken = null;
        state.refreshToken = null;
        state.userType = "PLATFORM_ADMIN";
      });

    // current user details
    builder
      .addCase(fetchMe.pending, (state) => {
        state.status = "loading";
        state.user = null;
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.userType = action.payload.userType;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
        state.user = null;
      });

    // logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = "idle";
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
        state.userType = "PLATFORM_ADMIN";
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload as string;
      });
  },
});

export default authSlice.reducer;
