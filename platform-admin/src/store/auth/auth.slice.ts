import {
  authApi,
  type IChangePassword,
  type IUpdateUserPayload,
  type IVerify2FAOtp,
  type IVerifyLogin2FA,
  type LoginPayload,
} from "@/api/auth";
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

  twoFactorToken: string | null;
  requiredTwoFactor: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: storage.getAccessToken(),
  refreshToken: storage.getRefreshToken(),
  userType: "PLATFORM_ADMIN",
  status: "idle",
  error: null,

  twoFactorToken: null,
  requiredTwoFactor: false,
};

export const fetchLogin = createAsyncThunk(
  "auth/login",
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await authApi.login(payload);

      if (!response.data) {
        return rejectWithValue(response.message);
      }

      // 2FA is on, the tokens are issued after the otp is verified
      if ("requiredTwoFactor" in response.data) {
        return {
          requiredTwoFactor: true as const,
          twoFactorToken: response.data.twoFactorToken,
          message: response.data.message,
        };
      }

      const { accessToken, refreshToken, userType } = response.data;

      storage.setToken(accessToken, refreshToken);

      return {
        requiredTwoFactor: false as const,
        accessToken,
        refreshToken,
        userType,
        message: response.message,
      };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Could not sign in"));
    }
  },
);

export const verifyLogin2FA = createAsyncThunk(
  "auth/login-2fa",
  async (payload: IVerifyLogin2FA, { rejectWithValue }) => {
    try {
      const response = await authApi.twoFALoginVerify(payload);

      if (!response.data) {
        return rejectWithValue(response.message);
      }

      const { accessToken, refreshToken, userType } = response.data;

      storage.setToken(accessToken, refreshToken);

      return { accessToken, refreshToken, userType, message: response.message };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to verify otp"));
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

export const updateUser = createAsyncThunk(
  "users/update",
  async (payload: IUpdateUserPayload, { rejectWithValue }) => {
    try {
      const response = await authApi.updateUser(payload);

      if (!response.data) {
        return rejectWithValue(response.message);
      }

      return { user: response.data, message: response.message };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to update"));
    }
  },
);

export const changePassword = createAsyncThunk(
  "users/change-password",
  async (payload: IChangePassword, { rejectWithValue }) => {
    try {
      const response = await authApi.changePassword(payload);

      if (!response.success) {
        return rejectWithValue(response.message);
      }

      return { message: response.message };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to update"));
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

export const generate2FAOtp = createAsyncThunk(
  "auth/2fa-generate-otp",
  async (_payload, { rejectWithValue }) => {
    try {
      const response = await authApi.twoFAGenerateOtp();

      if (!response.success) {
        return rejectWithValue(response.message);
      }

      return { message: response.message };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to generate otp"),
      );
    }
  },
);

export const verify2FAOtp = createAsyncThunk(
  "auth/2fa-verify-otp",
  async (payload: IVerify2FAOtp, { rejectWithValue }) => {
    try {
      const response = await authApi.twoFAVerifyOtp(payload);

      if (!response.success) {
        return rejectWithValue(response.message);
      }

      return { message: response.message };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to verify otp"));
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

    // back to the login form from the otp step
    clearTwoFactor: (state) => {
      state.requiredTwoFactor = false;
      state.twoFactorToken = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLogin.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.requiredTwoFactor = false;
        state.twoFactorToken = null;
      })
      .addCase(fetchLogin.fulfilled, (state, action) => {
        state.status = "succeeded";

        if (action.payload.requiredTwoFactor) {
          state.requiredTwoFactor = true;
          state.twoFactorToken = action.payload.twoFactorToken;
          return;
        }

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

    // login second step, verifying the otp
    builder
      .addCase(verifyLogin2FA.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(verifyLogin2FA.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.userType = action.payload.userType;
        state.requiredTwoFactor = false;
        state.twoFactorToken = null;
      })
      .addCase(verifyLogin2FA.rejected, (state, action) => {
        // keeping the two factor token so the otp can be retried
        state.status = "failed";
        state.error = action.payload as string;
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

    // update user
    builder.addCase(updateUser.fulfilled, (state, action) => {
      state.user = action.payload.user;
    });

    // 2fa enabled or disabled
    builder.addCase(verify2FAOtp.fulfilled, (state, action) => {
      if (state.user) {
        state.user.twoFactorEnabled = action.meta.arg.enable;
      }
    });
  },
});

export const { clearAuthError, clearTwoFactor } = authSlice.actions;

export default authSlice.reducer;
