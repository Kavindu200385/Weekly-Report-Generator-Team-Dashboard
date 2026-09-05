import axios from "axios";

export const TOKEN_STORAGE_KEY = "sitrep_token";

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function normalizeApiError(err: unknown): Error {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string | string[] } | undefined;
    const message = Array.isArray(data?.message) ? data.message.join(" ") : data?.message;
    return new Error(message || err.message || "Request failed");
  }
  return err instanceof Error ? err : new Error("Request failed");
}
