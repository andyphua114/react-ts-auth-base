import { createContext, useContext } from "react";
import type {
  AuthStatus,
  AuthUser,
  AuthenticatedFetch,
  LoginCredentials,
} from "@/types/auth";

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  error: string | null;
  isAuthenticated: boolean;
  authenticatedFetch: AuthenticatedFetch;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
