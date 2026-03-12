import { requireAuth } from "../guards/requireAuth.js";
import { clearToken } from "../core/storage.js";

document.addEventListener("DOMContentLoaded", async () => {
    const ok = await requireAuth();
    if (!ok) return;

    const logoutLink = document.getElementById("logoutLink");
    const searchVehicle = document.getElementById("searchVehicle");
    const statusFilter = document.getElementById("statusFilter");
    const vehicleList = document.getElementById("vehicleList");
    const vehicleItems = Array.from(vehicleList.querySelectorAll(".vehicle-item"));
    const resultsInfo = document.getElementById("resultsInfo");
    const emptyState = document.getElementById("emptyState");

    function normalizeText(value) {
        return value.toLowerCase().trim();
    }

    function updateResults(count) {
        resultsInfo.textContent = `Mostrando ${count} vehículo${count === 1 ? "" : "s"}.`;

        if (count === 0) {
            emptyState.classList.remove("hidden");
        } else {
            emptyState.classList.add("hidden");
        }
    }

    function applyFilters() {
        const searchValue = normalizeText(searchVehicle.value);
        const statusValue = normalizeText(statusFilter.value);

        let visibleCount = 0;

        vehicleItems.forEach((item) => {
            const brand = normalizeText(item.dataset.brand || "");
            const model = normalizeText(item.dataset.model || "");
            const status = normalizeText(item.dataset.status || "");

            const matchesSearch =
                !searchValue ||
                brand.includes(searchValue) ||
                model.includes(searchValue);

            const matchesStatus = !statusValue || status === statusValue;

            const shouldShow = matchesSearch && matchesStatus;

            item.style.display = shouldShow ? "grid" : "none";

            if (shouldShow) visibleCount++;
        });

        updateResults(visibleCount);
    }

    function updateStatus(item, nextStatus) {
        const badge = item.querySelector(".badge");
        const button = item.querySelector(".status-btn");

        item.dataset.status = nextStatus;

        badge.classList.remove("badge-success", "badge-warning", "badge-danger");

        if (nextStatus === "disponible") {
            badge.textContent = "Disponible";
            badge.classList.add("badge-success");
            button.textContent = "Marcar vendido";
            button.dataset.nextStatus = "vendido";
        } else if (nextStatus === "reservado") {
            badge.textContent = "Reservado";
            badge.classList.add("badge-warning");
            button.textContent = "Marcar disponible";
            button.dataset.nextStatus = "disponible";
        } else if (nextStatus === "vendido") {
            badge.textContent = "Vendido";
            badge.classList.add("badge-danger");
            button.textContent = "Marcar disponible";
            button.dataset.nextStatus = "disponible";
        }

        applyFilters();
    }

    vehicleItems.forEach((item) => {
        const statusBtn = item.querySelector(".status-btn");
        const deleteBtn = item.querySelector(".delete-btn");

        statusBtn.addEventListener("click", () => {
            const nextStatus = statusBtn.dataset.nextStatus;
            updateStatus(item, nextStatus);
        });

        deleteBtn.addEventListener("click", () => {
            item.remove();
            applyFilters();
        });
    });

    searchVehicle.addEventListener("input", applyFilters);
    statusFilter.addEventListener("change", applyFilters);

    logoutLink.addEventListener("click", (event) => {
        event.preventDefault();
        clearToken();
        sessionStorage.removeItem("userName");
        window.location.href = "../auth/login.html";
    });

    applyFilters();
});