import { requireAuth } from "../guards/requireAuth.js";
import { clearToken } from "../core/storage.js";

document.addEventListener("DOMContentLoaded", async () => {
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
    const conversationId = Number(params.get("id"));

    function showMessage(text, type) {
        formMessage.textContent = text;
        formMessage.classList.remove("hidden", "success", "error");
        formMessage.classList.add(type);
    }

    function getConversations() {
        return JSON.parse(sessionStorage.getItem("ticoConversations") || "[]");
    }

    function saveConversations(data) {
        sessionStorage.setItem("ticoConversations", JSON.stringify(data));
    }

    function renderConversation(item) {
        if (!item) {
            messagesBox.innerHTML = `
                <div class="message-card message-system">
                    <p>No se encontró la conversación solicitada.</p>
                </div>
            `;
            answerForm.classList.add("hidden");
            return;
        }

        vehicleTitle.textContent = item.vehicleTitle;
        vehicleMeta.textContent = item.vehicleMeta;
        conversationStatus.textContent = item.status === "respondida" ? "Respondida" : "Pendiente";
        buyerName.textContent = item.buyerName;
        questionDate.textContent = item.questionDate;
        answerDate.textContent = item.answerDate || "Sin respuesta";

        messagesBox.innerHTML = `
            <article class="message-card message-question">
                <span class="message-role">Comprador</span>
                <p>${item.question}</p>
                <small>${item.questionDate}</small>
            </article>
        `;

        if (item.answer) {
            messagesBox.innerHTML += `
                <article class="message-card message-answer">
                    <span class="message-role">Propietario</span>
                    <p>${item.answer}</p>
                    <small>${item.answerDate}</small>
                </article>
            `;
            answerForm.classList.add("hidden");
        } else {
            answerForm.classList.remove("hidden");
        }
    }

    answerForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const text = answerText.value.trim();
        if (!text) {
            showMessage("Escribe una respuesta antes de enviarla.", "error");
            return;
        }

        const conversations = getConversations();
        const index = conversations.findIndex((item) => item.id === conversationId);

        if (index === -1) {
            showMessage("No se encontró la conversación.", "error");
            return;
        }

        const now = new Date();
        const formatted = now.toLocaleString("es-CR");

        conversations[index].answer = text;
        conversations[index].answerDate = formatted;
        conversations[index].status = "respondida";

        saveConversations(conversations);
        renderConversation(conversations[index]);
        showMessage("Respuesta enviada correctamente.", "success");
    });

    logoutLink.addEventListener("click", (event) => {
        event.preventDefault();
        clearToken();
        sessionStorage.removeItem("userName");
        window.location.href = "../auth/login.html";
    });

    try {
        const ok = await requireAuth();
        if (!ok) return;
    } catch (error) {
        console.error("Error en requireAuth:", error);
    }

    const conversations = getConversations();
    const current = conversations.find((item) => item.id === conversationId);
    renderConversation(current);
});