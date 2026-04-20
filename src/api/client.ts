import { API_BASE_URL } from "@/config";
import type { AuthenticatedFetch } from "@/types/auth";

export function createAuthorizedFetch(opts: {
  getToken: () => string | null;
  refreshAccessToken: () => Promise<string | null>;
  onAuthFailure: () => void;
}): AuthenticatedFetch {
  return async (path: string, options: RequestInit = {}): Promise<Response> => {
    const token = opts.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string> | undefined) ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      credentials: "include",
    });

    if (res.status !== 401) return res;

    const newToken = await opts.refreshAccessToken();
    if (!newToken) {
      opts.onAuthFailure();
      return res;
    }

    return fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { ...headers, Authorization: `Bearer ${newToken}` },
      credentials: "include",
    });
  };
}
