export type UserType =
  | "CUSTOMER"
  | "SELLER"
  | "PLATFORM_ADMIN"
  | "DELIVERY_AGENT";

export interface IRole {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  phone: string | null;
  fullName: string;
  userType: UserType;
  status: UserStatus;
  twoFactorEnabled: boolean;
  profileImage?: string;
  role?: IRole;
  createdAt: string;
  updatedAt: string;
}
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
