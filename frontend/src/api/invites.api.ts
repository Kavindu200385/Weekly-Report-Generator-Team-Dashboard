import type { Role } from "@/types";
import { client, normalizeApiError } from "@/api/client";

export interface ApiInvite {
  id: number;
  email: string;
  role: Role;
  token: string;
  status: "pending" | "accepted" | "revoked";
  expiresAt: string;
  createdAt: string;
}

export interface InviteValidation {
  email: string;
  role: Role;
}

export async function createInvite(input: { email: string; role: Role }): Promise<ApiInvite> {
  try {
    const { data } = await client.post<ApiInvite>("/invites", input);
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}

export async function getPendingInvites(): Promise<ApiInvite[]> {
  try {
    const { data } = await client.get<ApiInvite[]>("/invites");
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}

export async function revokeInvite(id: number): Promise<ApiInvite> {
  try {
    const { data } = await client.delete<ApiInvite>(`/invites/${id}`);
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}

export async function validateInvite(token: string): Promise<InviteValidation> {
  try {
    const { data } = await client.get<InviteValidation>(`/invites/${token}`);
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}
