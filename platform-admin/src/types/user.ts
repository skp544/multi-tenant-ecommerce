export type UserType =
  | "CUSTOMER"
  | "SELLER"
  | "PLATFORM_ADMIN"
  | "DELIVERY_AGENT";

export interface User {
  id: string;
  email: string;
  phone: string | null;
  fullName: string;
  userType: UserType;
  status: UserStatus;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
