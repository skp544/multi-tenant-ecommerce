export const LOCAL_STORAGE_FIELDS = {
  ACCESS_TOKEN: "ACCESS_TOKEN",
  REFRESH_TOKEN: "REFRESH_TOKEN",
};

export const storage = {
  getAccessToken(): string | null {
    return localStorage.getItem(LOCAL_STORAGE_FIELDS.ACCESS_TOKEN);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(LOCAL_STORAGE_FIELDS.REFRESH_TOKEN);
  },

  setToken(accessToken: string, refreshToken: string): void {
    localStorage.setItem(LOCAL_STORAGE_FIELDS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(LOCAL_STORAGE_FIELDS.REFRESH_TOKEN, refreshToken);
  },

  clearField(field: keyof typeof LOCAL_STORAGE_FIELDS): void {
    localStorage.removeItem(field);
  },

  clear(): void {
    localStorage.clear();
  },
};
