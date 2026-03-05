import { apiFetch } from "../core/http.js";
import { saveToken } from "../core/storage.js";

function setMsg(text, type = "ok") {
    const box = document.getElementById("msg");
    if (!box) return;
    box.className = type;
    box.textContent = text;
}

const form = document.getElementById("loginForm");

form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) return setMsg("Completa email y contraseña.", "err");

    const { res, data } = await apiFetch("/auth/token", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) return setMsg(data.message || "Credenciales inválidas.", "err");

    saveToken(data.token);
    setMsg("Login correcto ✅", "ok");
    setTimeout(() => (window.location.href = "../app/home.html"), 400);
});