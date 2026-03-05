import { API } from "./config.js";
import { getToken, clearToken } from "./storage.js";

export async function apiFetch(path, options = {}) {
    const token = getToken();

    const headers = {
        ...(options.headers || {}),
    };

    // Si hay body JSON, seteamos content-type
    if (options.body && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }

    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(API + path, { ...options, headers });
    const data = await res.json().catch(() => ({}));

    if (res.status === 401) clearToken();

    return { res, data };
}