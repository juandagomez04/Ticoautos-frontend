// home.js — carga vehículos desde el backend con filtros y paginación
document.addEventListener("DOMContentLoaded", async () => {
    const brandInput = document.getElementById("brand");
    const modelInput = document.getElementById("model");
    const minYearInput = document.getElementById("minYear");
    const maxPriceInput = document.getElementById("maxPrice");
    const statusInput = document.getElementById("status");
    const clearFiltersBtn = document.getElementById("clearFiltersBtn");
    const vehicleGrid = document.getElementById("vehicleGrid");
    const resultsText = document.getElementById("resultsText");
    const emptyState = document.getElementById("emptyState");

    let currentPage = 1;
    const LIMIT = 6;
    let allBrandsLoaded = false;

    // ── Navbar según sesión ──
    const token = localStorage.getItem("token");
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
            window.location.reload();
        });
    }

    // ── Poblar select de marcas dinámicamente ──
    function populateBrands(vehicles) {
        if (allBrandsLoaded) return;
        const brands = [...new Set(vehicles.map((v) => v.brand))].sort();
        const currentVal = brandInput.value;
        brandInput.innerHTML = '<option value="">Todas</option>';
        brands.forEach((brand) => {
            const opt = document.createElement("option");
            opt.value = brand;
            opt.textContent = brand;
            brandInput.appendChild(opt);
        });
        if (currentVal) brandInput.value = currentVal;
        allBrandsLoaded = true;
    }

    // ── Actualizar hero card ──
    function updateHero(vehicles) {
        const featured = vehicles.find((v) => v.status === "disponible") || vehicles[0];
        if (!featured) return;
        const heroCard = document.querySelector(".hero-car-card");
        if (!heroCard) return;
        heroCard.querySelector("h3").textContent = `${featured.brand} ${featured.model} ${featured.year}`;
        heroCard.querySelector("p").textContent = `${featured.transmission} · ${featured.fuel} · ${Number(featured.mileage).toLocaleString("en-US")} km`;
        heroCard.querySelector("strong").textContent = `$${Number(featured.price).toLocaleString("en-US")}`;
        heroCard.style.cursor = "pointer";
        heroCard.onclick = () => { window.location.href = `./vehicle.detail.html?id=${featured._id}`; };
    }

    // ── Construir query string ──
    function buildQuery(page) {
        const params = new URLSearchParams();
        if (brandInput.value) params.set("brand", brandInput.value);
        if (modelInput.value.trim()) params.set("model", modelInput.value.trim());
        if (minYearInput.value) params.set("minYear", minYearInput.value);
        if (maxPriceInput.value) params.set("maxPrice", maxPriceInput.value);
        if (statusInput && statusInput.value) params.set("status", statusInput.value);
        params.set("page", page);
        params.set("limit", LIMIT);
        return params.toString();
    }

    // ── Cargar vehículos ──
    async function loadVehicles(page = 1) {
        currentPage = page;
        vehicleGrid.innerHTML = "<p style='color:#94a3b8;padding:1rem'>Cargando...</p>";
        removePagination();

        const query = buildQuery(page);
        const url = `http://localhost:3001/api/vehicles?${query}`;

        try {
            const res = await fetch(url);
            const data = await res.json();

            if (!res.ok) {
                vehicleGrid.innerHTML = "<p style='color:red;padding:1rem'>Error al cargar vehículos.</p>";
                return;
            }

            const vehicles = data.vehicles ?? data;
            const total = data.total ?? vehicles.length;
            const totalPages = data.totalPages ?? 1;

            if (page === 1 && !buildQuery(page).includes("brand=") && !buildQuery(page).includes("model=")) {
                populateBrands(vehicles);
                updateHero(vehicles);
            }

            renderGrid(vehicles, total, page, totalPages);
        } catch (e) {
            vehicleGrid.innerHTML = "<p style='color:red;padding:1rem'>No se pudo conectar con el servidor.</p>";
        }
    }

    // ── Renderizar tarjetas ──
    function renderGrid(vehicles, total, page, totalPages) {
        vehicleGrid.innerHTML = "";

        if (!vehicles.length) {
            emptyState.classList.remove("hidden");
            resultsText.textContent = "Mostrando 0 vehículos disponibles.";
            return;
        }

        emptyState.classList.add("hidden");
        const from = (page - 1) * LIMIT + 1;
        const to = Math.min(page * LIMIT, total);
        resultsText.textContent = `Mostrando ${from}–${to} de ${total} vehículo${total === 1 ? "" : "s"}.`;

        vehicles.forEach((v) => {
            const badgeClass =
                v.status === "disponible" ? "badge-success" :
                    v.status === "reservado" ? "badge-warning" : "badge-danger";
            const badgeLabel = v.status.charAt(0).toUpperCase() + v.status.slice(1);
            const imageStyle = v.images && v.images.length > 0
                ? `background-image: url('${v.images[0]}'); background-size: cover; background-position: center;`
                : "";

            const article = document.createElement("article");
            article.className = "vehicle-card card";
            article.innerHTML = `
                <div class="vehicle-image" style="${imageStyle}"></div>
                <div class="vehicle-body">
                <span class="badge ${badgeClass}">${badgeLabel}</span>
                <h3>${v.brand} ${v.model} ${v.year}</h3>
                <p>${v.transmission} · ${v.fuel} · ${Number(v.mileage).toLocaleString("en-US")} km</p>
                <div class="vehicle-footer">
                    <strong>$${Number(v.price).toLocaleString("en-US")}</strong>
                    <a href="./vehicle.detail.html?id=${v._id}" class="btn btn-primary">Ver detalle</a>
                </div>
                </div>
            `;
            vehicleGrid.appendChild(article);
        });

        renderPagination(page, totalPages);
    }

    // ── Paginación ──
    function removePagination() {
        const existing = document.getElementById("pagination");
        if (existing) existing.remove();
    }

    function renderPagination(page, totalPages) {
        removePagination();
        if (totalPages <= 1) return;

        const nav = document.createElement("div");
        nav.id = "pagination";
        nav.style.cssText = "display:flex;justify-content:center;align-items:center;gap:8px;margin-top:1.5rem;flex-wrap:wrap;";

        // Botón anterior
        const prevBtn = document.createElement("button");
        prevBtn.textContent = "← Anterior";
        prevBtn.className = "btn btn-secondary";
        prevBtn.disabled = page === 1;
        prevBtn.style.opacity = page === 1 ? "0.4" : "1";
        prevBtn.addEventListener("click", () => loadVehicles(page - 1));
        nav.appendChild(prevBtn);

        // Números de página
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement("button");
            btn.textContent = i;
            btn.className = i === page ? "btn btn-primary" : "btn btn-secondary";
            btn.style.minWidth = "40px";
            btn.addEventListener("click", () => loadVehicles(i));
            nav.appendChild(btn);
        }

        // Botón siguiente
        const nextBtn = document.createElement("button");
        nextBtn.textContent = "Siguiente →";
        nextBtn.className = "btn btn-secondary";
        nextBtn.disabled = page === totalPages;
        nextBtn.style.opacity = page === totalPages ? "0.4" : "1";
        nextBtn.addEventListener("click", () => loadVehicles(page + 1));
        nav.appendChild(nextBtn);

        vehicleGrid.insertAdjacentElement("afterend", nav);
    }

    // ── Filtros con debounce ──
    let debounceTimer;
    function onFilterChange() {
        clearTimeout(debounceTimer);
        allBrandsLoaded = false;
        debounceTimer = setTimeout(() => loadVehicles(1), 350);
    }

    function clearFilters() {
        brandInput.value = "";
        modelInput.value = "";
        minYearInput.value = "";
        maxPriceInput.value = "";
        if (statusInput) statusInput.value = "";
        allBrandsLoaded = false;
        loadVehicles(1);
    }

    brandInput.addEventListener("change", onFilterChange);
    modelInput.addEventListener("input", onFilterChange);
    minYearInput.addEventListener("input", onFilterChange);
    maxPriceInput.addEventListener("input", onFilterChange);
    if (statusInput) statusInput.addEventListener("change", onFilterChange);
    clearFiltersBtn.addEventListener("click", clearFilters);

    await loadVehicles(1);
});
