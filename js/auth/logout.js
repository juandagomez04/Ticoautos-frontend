import { clearToken } from "../core/storage.js";

export function logout(redirectTo = "../auth/login.html") {
    clearToken();
    window.location.href = redirectTo;
}