import { apiRequest } from "./api";

export type AuthRole = "ADMIN" | "LANDLORD" | "SEEKER" | "TENANT";
export type AuthStatus = "PENDING" | "ACTIVE" | "LOCKED" | "SUSPENDED" | "DELETED";

export type AuthUser = {
  id: string;
  email: string;
  phone: string | null;
  fullName: string | null;
  role: AuthRole;
  status: AuthStatus;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = LoginPayload & {
  fullName: string;
  phone?: string;
  role?: Exclude<AuthRole, "ADMIN">;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

export type RegisterResponse = {
  user: AuthUser;
};

const TOKEN_STORAGE_KEY = "smart-rental.accessToken";

export function getStoredAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function storeAccessToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredAccessToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export async function login(payload: LoginPayload) {
  const response = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: payload
  });

  storeAccessToken(response.accessToken);
  return response;
}

export function register(payload: RegisterPayload) {
  return apiRequest<RegisterResponse>("/auth/register", {
    method: "POST",
    body: payload
  });
}

export function getCurrentUser(token = getStoredAccessToken()) {
  if (!token) {
    return null;
  }

  return apiRequest<AuthUser>("/auth/me", {
    method: "GET",
    token
  });
}
