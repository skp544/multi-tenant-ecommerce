import { client } from "@/lib/axios";
import type { UserType } from "@/types/user";
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

export const authApi = {
  login: (payload: LoginPayload) => {
    return client
      .post<LoginResponse>("/auth/login", payload)
      .then((res) => res.data);
  },
};
