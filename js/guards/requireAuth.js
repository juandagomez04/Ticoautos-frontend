import { getToken, clearToken } from "../core/storage.js";
import { apiFetch } from "../core/http.js";

export async function requireAuth(redirectTo = "../auth/login.html") {
    const token = getToken();

    if (!token) {
        window.location.href = redirectTo;
        return false;
    }

    try {
        const { res } = await apiFetch("/auth/me");

        if (!res.ok) {
            clearToken();
            window.location.href = redirectTo;
            return false;
        }

        return true;
    } catch (error) {
        console.error("Error verificando autenticación:", error);
        return true;
    }
}