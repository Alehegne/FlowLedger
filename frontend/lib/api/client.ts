// frontend/src/lib/api/client.ts

const API_BASE = "/api";

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data: unknown,
    public readonly url: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function buildUrl(path: string): string {
  const normalizedPath = path.replace(/^\/+/, "");
  return `${API_BASE}/${normalizedPath}`;
}

function getErrorMessage(data: unknown, fallback: string): string {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data && typeof data === "object") {
    const body = data as Record<string, unknown>;

    for (const key of ["message", "detail", "title", "error"]) {
      if (typeof body[key] === "string" && body[key].trim()) {
        return body[key] as string;
      }
    }
  }

  return fallback;
}

async function request<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const url = buildUrl(path);
  const headers = new Headers(options.headers);

  const hasBody = options.body !== undefined;

  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  headers.set("Accept", "application/json");

  const response = await fetch(url, {
    ...options,
    headers,
    body: hasBody ? JSON.stringify(options.body) : undefined,
    credentials: options.credentials ?? "same-origin",
  });

  const contentType = response.headers.get("content-type") ?? "";
  const responseText = await response.text();

  let data: unknown = undefined;

  if (responseText) {
    if (
      contentType.includes("application/json") ||
      contentType.includes("+json")
    ) {
      try {
        data = JSON.parse(responseText);
      } catch {
        data = responseText;
      }
    } else {
      data = responseText;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(data, `Request failed with status ${response.status}`),
      response.status,
      data,
      url,
    );
  }

  // Handles responses such as HTTP 204 No Content.
  if (response.status === 204 || !responseText) {
    return undefined as T;
  }

  return data as T;
}

export const api = {
  get<T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) {
    return request<T>(path, { ...options, method: "GET" });
  },

  post<T>(
    path: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, "method" | "body">,
  ) {
    return request<T>(path, { ...options, method: "POST", body });
  },

  put<T>(
    path: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, "method" | "body">,
  ) {
    return request<T>(path, { ...options, method: "PUT", body });
  },

  patch<T>(
    path: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, "method" | "body">,
  ) {
    return request<T>(path, { ...options, method: "PATCH", body });
  },

  delete<T>(
    path: string,
    options?: Omit<ApiRequestOptions, "method" | "body">,
  ) {
    return request<T>(path, { ...options, method: "DELETE" });
  },
};
