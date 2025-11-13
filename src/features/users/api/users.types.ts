export type Role = "Admin" | "User" | "Guest";

export interface User {
  id: string;
  createdAt: string; // ISO
  name: string;
  phoneNumber: string;
  email: string;
  avatar: string;
  active: boolean; // true => Active, false => Inactive
  role: Role;
  bio: string;
}
