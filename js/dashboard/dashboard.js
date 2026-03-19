import { requireAuth } from "../guards/requireAuth.js";
import { clearToken, getToken } from "../core/storage.js";
import { apiFetch } from "../core/http.js";

document.addEventListener("DOMContentLoaded", async () => {
    const ok = await requireAuth();
    if (!ok) return;

    const logoutLink = document.getElementById("logoutLink");
    const userName = document.getElementById("userName");
    const publishedCount = document.getElementById("publishedCount");
    const availableCount = document.getElementById("availableCount");
    const soldCount = document.getElementById("soldCount");
    const messagesCount = document.getElementById("messagesCount");

    // ── Nombre del usuario desde el token ──
    function getUserNameFromToken() {
        try {
            const token = getToken();
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.name || payload.email || "Usuario";
        } catch { return "Usuario"; }
    }

    userName.textContent = getUserNameFromToken();

    // ── Cargar estadísticas reales desde el backend ──
    async function loadStats() {
        try {
            const [vehiclesRes, inboxOwnerRes, inboxBuyerRes] = await Promise.all([
                apiFetch("/api/vehicles/my"),
                apiFetch("/api/inbox/my"),
                apiFetch("/api/inbox/bought"),
            ]);

            // Stats de vehículos
            if (vehiclesRes.res.ok) {
                const vehicles = vehiclesRes.data;
                publishedCount.textContent = vehicles.length;
                availableCount.textContent = vehicles.filter(v => v.status === "disponible").length;
                soldCount.textContent = vehicles.filter(v => v.status === "vendido").length;

                // Última publicación
                if (vehicles.length > 0) {
                    const last = vehicles[0];
                    const lastPub = document.getElementById("lastPublication");
                    if (lastPub) lastPub.textContent = `${last.brand} ${last.model} ${last.year}`;
                }

                // Disponibles badge
                const availBadge = document.getElementById("availableBadge");
                if (availBadge) availBadge.textContent = vehicles.filter(v => v.status === "disponible").length;
            }

            // Mensajes pendientes como propietario
            let pendingCount = 0;
            if (inboxOwnerRes.res.ok) {
                const ownerConvs = inboxOwnerRes.data;
                pendingCount += ownerConvs.filter(c => {
                    const last = c.messages[c.messages.length - 1];
                    return !last || last.role === "buyer";
                }).length;

                // Última consulta
                if (ownerConvs.length > 0) {
                    const lastMsg = ownerConvs[0].messages[ownerConvs[0].messages.length - 1];
                    const lastQuery = document.getElementById("lastQuery");
                    if (lastQuery && lastMsg) {
                        const diff = Math.floor((Date.now() - new Date(lastMsg.createdAt).getTime()) / 60000);
                        lastQuery.textContent = diff < 60 ? `Hace ${diff} min`
                            : diff < 1440 ? `Hace ${Math.floor(diff / 60)} h`
                                : `Hace ${Math.floor(diff / 1440)} días`;
                    }
                }
            }

            // Mensajes pendientes como comprador
            if (inboxBuyerRes.res.ok) {
                pendingCount += inboxBuyerRes.data.filter(c => {
                    const last = c.messages[c.messages.length - 1];
                    return last && last.role === "owner";
                }).length;
            }

            messagesCount.textContent = pendingCount;

            // Badge mensajes
            const msgBadge = document.getElementById("messagesBadge");
            if (msgBadge) {
                msgBadge.textContent = pendingCount;
                msgBadge.className = `badge ${pendingCount > 0 ? "badge-warning" : "badge-success"}`;
            }

        } catch (e) {
            console.error("Error cargando estadísticas:", e);
        }
    }

    logoutLink.addEventListener("click", (e) => {
        e.preventDefault();
        clearToken();
        window.location.href = "../auth/login.html";
    });

    await loadStats();
});
