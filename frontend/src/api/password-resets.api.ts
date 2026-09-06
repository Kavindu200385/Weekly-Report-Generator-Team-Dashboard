import { client, normalizeApiError } from "@/api/client";

export interface PasswordResetRequest {
  id: number;
  name: string;
  email: string;
  passwordResetRequestedAt: string;
}

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  try {
    const { data } = await client.post<{ message: string }>("/auth/forgot-password", { email });
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}

export async function validateResetToken(token: string): Promise<{ valid: boolean }> {
  try {
    const { data } = await client.get<{ valid: boolean }>(`/auth/reset-password/${token}`);
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}

export async function submitNewPassword(token: string, newPassword: string): Promise<{ message: string }> {
  try {
    const { data } = await client.post<{ message: string }>("/auth/reset-password", { token, newPassword });
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}

export async function getPasswordResetRequests(): Promise<PasswordResetRequest[]> {
  try {
    const { data } = await client.get<PasswordResetRequest[]>("/users/password-reset-requests");
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}

export async function resetUserPassword(id: number): Promise<{ token: string }> {
  try {
    const { data } = await client.post<{ token: string }>(`/users/${id}/reset-password`);
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}
