import { API_BASE_URL, LOGIN_PATH, LOGOUT_PATH, REFRESH_PATH } from "@/config";
import type { AuthResponse, LoginCredentials } from "@/types/auth";

export async function loginRequest(
  credentials: LoginCredentials,
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}${LOGIN_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    throw new Error(`Login failed: ${res.status}`);
  }
  return res.json() as Promise<AuthResponse>;
}

export async function refreshSession(): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}${REFRESH_PATH}`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`Refresh failed: ${res.status}`);
  }
  return res.json() as Promise<AuthResponse>;
}

export async function logoutSession(): Promise<void> {
  const res = await fetch(`${API_BASE_URL}${LOGOUT_PATH}`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`Logout failed: ${res.status}`);
  }
}
