// Real NestJS auth endpoints — replaces the earlier mock lookup against
// frontend/src/api/mockData.ts's in-memory USERS array.
import type { Role } from "@/types";
import { client, normalizeApiError } from "@/api/client";

export interface BackendUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  user: BackendUser;
  token: string;
}

export async function register(
  name: string,
  email: string,
  password: string,
  recaptchaToken: string,
  inviteToken?: string,
): Promise<AuthResponse> {
  try {
    const { data } = await client.post<AuthResponse>("/auth/register", {
      name,
      email,
      password,
      recaptchaToken,
      ...(inviteToken ? { inviteToken } : {}),
    });
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}

export async function login(
  email: string,
  password: string,
  recaptchaToken?: string,
): Promise<AuthResponse> {
  try {
    const { data } = await client.post<AuthResponse>("/auth/login", {
      email,
      password,
      ...(recaptchaToken ? { recaptchaToken } : {}),
    });
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}

export async function checkRecaptchaRequired(email: string): Promise<boolean> {
  try {
    const { data } = await client.get<{ required: boolean }>("/auth/recaptcha-required", {
      params: { email },
    });
    return data.required;
  } catch {
    // If the check itself fails, fail safe by not requiring recaptcha —
    // the backend still enforces the threshold server-side regardless.
    return false;
  }
}

export async function getMe(): Promise<BackendUser> {
  try {
    const { data } = await client.get<BackendUser>("/auth/me");
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}
