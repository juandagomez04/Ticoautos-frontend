import { apiFetch } from "../core/http.js";
import { requireAuth } from "../guards/requireAuth.js";
import { logout } from "../auth/logout.js";

const ok = await requireAuth("../auth/login.html");
if (!ok) throw new Error("Not authenticated");

const who = document.getElementById("who");
const { data } = await apiFetch("/auth/me");
who.textContent = `Logueado como: ${data.user?.email || ""}`;

document.getElementById("logoutBtn").addEventListener("click", () => {
    logout("../auth/login.html");
});