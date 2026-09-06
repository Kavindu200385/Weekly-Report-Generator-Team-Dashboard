// Real NestJS UsersModule endpoints — replaces the earlier mock array
// held in frontend/src/api/mockData.ts's USERS.
import { client, normalizeApiError } from "@/api/client";
import type { Role } from "@/types";

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface PendingRegistration {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface ApiUserProfile {
  user: { id: number; name: string; email: string; role: Role };
  stats: { totalReportsSubmitted: number; currentApprovalRate: number; openBlockersCount: number };
  recentReports: { id: number; week: string; status: string }[];
}

export async function getUsers(filter: { role?: Role; includeInactive?: boolean } = {}): Promise<ApiUser[]> {
  try {
    const { data } = await client.get<ApiUser[]>("/users", {
      params: {
        ...(filter.role ? { role: filter.role } : {}),
        ...(filter.includeInactive ? { includeInactive: "true" } : {}),
      },
    });
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}

export async function updateUserRole(id: number, role: Role): Promise<ApiUser> {
  try {
    const { data } = await client.patch<ApiUser>(`/users/${id}/role`, { role });
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}

export async function updateUserDetails(id: number, details: { name: string; email: string }): Promise<ApiUser> {
  try {
    const { data } = await client.patch<ApiUser>(`/users/${id}`, details);
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}

export async function removeUser(id: number): Promise<ApiUser> {
  try {
    const { data } = await client.delete<ApiUser>(`/users/${id}`);
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}

export async function getUserProfile(id: number): Promise<ApiUserProfile> {
  try {
    const { data } = await client.get<ApiUserProfile>(`/users/${id}/profile`);
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}

export async function getPendingRegistrations(): Promise<PendingRegistration[]> {
  try {
    const { data } = await client.get<PendingRegistration[]>("/users/pending-registrations");
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}

export async function approveRegistration(id: number, role: Role): Promise<ApiUser> {
  try {
    const { data } = await client.patch<ApiUser>(`/users/${id}/approve`, { role });
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}
