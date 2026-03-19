// vehicle.detail.js
document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const vehicleId = params.get("id");
    const token = localStorage.getItem("token");

    function getUserIdFromToken(t) {
        try { return JSON.parse(atob(t.split(".")[1])).id; }
        catch { return null; }
    }

    const currentUserId = token ? getUserIdFromToken(token) : null;

    // ── Navbar según sesión ──
    const loginLink = document.querySelector('a[href="../auth/login.html"]');
    const registerBtn = document.querySelector('a[href="../auth/register.html"].btn');

    if (token && loginLink && registerBtn) {
        loginLink.textContent = "Dashboard";
        loginLink.href = "../dashboard/dashboard.html";
        registerBtn.textContent = "Cerrar sesión";
        registerBtn.href = "#";
        registerBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("token");
            localStorage.removeItem("userName");
            window.location.href = "./home.html";
        });
    }

    // ── Cargar vehículo ──
    async function loadVehicle() {
        if (!vehicleId) {
            document.querySelector(".detail-layout").innerHTML =
                "<p style='color:red;padding:2rem'>No se indicó el vehículo.</p>";
            return;
        }
        try {
            const res = await fetch(`http://localhost:3001/api/vehicles/${vehicleId}`);
            const v = await res.json();
            if (!res.ok) {
                document.querySelector(".detail-layout").innerHTML =
                    "<p style='color:red;padding:2rem'>Vehículo no encontrado.</p>";
                return;
            }
            renderVehicle(v);
        } catch (e) {
            document.querySelector(".detail-layout").innerHTML =
                "<p style='color:red;padding:2rem'>No se pudo conectar con el servidor.</p>";
        }
    }

    function renderVehicle(v) {
        // ── Galería ──
        const mainImage = document.getElementById("mainImage");
        if (v.images && v.images.length > 0) {
            mainImage.style.backgroundImage = `url('${v.images[0]}')`;
            mainImage.style.backgroundSize = "cover";
            mainImage.style.backgroundPosition = "center";
            mainImage.innerHTML = "";
        }

        // ── Header ──
        document.getElementById("vehicleTitle").textContent = `${v.brand} ${v.model} ${v.year}`;
        document.getElementById("vehicleSubtitle").textContent =
            `${v.transmission} · ${v.fuel} · ${Number(v.mileage).toLocaleString("en-US")} km`;
        document.getElementById("vehiclePrice").textContent = `$${Number(v.price).toLocaleString("en-US")}`;

        const badge = document.querySelector(".title-block .badge");
        badge.textContent = v.status.charAt(0).toUpperCase() + v.status.slice(1);
        badge.className = `badge ${v.status === "disponible" ? "badge-success" : v.status === "reservado" ? "badge-warning" : "badge-danger"}`;

        // ── Descripción ──
        document.getElementById("vehicleDescription").textContent = v.description;

        // ── Ficha técnica ──
        const specs = document.querySelectorAll(".spec-item strong");
        const specData = [v.brand, v.model, v.year, v.transmission, v.fuel,
        `${Number(v.mileage).toLocaleString("en-US")} km`, v.color, v.status];
        specs.forEach((el, i) => { if (specData[i] !== undefined) el.textContent = specData[i]; });

        // ── Propietario ──
        if (v.owner) {
            const initials = `${v.owner.name?.[0] ?? ""}${v.owner.lastName?.[0] ?? ""}`.toUpperCase();
            document.querySelector(".owner-avatar").textContent = initials;
            document.querySelector(".owner-info h3").textContent = `${v.owner.name} ${v.owner.lastName}`;
        }

        const ownerId = v.owner?._id?.toString() ?? v.owner?.toString();
        const isOwner = currentUserId && currentUserId === ownerId;
        const isReserver = v.reservedBy && v.reservedBy.toString() === currentUserId;

        renderSideSection(v, isOwner, isReserver);
    }

    // ── Sección lateral (preguntas + compra) ──
    async function renderSideSection(v, isOwner, isReserver) {
        const ownerActions = document.querySelector(".owner-actions");

        if (!token) {
            // Sin sesión
            ownerActions.innerHTML = `
                <a href="../auth/login.html" class="btn btn-primary">Iniciar sesión para interactuar</a>
                <button type="button" class="btn btn-secondary" id="shareBtn">Compartir</button>
            `;
        } else if (isOwner) {
            ownerActions.innerHTML = `
                <a href="../dashboard/inbox.list.html" class="btn btn-primary">Ver preguntas en inbox</a>
                <button type="button" class="btn btn-secondary" id="shareBtn">Compartir</button>
            `;

            // Si está reservado, mostrar acciones del propietario
            if (v.status === "reservado") {
                const ownerCard = document.querySelector(".owner-card");
                const actionCard = document.createElement("div");
                actionCard.className = "card";
                actionCard.style.cssText = "padding:20px;margin-top:0;";
                actionCard.innerHTML = `
                <h2 style="margin-bottom:10px;">Reserva pendiente</h2>
                <p style="color:#94a3b8;margin-bottom:14px;">Un comprador ha reservado este vehículo. ¿Confirmás la venta?</p>
                <button type="button" id="confirmSaleBtn" class="btn btn-primary" style="width:100%;margin-bottom:10px;">
                    ✓ Confirmar venta
                </button>
                <button type="button" id="rejectReserveBtn" class="btn btn-secondary" style="width:100%;">
                    ✕ Rechazar reserva
                </button>
                <p id="saleMsg" style="margin-top:10px;font-size:0.9rem;display:none;"></p>
            `;
                ownerCard.insertAdjacentElement("afterend", actionCard);

                document.getElementById("confirmSaleBtn").addEventListener("click", async () => {
                    const res = await fetch(`http://localhost:3001/api/vehicles/${v._id}/status`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                        body: JSON.stringify({ status: "vendido" }),
                    });
                    if (res.ok) window.location.reload();
                    else {
                        const data = await res.json();
                        const msg = document.getElementById("saleMsg");
                        msg.style.display = "block";
                        msg.style.color = "#fca5a5";
                        msg.textContent = data.message || "Error al confirmar la venta.";
                    }
                });

                document.getElementById("rejectReserveBtn").addEventListener("click", async () => {
                    const res = await fetch(`http://localhost:3001/api/vehicles/${v._id}/status`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                        body: JSON.stringify({ status: "disponible" }),
                    });
                    if (res.ok) window.location.reload();
                });
            }
        } else {
            ownerActions.innerHTML = `
                <button type="button" class="btn btn-secondary" id="shareBtn">Compartir</button>
            `;

            const ownerCard = document.querySelector(".owner-card");

            // ── Tarjeta de compra ──
            const buyCard = document.createElement("div");
            buyCard.className = "card";
            buyCard.style.cssText = "padding:20px;margin-top:0;";
            buyCard.id = "buyCard";
            buyCard.innerHTML = renderBuyCard(v, isReserver);
            ownerCard.insertAdjacentElement("afterend", buyCard);

            attachBuyListeners(v, isReserver);

            // ── Tarjeta de preguntas ──
            let existingConv = null;
            try {
                const res = await fetch(`http://localhost:3001/api/inbox/conversation/${v._id}/${currentUserId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) existingConv = await res.json();
            } catch { }

            const askCard = document.createElement("div");
            askCard.className = "card";
            askCard.style.cssText = "padding:20px;margin-top:0;";

            if (existingConv) {
                askCard.innerHTML = `
                    <h2 style="margin-bottom:12px;">Tu conversación</h2>
                    <p style="color:#94a3b8;margin-bottom:14px;">Ya tenés una conversación activa sobre este vehículo.</p>
                    <a href="../dashboard/inbox.conversation.html?vehicleId=${v._id}&buyerId=${currentUserId}"
                        class="btn btn-primary" style="width:100%;text-align:center;display:block;">
                        Ver conversación
                    </a>
                `;
            } else {
                askCard.innerHTML = `
                    <h2 style="margin-bottom:12px;">Hacer una pregunta</h2>
                    <textarea id="questionText" placeholder="¿Tiene marchamo al día? ¿Es negociable el precio?"
                        style="width:100%;min-height:100px;border:1px solid #334155;border-radius:12px;padding:10px;
                        background:#0f172a;color:#e2e8f0;font:inherit;resize:vertical;"></textarea>
                    <button type="button" id="sendQuestionBtn" class="btn btn-primary"
                        style="margin-top:10px;width:100%;">Enviar pregunta</button>
                    <p id="questionMsg" style="margin-top:10px;font-size:0.9rem;display:none;"></p>
                `;
                buyCard.insertAdjacentElement("afterend", askCard);
                attachAskListeners(v._id);
                return;
            }

            buyCard.insertAdjacentElement("afterend", askCard);
        }

        attachShareListener();
    }

    function renderBuyCard(v, isReserver) {
        if (v.status === "vendido") {
            return `
                <h2 style="margin-bottom:10px;">Estado de compra</h2>
                <p style="color:#94a3b8;margin-bottom:14px;">Este vehículo ya fue vendido.</p>
                <div style="padding:10px 14px;border-radius:10px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);color:#fca5a5;font-weight:600;text-align:center;">
                    Vendido
                </div>
            `;
        }

        if (v.status === "reservado" && !isReserver) {
            return `
                <h2 style="margin-bottom:10px;">Estado de compra</h2>
                <p style="color:#94a3b8;margin-bottom:14px;">Este vehículo ya está reservado por otro comprador.</p>
                <div style="padding:10px 14px;border-radius:10px;background:rgba(234,179,8,0.1);border:1px solid rgba(234,179,8,0.25);color:#fde047;font-weight:600;text-align:center;">
                    Reservado
                </div>
            `;
        }

        if (v.status === "reservado" && isReserver) {
            return `
                <h2 style="margin-bottom:10px;">Tu reserva</h2>
                <p style="color:#94a3b8;margin-bottom:14px;">Tenés este vehículo reservado. El vendedor confirmará la venta.</p>
                <div style="padding:10px 14px;border-radius:10px;background:rgba(234,179,8,0.1);border:1px solid rgba(234,179,8,0.25);color:#fde047;font-weight:600;text-align:center;margin-bottom:12px;">
                    Reservado por vos
                </div>
                <button type="button" id="cancelReserveBtn" class="btn btn-secondary" style="width:100%;">
                    Cancelar reserva
                </button>
                <p id="buyMsg" style="margin-top:10px;font-size:0.9rem;display:none;"></p>
            `;
        }

        // Disponible
        return `
            <h2 style="margin-bottom:10px;">¿Te interesa este vehículo?</h2>
            <p style="color:#94a3b8;margin-bottom:14px;">Podés reservarlo para que el vendedor lo aparte para vos.</p>
            <button type="button" id="reserveBtn" class="btn btn-primary" style="width:100%;">
                Reservar vehículo
            </button>
            <p id="buyMsg" style="margin-top:10px;font-size:0.9rem;display:none;"></p>
        `;
    }

    function attachBuyListeners(v, isReserver) {
        const reserveBtn = document.getElementById("reserveBtn");
        const cancelBtn = document.getElementById("cancelReserveBtn");
        const buyMsg = document.getElementById("buyMsg");

        async function doReserve(action) {
            const res = await fetch(`http://localhost:3001/api/vehicles/${v._id}/reserve`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ action }),
            });
            const data = await res.json();

            if (res.ok) {
                // Recargar para reflejar el nuevo estado
                window.location.reload();
            } else {
                if (buyMsg) {
                    buyMsg.style.display = "block";
                    buyMsg.style.color = "#fca5a5";
                    buyMsg.textContent = data.message || "Error al procesar la solicitud.";
                }
            }
        }

        if (reserveBtn) reserveBtn.addEventListener("click", () => doReserve("reservar"));
        if (cancelBtn) cancelBtn.addEventListener("click", () => doReserve("cancelar"));
    }

    function attachAskListeners(vehicleId) {
        const sendBtn = document.getElementById("sendQuestionBtn");
        if (!sendBtn) return;

        sendBtn.addEventListener("click", async () => {
            const text = document.getElementById("questionText").value.trim();
            const msg = document.getElementById("questionMsg");

            if (!text) {
                msg.style.display = "block";
                msg.style.color = "#f87171";
                msg.textContent = "Escribe una pregunta antes de enviar.";
                return;
            }

            const res = await fetch(`http://localhost:3001/api/inbox/${vehicleId}/message`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ text }),
            });

            const data = await res.json();
            msg.style.display = "block";

            if (res.ok) {
                msg.style.color = "#86efac";
                msg.textContent = "Pregunta enviada. Redirigiendo...";
                setTimeout(() => {
                    window.location.href = `../dashboard/inbox.conversation.html?vehicleId=${vehicleId}&buyerId=${currentUserId}`;
                }, 1200);
            } else {
                msg.style.color = "#f87171";
                msg.textContent = data.message || "Error al enviar la pregunta.";
            }
        });
    }

    function attachShareListener() {
        setTimeout(() => {
            const btn = document.getElementById("shareBtn");
            if (btn) {
                btn.addEventListener("click", async () => {
                    try {
                        await navigator.clipboard.writeText(window.location.href);
                        document.getElementById("shareMessage").classList.remove("hidden");
                        setTimeout(() => document.getElementById("shareMessage").classList.add("hidden"), 2000);
                    } catch (e) { console.error("No se pudo copiar:", e); }
                });
            }
        }, 0);
    }

    // ── Galería: thumbs ──
    document.querySelectorAll(".thumb").forEach((thumb) => {
        thumb.addEventListener("click", () => {
            document.querySelectorAll(".thumb").forEach((t) => t.classList.remove("active"));
            thumb.classList.add("active");
            const mainImage = document.getElementById("mainImage");
            mainImage.classList.remove("image-1", "image-2", "image-3", "image-4");
            mainImage.classList.add(`image-${thumb.dataset.image}`);
        });
    });

    await loadVehicle();
});
