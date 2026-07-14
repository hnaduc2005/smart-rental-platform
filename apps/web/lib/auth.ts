import { apiRequest } from "./api";

export type AuthRole = "ADMIN" | "LANDLORD" | "SEEKER" | "TENANT";
export type AuthStatus = "PENDING" | "ACTIVE" | "LOCKED" | "SUSPENDED" | "DELETED";

export type AuthUser = {
  id: string;
  email: string;
  phone: string | null;
  fullName: string | null;
  avatarUrl: string | null;
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
  // Also store in cookie so Next.js middleware can read it
  document.cookie = `${TOKEN_STORAGE_KEY}=${token}; path=/; max-age=86400; SameSite=Lax`;
}

export function clearStoredAccessToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  // Also clear cookie
  document.cookie = `${TOKEN_STORAGE_KEY}=; path=/; max-age=0; SameSite=Lax`;
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

export function updateProfile(payload: { fullName?: string; phone?: string; avatarUrl?: string }, token = getStoredAccessToken()) {
  if (!token) {
    return Promise.reject(new Error("No access token"));
  }

  return apiRequest<AuthUser>("/users/profile", {
    method: "PUT",
    body: payload,
    token
  });
}

export function changePassword(payload: { currentPassword: string; newPassword: string }, token = getStoredAccessToken()) {
  if (!token) {
    return Promise.reject(new Error("No access token"));
  }

  return apiRequest<any>("/users/password", {
    method: "PUT",
    body: payload,
    token
  });
}

export function forgotPassword(payload: { email: string }) {
  return apiRequest<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: payload
  });
}

export function resetPassword(payload: { token: string; newPassword: string }) {
  return apiRequest<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: payload
  });
}
