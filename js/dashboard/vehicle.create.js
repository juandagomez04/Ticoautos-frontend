import { requireAuth } from "../guards/requireAuth.js";
import { clearToken } from "../core/storage.js";
import { apiFetch } from "../core/http.js";

document.addEventListener("DOMContentLoaded", async () => {
    const ok = await requireAuth();
    if (!ok) return;

    const logoutLink = document.getElementById("logoutLink");
    const form = document.getElementById("vehicleCreateForm");
    const formMessage = document.getElementById("formMessage");
    const previewImage = document.getElementById("previewImage");

    const fields = {
        brand: document.getElementById("brand"),
        model: document.getElementById("model"),
        year: document.getElementById("year"),
        price: document.getElementById("price"),
        status: document.getElementById("status"),
        transmission: document.getElementById("transmission"),
        fuel: document.getElementById("fuel"),
        mileage: document.getElementById("mileage"),
        color: document.getElementById("color"),
        location: document.getElementById("location"),
        description: document.getElementById("description"),
        images: document.getElementById("images"),
    };

    const errors = {
        brand: document.getElementById("brandError"),
        model: document.getElementById("modelError"),
        year: document.getElementById("yearError"),
        price: document.getElementById("priceError"),
        status: document.getElementById("statusError"),
        transmission: document.getElementById("transmissionError"),
        fuel: document.getElementById("fuelError"),
        mileage: document.getElementById("mileageError"),
        color: document.getElementById("colorError"),
        location: document.getElementById("locationError"),
        description: document.getElementById("descriptionError"),
        images: document.getElementById("imagesError"),
    };

    const previewTitle = document.getElementById("previewTitle");
    const previewMeta = document.getElementById("previewMeta");
    const previewPrice = document.getElementById("previewPrice");
    const previewStatus = document.getElementById("previewStatus");

    let imageBase64 = "";

    function clearErrors() {
        Object.values(errors).forEach((e) => (e.textContent = ""));
        formMessage.textContent = "";
        formMessage.classList.add("hidden");
        formMessage.classList.remove("success", "error");
    }

    function showMessage(message, type) {
        formMessage.textContent = message;
        formMessage.classList.remove("hidden", "success", "error");
        formMessage.classList.add(type);
    }

    function updatePreview() {
        const brand = fields.brand.value.trim() || "Marca";
        const model = fields.model.value.trim() || "Modelo";
        const year = fields.year.value.trim() || "Año";
        const transmission = fields.transmission.value || "Transmisión";
        const fuel = fields.fuel.value || "Combustible";
        const mileage = fields.mileage.value ? `${fields.mileage.value} km` : "Kilometraje";
        const price = fields.price.value ? `$${Number(fields.price.value).toLocaleString()}` : "$0";
        const status = fields.status.value || "Estado";

        previewTitle.textContent = `${brand} ${model} ${year}`;
        previewMeta.textContent = `${transmission} · ${fuel} · ${mileage}`;
        previewPrice.textContent = price;
        previewStatus.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    }

    function validateForm() {
        clearErrors();
        let isValid = true;
        const currentYear = new Date().getFullYear() + 1;

        if (!fields.brand.value.trim()) { errors.brand.textContent = "La marca es obligatoria."; isValid = false; }
        if (!fields.model.value.trim()) { errors.model.textContent = "El modelo es obligatorio."; isValid = false; }

        const year = Number(fields.year.value);
        if (!fields.year.value.trim()) { errors.year.textContent = "El año es obligatorio."; isValid = false; }
        else if (year < 1900 || year > currentYear) { errors.year.textContent = "Ingresa un año válido."; isValid = false; }

        const price = Number(fields.price.value);
        if (!fields.price.value.trim()) { errors.price.textContent = "El precio es obligatorio."; isValid = false; }
        else if (price <= 0) { errors.price.textContent = "El precio debe ser mayor a 0."; isValid = false; }

        if (!fields.status.value.trim()) { errors.status.textContent = "Selecciona un estado."; isValid = false; }
        if (!fields.transmission.value.trim()) { errors.transmission.textContent = "Selecciona una transmisión."; isValid = false; }
        if (!fields.fuel.value.trim()) { errors.fuel.textContent = "Selecciona un combustible."; isValid = false; }

        const mileage = Number(fields.mileage.value);
        if (!fields.mileage.value.trim()) { errors.mileage.textContent = "El kilometraje es obligatorio."; isValid = false; }
        else if (mileage < 0) { errors.mileage.textContent = "El kilometraje no puede ser negativo."; isValid = false; }

        if (!fields.color.value.trim()) { errors.color.textContent = "El color es obligatorio."; isValid = false; }
        if (!fields.location.value.trim()) { errors.location.textContent = "La ubicación es obligatoria."; isValid = false; }

        if (!fields.description.value.trim()) { errors.description.textContent = "La descripción es obligatoria."; isValid = false; }
        else if (fields.description.value.trim().length < 15) { errors.description.textContent = "La descripción debe ser más detallada."; isValid = false; }

        return isValid;
    }

    Object.values(fields).forEach((field) => {
        if (field) {
            field.addEventListener("input", updatePreview);
            field.addEventListener("change", updatePreview);
        }
    });

    fields.images.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) { imageBase64 = ""; previewImage.removeAttribute("src"); return; }
        if (!file.type.startsWith("image/")) { showMessage("Selecciona una imagen válida.", "error"); e.target.value = ""; return; }

        const reader = new FileReader();
        reader.onload = (ev) => {
            imageBase64 = ev.target.result;
            previewImage.src = imageBase64;
        };
        reader.readAsDataURL(file);
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const body = {
            brand: fields.brand.value.trim(),
            model: fields.model.value.trim(),
            year: Number(fields.year.value),
            price: Number(fields.price.value),
            status: fields.status.value,
            transmission: fields.transmission.value,
            fuel: fields.fuel.value,
            mileage: Number(fields.mileage.value),
            color: fields.color.value.trim(),
            location: fields.location.value.trim(),
            description: fields.description.value.trim(),
            images: imageBase64 ? [imageBase64] : [],
        };

        const { res, data } = await apiFetch("/api/vehicles", {
            method: "POST",
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            showMessage(data.message || "Error al publicar el vehículo.", "error");
            return;
        }

        showMessage("Vehículo publicado correctamente.", "success");
        setTimeout(() => { window.location.href = "./vehicle.my.html"; }, 1200);
    });

    logoutLink.addEventListener("click", (e) => {
        e.preventDefault();
        clearToken();
        sessionStorage.removeItem("userName");
        window.location.href = "../auth/login.html";
    });

    updatePreview();
});