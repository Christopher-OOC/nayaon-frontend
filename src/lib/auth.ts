const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";
const NORMALIZED_API_BASE_URL = API_BASE_URL.replace(/\/+$/, "");

const AUTH_STORAGE_KEY = "javalord_auth";

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  token_type: string;
  member_id: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
  } catch {
    throw new Error("Unable to reach the server. Check that the backend is running.");
  }

  const payload = (await response.json().catch(() => null)) as
    | (Partial<AuthSession> & { detail?: string; message?: string })
    | null;

  if (!response.ok) {
    throw new Error(
      payload?.detail ?? payload?.message ?? "The username or password is incorrect.",
    );
  }

  if (!payload?.access_token || !payload.refresh_token || !payload.member_id) {
    throw new Error("The server returned an incomplete login response.");
  }

  return payload as AuthSession;
}

export function getApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;

  const apiBaseUrl = new URL(NORMALIZED_API_BASE_URL);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (
    normalizedPath === apiBaseUrl.pathname ||
    normalizedPath.startsWith(`${apiBaseUrl.pathname}/`)
  ) {
    return new URL(normalizedPath, apiBaseUrl.origin).toString();
  }

  return `${NORMALIZED_API_BASE_URL}${normalizedPath}`;
}

export function authenticatedFetch(
  input: string | URL,
  init: RequestInit = {},
): Promise<Response> {
  const session = getAuthSession();
  const headers = new Headers(init.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (session?.access_token) {
    headers.set(
      "Authorization",
      `${session.token_type || "Bearer"} ${session.access_token}`,
    );
  }

  const url = input instanceof URL ? input.toString() : getApiUrl(input);
  return fetch(url, { ...init, headers });
}

export function saveAuthSession(session: AuthSession): void {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function getAuthSession(): AuthSession | null {
  const storedSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedSession) return null;

  try {
    return JSON.parse(storedSession) as AuthSession;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function clearAuthSession(): void {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}