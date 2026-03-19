import { requireAuth } from "../guards/requireAuth.js";
import { clearToken, getToken } from "../core/storage.js";
import { apiFetch } from "../core/http.js";

document.addEventListener("DOMContentLoaded", async () => {
    const ok = await requireAuth();
    if (!ok) return;

    const logoutLink = document.getElementById("logoutLink");
    const searchConversation = document.getElementById("searchConversation");
    const statusFilter = document.getElementById("statusFilter");
    const conversationList = document.getElementById("conversationList");
    const emptyState = document.getElementById("emptyState");

    let allConversations = [];

    // Obtener userId del token
    function getUserId() {
        try {
            const token = getToken();
            const payload = token.split(".")[1];
            return JSON.parse(atob(payload)).id;
        } catch { return null; }
    }

    const currentUserId = getUserId();

    async function loadInbox() {
        conversationList.innerHTML = "<p style='color:#475569;padding:1rem'>Cargando...</p>";

        // Cargar tanto las conversaciones donde soy propietario como donde soy comprador
        const [asOwner, asBuyer] = await Promise.all([
            apiFetch("/api/inbox/my"),
            apiFetch("/api/inbox/bought"),
        ]);

        const ownerConvs = asOwner.res.ok ? asOwner.data : [];
        const buyerConvs = asBuyer.res.ok ? asBuyer.data : [];

        // Combinar y eliminar duplicados por _id
        const combined = [...ownerConvs, ...buyerConvs];
        const seen = new Set();
        allConversations = combined.filter((c) => {
            if (seen.has(c._id)) return false;
            seen.add(c._id);
            return true;
        });

        applyFilters();
    }

    function renderList(items) {
        conversationList.innerHTML = "";

        if (!items.length) {
            emptyState.classList.remove("hidden");
            return;
        }

        emptyState.classList.add("hidden");

        items.forEach((conv) => {
            const lastMsg = conv.messages[conv.messages.length - 1];
            const isOwner = conv.owner._id === currentUserId || conv.owner._id?.toString() === currentUserId;
            const myRole = isOwner ? "owner" : "buyer";
            const pendiente = !lastMsg || lastMsg.role !== myRole;
            const badgeClass = pendiente ? "badge-warning" : "badge-success";
            const badgeLabel = pendiente ? "Pendiente" : "Respondida";

            const vehicleLabel = `${conv.vehicle.brand} ${conv.vehicle.model} ${conv.vehicle.year}`;
            const otherPerson = isOwner
                ? `${conv.buyer.name} ${conv.buyer.lastName}`
                : `${conv.owner.name} ${conv.owner.lastName}`;
            const otherLabel = isOwner ? "Comprador" : "Vendedor";
            const fecha = lastMsg ? new Date(lastMsg.createdAt).toLocaleString("es-CR") : "-";

            const article = document.createElement("article");
            article.className = "card inbox-item";

            article.innerHTML = `
                <div class="inbox-item-top">
                <div>
                    <span class="badge ${badgeClass}">${badgeLabel}</span>
                    <h3>${vehicleLabel}</h3>
                    <p>${conv.vehicle.transmission ?? ""} · ${conv.vehicle.fuel ?? ""}</p>
                </div>
                    <a href="./inbox.conversation.html?vehicleId=${conv.vehicle._id}&buyerId=${conv.buyer._id ?? conv.buyer}" class="btn btn-primary">Ver conversación</a   >
                </div>
                <div class="inbox-item-body">
                    <p><strong>${otherLabel}:</strong> ${otherPerson}</p>
                    <p><strong>Último mensaje:</strong> ${lastMsg ? lastMsg.text : "Sin mensajes"}</p>
                    <p><strong>Fecha:</strong> ${fecha}</p>
                </div>
            `;

            conversationList.appendChild(article);
        });
    }

    function applyFilters() {
        const search = searchConversation.value.toLowerCase().trim();
        const status = statusFilter.value.trim();

        const filtered = allConversations.filter((conv) => {
            const vehicleLabel = `${conv.vehicle.brand} ${conv.vehicle.model}`.toLowerCase();
            const buyerName = `${conv.buyer.name} ${conv.buyer.lastName}`.toLowerCase();
            const lastMsg = conv.messages[conv.messages.length - 1];
            const isOwner = conv.owner._id === currentUserId || conv.owner._id?.toString() === currentUserId;
            const myRole = isOwner ? "owner" : "buyer";
            const itemStatus = (!lastMsg || lastMsg.role !== myRole) ? "pendiente" : "respondida";

            const matchSearch = !search || vehicleLabel.includes(search) || buyerName.includes(search);
            const matchStatus = !status || itemStatus === status;

            return matchSearch && matchStatus;
        });

        renderList(filtered);
    }

    searchConversation.addEventListener("input", applyFilters);
    statusFilter.addEventListener("change", applyFilters);

    logoutLink.addEventListener("click", (e) => {
        e.preventDefault();
        clearToken();
        window.location.href = "../auth/login.html";
    });

    await loadInbox();
});
