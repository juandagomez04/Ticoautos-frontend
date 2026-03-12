import { requireAuth } from "../guards/requireAuth.js";
import { clearToken } from "../core/storage.js";

document.addEventListener("DOMContentLoaded", async () => {

    const ok = await requireAuth();
    if (!ok) return;

    const userName = document.getElementById("userName");
    const logoutLink = document.getElementById("logoutLink");

    const publishedCount = document.getElementById("publishedCount");
    const availableCount = document.getElementById("availableCount");
    const soldCount = document.getElementById("soldCount");
    const messagesCount = document.getElementById("messagesCount");

    const savedUserName = sessionStorage.getItem("userName");

    userName.textContent = savedUserName || "Usuario";

    const dashboardData = {
        published: 6,
        available: 4,
        sold: 2,
        messages: 5
    };

    publishedCount.textContent = dashboardData.published;
    availableCount.textContent = dashboardData.available;
    soldCount.textContent = dashboardData.sold;
    messagesCount.textContent = dashboardData.messages;

    logoutLink.addEventListener("click", (event) => {
        event.preventDefault();

        clearToken();
        sessionStorage.removeItem("userName");

        window.location.href = "../auth/login.html";
    });

});