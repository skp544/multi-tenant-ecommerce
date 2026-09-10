export type AsyncStatus =
  | "idle"
  | "pending"
  | "succeeded"
  | "failed"
  | "loading";

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
}
