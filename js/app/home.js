document.addEventListener("DOMContentLoaded", () => {
    const brandInput = document.getElementById("brand");
    const modelInput = document.getElementById("model");
    const minYearInput = document.getElementById("minYear");
    const maxPriceInput = document.getElementById("maxPrice");
    const clearFiltersBtn = document.getElementById("clearFiltersBtn");

    const vehicleGrid = document.getElementById("vehicleGrid");
    const vehicleCards = Array.from(vehicleGrid.querySelectorAll(".vehicle-card"));
    const resultsText = document.getElementById("resultsText");
    const emptyState = document.getElementById("emptyState");

    function normalizeText(value) {
        return value.toLowerCase().trim();
    }

    function applyFilters() {
        const brandValue = normalizeText(brandInput.value);
        const modelValue = normalizeText(modelInput.value);
        const minYearValue = Number(minYearInput.value) || 0;
        const maxPriceValue = Number(maxPriceInput.value) || Infinity;

        let visibleCount = 0;

        vehicleCards.forEach((card) => {
            const brand = normalizeText(card.dataset.brand || "");
            const model = normalizeText(card.dataset.model || "");
            const year = Number(card.dataset.year || 0);
            const price = Number(card.dataset.price || 0);

            const matchesBrand = !brandValue || brand === brandValue;
            const matchesModel = !modelValue || model.includes(modelValue);
            const matchesYear = year >= minYearValue;
            const matchesPrice = price <= maxPriceValue;

            const shouldShow = matchesBrand && matchesModel && matchesYear && matchesPrice;

            card.style.display = shouldShow ? "block" : "none";

            if (shouldShow) {
                visibleCount++;
            }
        });

        resultsText.textContent = `Mostrando ${visibleCount} vehículo${visibleCount === 1 ? "" : "s"} disponibles.`;

        if (visibleCount === 0) {
            emptyState.classList.remove("hidden");
        } else {
            emptyState.classList.add("hidden");
        }
    }

    function clearFilters() {
        brandInput.value = "";
        modelInput.value = "";
        minYearInput.value = "";
        maxPriceInput.value = "";
        applyFilters();
    }

    brandInput.addEventListener("change", applyFilters);
    modelInput.addEventListener("input", applyFilters);
    minYearInput.addEventListener("input", applyFilters);
    maxPriceInput.addEventListener("input", applyFilters);
    clearFiltersBtn.addEventListener("click", clearFilters);

    applyFilters();
});