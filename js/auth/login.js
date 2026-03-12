document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const togglePasswordBtn = document.getElementById("togglePassword");
    const formMessage = document.getElementById("formMessage");

    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");

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

    function validateEmail(email) {
        return /\S+@\S+\.\S+/.test(email);
    }

    function clearErrors() {
        emailError.textContent = "";
        passwordError.textContent = "";
        clearMessage();
    }

    function validateForm() {
        clearErrors();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        let isValid = true;

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

        return isValid;
    }

    togglePasswordBtn.addEventListener("click", () => {
        const isPassword = passwordInput.type === "password";
        passwordInput.type = isPassword ? "text" : "password";
        togglePasswordBtn.textContent = isPassword ? "Ocultar" : "Ver";
    });

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        try {
            clearMessage();

            // Simulación visual del login por ahora
            // Cuando conectes backend, aquí llamas tu API real
            if (email === "admin@ticoautos.com" && password === "123456") {
                saveToken("demo-token-123");

                // guardar nombre para mostrar en dashboard
                sessionStorage.setItem("userName", "Juan");

                showMessage("Inicio de sesión exitoso. Redirigiendo...", "success");

                setTimeout(() => {
                    window.location.href = "../dashboard/dashboard.html";
                }, 1200);
            } else {
                showMessage("Credenciales incorrectas.", "error");
            }
        } catch (error) {
            console.error("Error en login:", error);
            showMessage("Ocurrió un error al iniciar sesión.", "error");
        }
    });
});