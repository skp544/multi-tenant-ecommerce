import { client } from "@/lib/axios";
import type { User, UserType } from "@/types/user";
import type { ApiResponse } from "@/types/common";
import ChangePassword from "@/components/my-account/ChangePassword";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface IUpdateUserPayload {
  fullName: string;
  phone: string | null;
  profileImage: string | null;
}

export interface IChangePassword {
  password: string;
}

export type LoginResponse = ApiResponse<{
  accessToken: string;
  refreshToken: string;
  userType: UserType;
}>;

export type MeResponse = ApiResponse<User>;

export type SuccessResponse = ApiResponse<null>;

export const authApi = {
  login: async (payload: LoginPayload) => {
    return client
      .post<LoginResponse>("/auth/login", payload)
      .then((res) => res.data);
  },

  me: async () => {
    return client.get<MeResponse>("/auth/me").then((res) => res.data);
  },

  updateUser: async (payload: IUpdateUserPayload) => {
    return client.put<MeResponse>("/users/me", payload).then((res) => res.data);
  },

  changePassword: async (payload: IChangePassword) => {
    return client
      .put<SuccessResponse>("/users/change-password", payload)
      .then((res) => res.data);
  },

  logout: async () => {
    return client.post<SuccessResponse>("/auth/logout").then((res) => res.data);
  },

  twoFAGenerateOtp: async () => {
    return client
      .post<SuccessResponse>("/auth/2fa-generate-otp")
      .then((res) => res.data);
  },
};
