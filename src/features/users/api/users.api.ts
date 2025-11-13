import { api } from "../../../lib/axios";
import type { User } from "./users.types";

export async function getUsers(params?: {
  search?: string;
  role?: string;
  createdFrom?: string; // ISO
  createdTo?: string;   // ISO
  sortBy?: "name" | "email" | "createdAt";
  order?: "asc" | "desc";
}) {
  const res = await api.get<User[]>("/user", { params });
  return res.data;
}

export async function getUser(id: string) {
  const res = await api.get<User>(`/user/${id}`);
  return res.data;
}

export async function createUser(payload: Partial<User>) {
  const res = await api.post<User>("/user", payload);
  return res.data;
}

export async function updateUser(id: string, payload: Partial<User>) {
  const res = await api.put<User>(`/user/${id}`, payload);
  return res.data;
}

export async function deleteUser(id: string) {
  await api.delete(`/user/${id}`);
  return id;
}

export async function bulkDelete(ids: string[]) {
  // Parallel delete; caller will orchestrate optimistic UI + undo
  await Promise.all(ids.map((id) => api.delete(`/user/${id}`)));
  return ids;
}
