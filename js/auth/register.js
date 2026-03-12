document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");

    const nameInput = document.getElementById("name");
    const lastNameInput = document.getElementById("lastName");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");

    const togglePasswordBtn = document.getElementById("togglePassword");
    const toggleConfirmPasswordBtn = document.getElementById("toggleConfirmPassword");

    const formMessage = document.getElementById("formMessage");

    const nameError = document.getElementById("nameError");
    const lastNameError = document.getElementById("lastNameError");
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const confirmPasswordError = document.getElementById("confirmPasswordError");

    function showMessage(message, type) {
        formMessage.textContent = message;
        formMessage.classList.remove("hidden", "success", "error");
        formMessage.classList.add(type);
    }

    function clearMessage() {
        formMessage.textContent = "";
        formMessage.classList.add("hidden");
        formMessage.classList.remove("success", "error");
    }

    function clearErrors() {
        nameError.textContent = "";
        lastNameError.textContent = "";
        emailError.textContent = "";
        passwordError.textContent = "";
        confirmPasswordError.textContent = "";
        clearMessage();
    }

    function validateEmail(email) {
        return /\S+@\S+\.\S+/.test(email);
    }

    function validateForm() {
        clearErrors();

        const name = nameInput.value.trim();
        const lastName = lastNameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        let isValid = true;

        if (!name) {
            nameError.textContent = "El nombre es obligatorio.";
            isValid = false;
        }

        if (!lastName) {
            lastNameError.textContent = "El apellido es obligatorio.";
            isValid = false;
        }

        if (!email) {
            emailError.textContent = "El correo es obligatorio.";
            isValid = false;
        } else if (!validateEmail(email)) {
            emailError.textContent = "Ingresa un correo válido.";
            isValid = false;
        }

        if (!password) {
            passwordError.textContent = "La contraseña es obligatoria.";
            isValid = false;
        } else if (password.length < 6) {
            passwordError.textContent = "La contraseña debe tener al menos 6 caracteres.";
            isValid = false;
        }

        if (!confirmPassword) {
            confirmPasswordError.textContent = "Debes confirmar la contraseña.";
            isValid = false;
        } else if (password !== confirmPassword) {
            confirmPasswordError.textContent = "Las contraseñas no coinciden.";
            isValid = false;
        }

        return isValid;
    }

    function togglePasswordVisibility(input, button) {
        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";
        button.textContent = isPassword ? "Ocultar" : "Ver";
    }

    togglePasswordBtn.addEventListener("click", () => {
        togglePasswordVisibility(passwordInput, togglePasswordBtn);
    });

    toggleConfirmPasswordBtn.addEventListener("click", () => {
        togglePasswordVisibility(confirmPasswordInput, toggleConfirmPasswordBtn);
    });

    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        const name = nameInput.value.trim();
        const lastName = lastNameInput.value.trim();
        const email = emailInput.value.trim();

        try {
            clearMessage();

            // Simulación visual mientras conectas backend
            showMessage(`Cuenta creada correctamente para ${name} ${lastName}.`, "success");

            setTimeout(() => {
                window.location.href = "./login.html";
            }, 1300);
        } catch (error) {
            console.error("Error en registro:", error);
            showMessage("Ocurrió un error al registrar la cuenta.", "error");
        }
    });
});