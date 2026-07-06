import type { DatasetDetail, InsightResult, User } from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "https://predictra-ai.onrender.com";

type RequestOptions = RequestInit & { token?: string | null };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);
  const response = await fetch(`${API_URL}/api${path}`, { ...options, headers });
  if (!response.ok) {
    let detail = "Request failed";
    try {
      const data = await response.json();
      detail = data.detail ?? detail;
    } catch {
      detail = response.statusText;
    }
    throw new Error(detail);
  }
  return response.json() as Promise<T>;
}

export const api = {
  signup: (body: { name: string; email: string; password: string }) =>
    request<{ token: string; user: User }>("/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: User }>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: (token: string) => request<{ user: User; recent_uploads: unknown[]; saved_reports: unknown[] }>("/me", { token }),
  settings: (token: string, body: { name?: string; openrouter_api_key?: string }) =>
    request<{ user: User; has_openrouter_key: boolean }>("/settings", { method: "PATCH", token, body: JSON.stringify(body) }),
  deleteAccount: (token: string) => request<{ status: string }>("/account", { method: "DELETE", token }),
  upload: (token: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<DatasetDetail>("/datasets", { method: "POST", token, body: form });
  },
  datasets: (token: string) => request<{ datasets: DatasetDetail["dataset"][] }>("/datasets", { token }),
  dataset: (token: string, id: number) => request<DatasetDetail>(`/datasets/${id}`, { token }),
  chart: (token: string, id: number, body: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/datasets/${id}/charts`, { method: "POST", token, body: JSON.stringify(body) }),
  clean: (token: string, id: number, body: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/datasets/${id}/clean`, { method: "POST", token, body: JSON.stringify(body) }),
  ml: (token: string, id: number, body: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/datasets/${id}/ml`, { method: "POST", token, body: JSON.stringify(body) }),
  forecast: (token: string, id: number, body: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/datasets/${id}/forecast`, { method: "POST", token, body: JSON.stringify(body) }),
  insights: (token: string, id: number) => request<InsightResult>(`/datasets/${id}/insights`, { method: "POST", token }),
  chat: (token: string, id: number, question: string) =>
    request<{ answer: string; source: string }>(`/datasets/${id}/chat`, { method: "POST", token, body: JSON.stringify({ question }) }),
  exportBlob: async (token: string, id: number, kind: "csv" | "pdf") => {
    const response = await fetch(`${API_URL}/api/datasets/${id}/export/${kind}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) throw new Error("Export failed");
    return response.blob();
  },
  rawBaseUrl: API_URL,
};
