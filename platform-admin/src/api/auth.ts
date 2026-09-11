import { client } from "@/lib/axios";
import type { User, UserType } from "@/types/user";
import type { ApiResponse } from "@/types/common";

export interface LoginPayload {
  email: string;
  password: string;
}

export type LoginResponse = ApiResponse<{
  accessToken: string;
  refreshToken: string;
  userType: UserType;
}>;

export type MeResponse = ApiResponse<User>;

export const authApi = {
  login: async (payload: LoginPayload) => {
    return client
      .post<LoginResponse>("/auth/login", payload)
      .then((res) => res.data);
  },

  me: async () => {
    return client.get<MeResponse>("/auth/me").then((res) => res.data);
  },
};
