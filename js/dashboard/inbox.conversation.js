import { requireAuth } from "../guards/requireAuth.js";
import { clearToken, getToken } from "../core/storage.js";  
import { apiFetch } from "../core/http.js";

document.addEventListener("DOMContentLoaded", async () => {
    const ok = await requireAuth();
    if (!ok) return;

    const logoutLink = document.getElementById("logoutLink");
    const vehicleTitle = document.getElementById("vehicleTitle");
    const vehicleMeta = document.getElementById("vehicleMeta");
    const conversationStatus = document.getElementById("conversationStatus");
    const buyerName = document.getElementById("buyerName");
    const questionDate = document.getElementById("questionDate");
    const answerDate = document.getElementById("answerDate");
    const messagesBox = document.getElementById("messagesBox");
    const answerForm = document.getElementById("answerForm");
    const answerText = document.getElementById("answerText");
    const formMessage = document.getElementById("formMessage");

    const params = new URLSearchParams(window.location.search);
    const vehicleId = params.get("vehicleId");
    const buyerId = params.get("buyerId");

    // Obtener userId del token
    function getUserId() {
        try {
            const token = getToken();
            const payload = token.split(".")[1];
            return JSON.parse(atob(payload)).id;
        } catch { return null; }
    }

    const currentUserId = getUserId();

    function showMessage(text, type) {
        formMessage.textContent = text;
        formMessage.classList.remove("hidden", "success", "error");
        formMessage.classList.add(type);
    }

    async function loadConversation() {
        if (!vehicleId || !buyerId) {
            messagesBox.innerHTML = `<div class="message-card message-system"><p>Parámetros inválidos.</p></div>`;
            answerForm.classList.add("hidden");
            return;
        }

        const { res, data } = await apiFetch(`/api/inbox/conversation/${vehicleId}/${buyerId}`);

        if (!res.ok) {
            messagesBox.innerHTML = `<div class="message-card message-system"><p>No se pudo cargar la conversación.</p></div>`;
            answerForm.classList.add("hidden");
            return;
        }

        renderConversation(data);
    }

    function renderConversation(conv) {
        const v = conv.vehicle;
        vehicleTitle.textContent = `${v.brand} ${v.model} ${v.year}`;
        vehicleMeta.textContent = `${v.transmission ?? ""} · ${v.fuel ?? ""} · ${Number(v.mileage ?? 0).toLocaleString("en-US")} km`;

        const lastMsg = conv.messages[conv.messages.length - 1];
        const pendiente = !lastMsg || lastMsg.role === "buyer";
        conversationStatus.textContent = pendiente ? "Pendiente" : "Respondida";

        buyerName.textContent = `${conv.buyer.name} ${conv.buyer.lastName}`;
        questionDate.textContent = conv.messages.length
            ? new Date(conv.messages[0].createdAt).toLocaleString("es-CR") : "-";
        answerDate.textContent = conv.messages.length > 1
            ? new Date(conv.messages[conv.messages.length - 1].createdAt).toLocaleString("es-CR") : "Sin respuesta";

        // ── Renderizar mensajes estilo chat ──
        messagesBox.innerHTML = "";

        conv.messages.forEach((msg) => {
            const isMine = msg.sender._id === currentUserId || msg.sender._id?.toString() === currentUserId;
            const article = document.createElement("article");
            article.className = `message-card ${msg.role === "buyer" ? "message-question" : "message-answer"}`;
            article.innerHTML = `
        <span class="message-role">${msg.role === "buyer" ? conv.buyer.name : conv.owner.name}</span>
        <p>${msg.text}</p>
        <small>${new Date(msg.createdAt).toLocaleString("es-CR")}</small>
      `;
            messagesBox.appendChild(article);
        });

        // Scroll al final
        messagesBox.scrollTop = messagesBox.scrollHeight;

        // ── Mostrar form solo si le toca al usuario actual ──
        const isOwner = conv.owner._id === currentUserId || conv.owner._id?.toString() === currentUserId;
        const isBuyer = conv.buyer._id === currentUserId || conv.buyer._id?.toString() === currentUserId;
        const myRole = isOwner ? "owner" : "buyer";
        const canSend = !lastMsg || lastMsg.role !== myRole;

        if (canSend) {
            answerForm.classList.remove("hidden");
            answerText.placeholder = isOwner
                ? "Escribe tu respuesta al comprador..."
                : "Escribe tu siguiente mensaje...";
        } else {
            answerForm.classList.add("hidden");
            formMessage.textContent = "Esperá la respuesta del otro usuario antes de enviar otro mensaje.";
            formMessage.classList.remove("hidden", "success", "error");
        }
    }

    answerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const text = answerText.value.trim();
        if (!text) { showMessage("Escribe un mensaje antes de enviarlo.", "error"); return; }

        // Determinar si es owner o buyer
        const { res: convRes, data: convData } = await apiFetch(`/api/inbox/conversation/${vehicleId}/${buyerId}`);
        if (!convRes.ok) { showMessage("Error al verificar conversación.", "error"); return; }

        const isOwner = convData.owner._id === currentUserId || convData.owner._id?.toString() === currentUserId;

        let endpoint, body;
        if (isOwner) {
            endpoint = `/api/inbox/${vehicleId}/reply`;
            body = JSON.stringify({ text, buyerId });
        } else {
            endpoint = `/api/inbox/${vehicleId}/message`;
            body = JSON.stringify({ text });
        }

        const { res, data } = await apiFetch(endpoint, { method: "POST", body });

        if (!res.ok) {
            showMessage(data.message || "Error al enviar el mensaje.", "error");
            return;
        }

        answerText.value = "";
        formMessage.classList.add("hidden");
        await loadConversation();
    });

    logoutLink.addEventListener("click", (e) => {
        e.preventDefault();
        clearToken();
        window.location.href = "../auth/login.html";
    });

    await loadConversation();
});
