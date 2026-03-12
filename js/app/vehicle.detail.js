document.addEventListener("DOMContentLoaded", () => {
    const thumbs = document.querySelectorAll(".thumb");
    const mainImage = document.getElementById("mainImage");
    const shareBtn = document.getElementById("shareBtn");
    const shareMessage = document.getElementById("shareMessage");

    function updateMainImage(imageNumber) {
        mainImage.classList.remove("image-1", "image-2", "image-3", "image-4");
        mainImage.classList.add(`image-${imageNumber}`);
        mainImage.innerHTML = `<span class="gallery-label">Imagen ${imageNumber}</span>`;
    }

    thumbs.forEach((thumb) => {
        thumb.addEventListener("click", () => {
            thumbs.forEach((item) => item.classList.remove("active"));
            thumb.classList.add("active");

            const imageNumber = thumb.dataset.image;
            updateMainImage(imageNumber);
        });
    });

    shareBtn.addEventListener("click", async () => {
        const pageUrl = window.location.href;

        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(pageUrl);
                shareMessage.classList.remove("hidden");

                setTimeout(() => {
                    shareMessage.classList.add("hidden");
                }, 2000);
            }
        } catch (error) {
            console.error("No se pudo copiar el enlace:", error);
        }
    });

    updateMainImage(1);
});