export type UserType =
  | "CUSTOMER"
  | "SELLER"
  | "PLATFORM_ADMIN"
  | "DELIVERY_AGENT";

export interface User {
  email: string;
  fullName: string;
}
