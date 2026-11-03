import { getToken } from "@/lib/auth-storage";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

/**
 * Envelope used by the backend (PJ02-EquipmentRent):
 *   success -> { success: true, data, count? }
 *   failure -> { success: false, error }
 */
type ApiResponse<T> =
  { success: true; data: T; count?: number } | { success: false; error: string };

/** A failure reported by the API. `status` lets callers tell 401/403/validation apart. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  // Null during SSR and before login; the header is omitted in both cases.
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  let body: ApiResponse<T>;
  try {
    body = await res.json();
  } catch {
    throw new ApiError(`Unexpected response from server (${res.status})`, res.status);
  }

  if (!body.success) {
    throw new ApiError(body.error, res.status);
  }
  return body.data;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: data === undefined ? undefined : JSON.stringify(data),
    }),
  put: <T>(path: string, data: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(data) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
