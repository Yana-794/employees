import { API_BASE_URL } from "@/shared/config";
import { ApiError } from "./ApiError";

const DEFAULT_TIMEOUT_MS = 15_000;

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
};

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const base = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }

  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
}

async function readBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const text = await response.text();
  if (!text) return undefined;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function parseBackendError(status: number, data: unknown): ApiError {
  let code: string | undefined;
  let message = `Запрос завершился ошибкой ${status}`;

  if (data && typeof data === "object" && "error" in data) {
    const error = (data as { error?: { code?: unknown; message?: unknown } })
      .error;
    if (error && typeof error === "object") {
      if (typeof error.code === "string") code = error.code;
      if (typeof error.message === "string") message = error.message;
    }
  }

  return new ApiError(message, status, { code, details: data });
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    query,
    body,
    signal,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = options;

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  const abortFromParent = () => controller.abort();

  if (signal?.aborted) controller.abort();
  else signal?.addEventListener("abort", abortFromParent, { once: true });

  const isFormData = body instanceof FormData;
  const headers: Record<string, string> = { Accept: "application/json" };

  if (body !== undefined && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(buildUrl(path, query), {
      method,
      headers,
      credentials: "include",
      body: isFormData
        ? (body as FormData)
        : body !== undefined
          ? JSON.stringify(body)
          : undefined,
      signal: controller.signal,
    });

    const data = await readBody(response);
    if (!response.ok) {
      if (response.status === 401) unauthorizedHandler?.();
      throw parseBackendError(response.status, data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    const aborted =
      error instanceof DOMException && error.name === "AbortError";
    throw new ApiError(aborted ? "Запрос прерван" : "Ошибка сети", 0, {
      code: aborted ? "ABORTED" : "NETWORK_ERROR",
      details: error,
    });
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener("abort", abortFromParent);
  }
}

export const httpClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, options?: Omit<RequestOptions, "method">) =>
    apiFetch<T>(path, { ...options, method: "POST" }),
  put: <T>(path: string, options?: Omit<RequestOptions, "method">) =>
    apiFetch<T>(path, { ...options, method: "PUT" }),
  delete: <T>(
    path: string,
    options?: Omit<RequestOptions, "method" | "body">,
  ) => apiFetch<T>(path, { ...options, method: "DELETE" }),
};

export { ApiError };