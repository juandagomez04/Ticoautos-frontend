import { requireAuth } from "../guards/requireAuth.js";
import { clearToken } from "../core/storage.js";

document.addEventListener("DOMContentLoaded", async () => {
    const logoutLink = document.getElementById("logoutLink");
    const searchConversation = document.getElementById("searchConversation");
    const statusFilter = document.getElementById("statusFilter");
    const conversationList = document.getElementById("conversationList");
    const emptyState = document.getElementById("emptyState");

    function seedConversations() {
        const existing = JSON.parse(sessionStorage.getItem("ticoConversations") || "[]");
        if (existing.length) return existing;

        const mock = [
            {
                id: 1,
                vehicleId: 101,
                vehicleTitle: "Toyota Corolla 2020",
                vehicleMeta: "Automática · Gasolina · 52,000 km",
                buyerName: "María López",
                question: "¿El precio es negociable y tiene marchamo al día?",
                answer: "",
                questionDate: "2026-03-13 10:30",
                answerDate: "",
                status: "pendiente"
            },
            {
                id: 2,
                vehicleId: 102,
                vehicleTitle: "Hyundai Tucson 2019",
                vehicleMeta: "Automática · Diesel · 73,000 km",
                buyerName: "Carlos Rojas",
                question: "¿Acepta revisión mecánica antes de cerrar trato?",
                answer: "Sí, no hay problema. Podemos coordinar una revisión esta semana.",
                questionDate: "2026-03-12 15:10",
                answerDate: "2026-03-12 18:20",
                status: "respondida"
            },
            {
                id: 3,
                vehicleId: 103,
                vehicleTitle: "Nissan Sentra 2020",
                vehicleMeta: "Automática · Gasolina · 48,000 km",
                buyerName: "Andrea Vargas",
                question: "¿Cuántos dueños ha tenido el vehículo?",
                answer: "",
                questionDate: "2026-03-14 09:45",
                answerDate: "",
                status: "pendiente"
            }
        ];

        sessionStorage.setItem("ticoConversations", JSON.stringify(mock));
        return mock;
    }

    let conversations = seedConversations();

    function renderList(items) {
        conversationList.innerHTML = "";

        if (!items.length) {
            emptyState.classList.remove("hidden");
            return;
        }

        emptyState.classList.add("hidden");

        items.forEach((item) => {
            const article = document.createElement("article");
            article.className = "card inbox-item";

            article.innerHTML = `
                <div class="inbox-item-top">
                    <div>
                        <span class="badge ${item.status === "respondida" ? "badge-success" : "badge-warning"}">
                            ${item.status === "respondida" ? "Respondida" : "Pendiente"}
                        </span>
                        <h3>${item.vehicleTitle}</h3>
                        <p>${item.vehicleMeta}</p>
                    </div>

                    <a href="./inbox.conversation.html?id=${item.id}" class="btn btn-primary">
                        Ver conversación
                    </a>
                </div>

                <div class="inbox-item-body">
                    <p><strong>Comprador:</strong> ${item.buyerName}</p>
                    <p><strong>Pregunta:</strong> ${item.question}</p>
                    <p><strong>Fecha:</strong> ${item.questionDate}</p>
                </div>
            `;

            conversationList.appendChild(article);
        });
    }

    function applyFilters() {
        const searchValue = searchConversation.value.toLowerCase().trim();
        const statusValue = statusFilter.value.trim();

        const filtered = conversations.filter((item) => {
            const matchesSearch =
                !searchValue ||
                item.vehicleTitle.toLowerCase().includes(searchValue) ||
                item.buyerName.toLowerCase().includes(searchValue);

            const matchesStatus = !statusValue || item.status === statusValue;

            return matchesSearch && matchesStatus;
        });

        renderList(filtered);
    }

    searchConversation.addEventListener("input", applyFilters);
    statusFilter.addEventListener("change", applyFilters);

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

    renderList(conversations);
});