export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly data: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string | null;
};

// Chạy trên browser -> dùng relative URL (/api) để Next.js proxy
// Chạy trên server (SSR) -> dùng absolute URL để gọi thẳng backend qua IPv4 (127.0.0.1)
const API_BASE_URL = typeof window !== "undefined" 
  ? "/api" 
  : (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001/api");

export async function apiRequest<TResponse>(path: string, options: ApiRequestOptions = {}) {
  const { body, token, headers: providedHeaders, ...requestOptions } = options;
  const headers = new Headers(providedHeaders);

  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`, {
    cache: "no-store",
    ...requestOptions,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  const data = await parseResponseBody(response);

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      window.localStorage.removeItem("smart-rental.accessToken");
      document.cookie = "smart-rental.accessToken=; path=/; max-age=0; SameSite=Lax";
      
      // Only redirect if not already on login page
      if (window.location.pathname !== "/auth/login") {
        window.location.href = "/auth/login";
      }
    }
    throw new ApiError(getErrorMessage(data, response.statusText, response.status), response.status, data);
  }

  return data as TResponse;
}

async function parseResponseBody(response: Response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

function getErrorMessage(data: unknown, fallback: string, status?: number) {
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message?: unknown }).message;

    if (Array.isArray(message)) {
      return message.join(", ");
    }

    if (typeof message === "string") {
      return message;
    }
  }

  if (typeof data === "string") {
    const text = data.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

    if (text) {
      return text.length > 180 ? `${text.slice(0, 180)}...` : text;
    }
  }

  if (fallback) {
    return fallback;
  }

  return status ? `Yêu cầu thất bại (${status})` : "Yêu cầu thất bại";
}
