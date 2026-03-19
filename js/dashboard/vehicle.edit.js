import { requireAuth } from "../guards/requireAuth.js";
import { clearToken } from "../core/storage.js";

document.addEventListener("DOMContentLoaded", async () => {
    const logoutLink = document.getElementById("logoutLink");
    const form = document.getElementById("vehicleEditForm");
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
        images: document.getElementById("images")
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
        images: document.getElementById("imagesError")
    };

    const previewTitle = document.getElementById("previewTitle");
    const previewMeta = document.getElementById("previewMeta");
    const previewPrice = document.getElementById("previewPrice");
    const previewStatus = document.getElementById("previewStatus");

    const params = new URLSearchParams(window.location.search);
    const vehicleId = Number(params.get("id")) || 1;

    function getVehicles() {
        const existing = JSON.parse(sessionStorage.getItem("ticoVehicles") || "[]");

        if (existing.length) return existing;

        const mock = [
            {
                id: 1,
                brand: "Toyota",
                model: "Corolla",
                year: "2020",
                price: "18900",
                status: "disponible",
                transmission: "automática",
                fuel: "gasolina",
                mileage: "52000",
                color: "Gris",
                location: "San José, Costa Rica",
                description: "Vehículo en excelente estado, mantenimiento al día y listo para traspaso.",
                image: ""
            },
            {
                id: 2,
                brand: "Hyundai",
                model: "Tucson",
                year: "2019",
                price: "21500",
                status: "vendido",
                transmission: "automática",
                fuel: "diesel",
                mileage: "73000",
                color: "Blanco",
                location: "Heredia, Costa Rica",
                description: "SUV espacioso, cómodo y con revisión reciente.",
                image: ""
            }
        ];

        sessionStorage.setItem("ticoVehicles", JSON.stringify(mock));
        return mock;
    }

    function saveVehicles(data) {
        sessionStorage.setItem("ticoVehicles", JSON.stringify(data));
    }

    function clearErrors() {
        Object.values(errors).forEach(error => error.textContent = "");
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
        const price = fields.price.value ? `$${Number(fields.price.value).toLocaleString("en-US")}` : "$0";
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

        if (!fields.brand.value.trim()) {
            errors.brand.textContent = "La marca es obligatoria.";
            isValid = false;
        }

        if (!fields.model.value.trim()) {
            errors.model.textContent = "El modelo es obligatorio.";
            isValid = false;
        }

        const year = Number(fields.year.value);
        if (!fields.year.value.trim()) {
            errors.year.textContent = "El año es obligatorio.";
            isValid = false;
        } else if (year < 1900 || year > currentYear) {
            errors.year.textContent = "Ingresa un año válido.";
            isValid = false;
        }

        const price = Number(fields.price.value);
        if (!fields.price.value.trim()) {
            errors.price.textContent = "El precio es obligatorio.";
            isValid = false;
        } else if (price <= 0) {
            errors.price.textContent = "El precio debe ser mayor a 0.";
            isValid = false;
        }

        if (!fields.status.value.trim()) {
            errors.status.textContent = "Selecciona un estado.";
            isValid = false;
        }

        if (!fields.transmission.value.trim()) {
            errors.transmission.textContent = "Selecciona una transmisión.";
            isValid = false;
        }

        if (!fields.fuel.value.trim()) {
            errors.fuel.textContent = "Selecciona un combustible.";
            isValid = false;
        }

        if (!fields.mileage.value.trim()) {
            errors.mileage.textContent = "El kilometraje es obligatorio.";
            isValid = false;
        }

        if (!fields.color.value.trim()) {
            errors.color.textContent = "El color es obligatorio.";
            isValid = false;
        }

        if (!fields.location.value.trim()) {
            errors.location.textContent = "La ubicación es obligatoria.";
            isValid = false;
        }

        if (!fields.description.value.trim() || fields.description.value.trim().length < 15) {
            errors.description.textContent = "La descripción debe ser más detallada.";
            isValid = false;
        }

        return isValid;
    }

    function loadVehicle() {
        const vehicles = getVehicles();
        const vehicle = vehicles.find(item => item.id === vehicleId);

        if (!vehicle) {
            showMessage("No se encontró el vehículo a editar.", "error");
            return;
        }

        fields.brand.value = vehicle.brand;
        fields.model.value = vehicle.model;
        fields.year.value = vehicle.year;
        fields.price.value = vehicle.price;
        fields.status.value = vehicle.status;
        fields.transmission.value = vehicle.transmission;
        fields.fuel.value = vehicle.fuel;
        fields.mileage.value = vehicle.mileage;
        fields.color.value = vehicle.color;
        fields.location.value = vehicle.location;
        fields.description.value = vehicle.description;

        if (vehicle.image) {
            previewImage.src = vehicle.image;
        }

        updatePreview();
    }

    Object.values(fields).forEach((field) => {
        if (field) {
            field.addEventListener("input", updatePreview);
            field.addEventListener("change", updatePreview);
        }
    });

    fields.images.addEventListener("change", (event) => {
        const file = event.target.files[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            showMessage("Selecciona un archivo de imagen válido.", "error");
            event.target.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = function (e) {
            previewImage.src = e.target.result;
        };

        reader.readAsDataURL(file);
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!validateForm()) return;

        const vehicles = getVehicles();
        const index = vehicles.findIndex(item => item.id === vehicleId);

        if (index === -1) {
            showMessage("No se encontró el vehículo.", "error");
            return;
        }

        vehicles[index] = {
            ...vehicles[index],
            brand: fields.brand.value.trim(),
            model: fields.model.value.trim(),
            year: fields.year.value.trim(),
            price: fields.price.value.trim(),
            status: fields.status.value.trim(),
            transmission: fields.transmission.value.trim(),
            fuel: fields.fuel.value.trim(),
            mileage: fields.mileage.value.trim(),
            color: fields.color.value.trim(),
            location: fields.location.value.trim(),
            description: fields.description.value.trim(),
            image: previewImage.src || ""
        };

        saveVehicles(vehicles);
        showMessage("Vehículo actualizado correctamente.", "success");

        setTimeout(() => {
            window.location.href = "./vehicle.my.html";
        }, 1000);
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

    loadVehicle();
});