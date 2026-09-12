import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { storage } from "./storage";
import type { ApiResponse } from "@/types/common";

const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export const client = axios.create({ baseURL: baseUrl });

client.interceptors.request.use((config) => {
  const accessToken = storage.getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export type RefreshTokenResponse = ApiResponse<{
  accessToken: string;
  refreshToken: string;
}>;

async function fetchRefreshToken(): Promise<string> {
  const refreshToken = storage.getRefreshToken();

  if (!refreshToken) {
    throw new Error("Refresh token not found");
  }

  const response = await axios.post<RefreshTokenResponse>(
    `${baseUrl}/auth/refresh`,
    { refreshToken },
  );

  if (!response.data.success) {
    throw new Error(response.data.message ?? "Failed to refresh token");
  }

  if (!response.data.data) {
    throw new Error("Failed to refresh token");
  }

  const { accessToken, refreshToken: newRefreshToken } = response.data.data;
  storage.setToken(accessToken, newRefreshToken);

  return accessToken;
}

/**
 * 401 - Unauthorized access
 */

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;
    const hadAuthHeader = Boolean(originalRequest?.headers?.Authorization);

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      !hadAuthHeader
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newAccessToken = await fetchRefreshToken();

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return client.request(originalRequest);
    } catch (refreshError) {
      storage.clear();
      window.location.href = "/auth/login";
      return Promise.reject(refreshError);
    }
  },
);
