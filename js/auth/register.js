import { apiFetch } from "../core/http.js";

function setMsg(text, type = "ok") {
    const box = document.getElementById("msg");
    if (!box) return;
    box.className = type;
    box.textContent = text;
}

function isEmailValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const form = document.getElementById("registerForm");

form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!name || !lastName || !email || !password) return setMsg("Completa todos los campos.", "err");
    if (!isEmailValid(email)) return setMsg("Email inválido.", "err");
    if (password.length < 6) return setMsg("La contraseña debe tener mínimo 6 caracteres.", "err");

    const { res, data } = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, lastName, email, password }),
    });

    if (!res.ok) return setMsg(data.message || "Error registrando usuario.", "err");

    setMsg("Registro exitoso. Redirigiendo a login...", "ok");
    setTimeout(() => (window.location.href = "./login.html"), 700);
});