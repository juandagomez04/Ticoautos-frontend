import { requireAuth } from "../guards/requireAuth.js";
import { clearToken } from "../core/storage.js";
import { apiFetch } from "../core/http.js";

document.addEventListener("DOMContentLoaded", async () => {
    const ok = await requireAuth();
    if (!ok) return;

    const logoutLink = document.getElementById("logoutLink");
    const searchVehicle = document.getElementById("searchVehicle");
    const statusFilter = document.getElementById("statusFilter");
    const vehicleList = document.getElementById("vehicleList");
    const resultsInfo = document.getElementById("resultsInfo");
    const emptyState = document.getElementById("emptyState");

    let allVehicles = [];

    // ── Cargar vehículos del usuario desde el backend ──
    async function loadMyVehicles() {
        vehicleList.innerHTML = "<p style='color:var(--text-soft);padding:20px'>Cargando...</p>";

        const { res, data } = await apiFetch("/api/vehicles/my");

        if (!res.ok) {
            vehicleList.innerHTML = "<p style='color:red;padding:20px'>Error al cargar vehículos.</p>";
            return;
        }

        allVehicles = data;
        applyFilters();
    }

    // ── Renderizar tarjetas con la estructura exacta del HTML/CSS ──
    function renderList(vehicles) {
        vehicleList.innerHTML = "";

        if (vehicles.length === 0) {
            emptyState.classList.remove("hidden");
            resultsInfo.textContent = "Mostrando 0 vehículos.";
            return;
        }

        emptyState.classList.add("hidden");
        resultsInfo.textContent = `Mostrando ${vehicles.length} vehículo${vehicles.length === 1 ? "" : "s"}.`;

        vehicles.forEach((v) => {
            const badgeClass =
                v.status === "disponible" ? "badge-success" :
                    v.status === "reservado" ? "badge-warning" : "badge-danger";
            const badgeLabel = v.status.charAt(0).toUpperCase() + v.status.slice(1);
            const nextStatus = v.status === "disponible" ? "vendido" : "disponible";
            const nextLabel = v.status === "disponible" ? "Marcar vendido" : "Marcar disponible";

            const thumbStyle = v.images && v.images.length > 0
                ? `background-image: url('${v.images[0]}'); background-size: cover; background-position: center;`
                : "";

            const article = document.createElement("article");
            article.className = "vehicle-item card";
            article.dataset.brand = v.brand;
            article.dataset.model = v.model;
            article.dataset.status = v.status;

            article.innerHTML = `
        <div class="vehicle-thumb" style="${thumbStyle}"></div>

        <div class="vehicle-info">
          <div class="vehicle-title-row">
            <h2>${v.brand} ${v.model} ${v.year}</h2>
            <span class="badge ${badgeClass}">${badgeLabel}</span>
          </div>
          <p class="vehicle-meta">${v.transmission} · ${v.fuel} · ${Number(v.mileage).toLocaleString("en-US")} km</p>
          <p class="vehicle-price">$${Number(v.price).toLocaleString("en-US")}</p>
          <p class="vehicle-description">${v.description}</p>
        </div>

        <div class="vehicle-actions">
          <a href="./vehicle.edit.html?id=${v._id}" class="btn btn-secondary">Editar</a>
          <button type="button" class="btn btn-primary status-btn" data-id="${v._id}" data-next="${nextStatus}">${nextLabel}</button>
          <button type="button" class="btn btn-danger delete-btn" data-id="${v._id}">Eliminar</button>
        </div>
      `;

            // Cambiar estado
            article.querySelector(".status-btn").addEventListener("click", async (e) => {
                const { res } = await apiFetch(`/api/vehicles/${e.target.dataset.id}/status`, {
                    method: "PATCH",
                    body: JSON.stringify({ status: e.target.dataset.next }),
                });
                if (res.ok) await loadMyVehicles();
            });

            // Eliminar
            article.querySelector(".delete-btn").addEventListener("click", async (e) => {
                if (!confirm("¿Seguro que querés eliminar este vehículo?")) return;
                const { res } = await apiFetch(`/api/vehicles/${e.target.dataset.id}`, { method: "DELETE" });
                if (res.ok) await loadMyVehicles();
            });

            vehicleList.appendChild(article);
        });
    }

    // ── Filtros ──
    function applyFilters() {
        const search = searchVehicle.value.toLowerCase().trim();
        const status = statusFilter.value.toLowerCase().trim();

        const filtered = allVehicles.filter((v) => {
            const matchSearch = !search || v.brand.toLowerCase().includes(search) || v.model.toLowerCase().includes(search);
            const matchStatus = !status || v.status === status;
            return matchSearch && matchStatus;
        });

        renderList(filtered);
    }

    searchVehicle.addEventListener("input", applyFilters);
    statusFilter.addEventListener("change", applyFilters);

    logoutLink.addEventListener("click", (e) => {
        e.preventDefault();
        clearToken();
        sessionStorage.removeItem("userName");
        window.location.href = "../auth/login.html";
    });

    await loadMyVehicles();
});
