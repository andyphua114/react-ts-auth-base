export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthUser {
  id: string;
  username: string;
  displayName?: string;
  roles: string[];
}

export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  error: string | null;
}

export type AuthAction =
  | { type: "BOOTSTRAP_SUCCESS"; payload: { user: AuthUser } }
  | { type: "BOOTSTRAP_FAILURE" }
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: { user: AuthUser } }
  | { type: "LOGIN_FAILURE"; payload: { error: string } }
  | { type: "LOGOUT" };

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  user: AuthUser;
}

export type AuthenticatedFetch = (
  path: string,
  options?: RequestInit,
) => Promise<Response>;
