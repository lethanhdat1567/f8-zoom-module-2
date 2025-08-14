// Toast function
function toast({ title = "", message = "", type = "info", duration = 3000 }) {
    const main = document.getElementById("toast");

    if (main) {
        const toast = document.createElement("div");

        // Auto remove toast
        const autoRemoveId = setTimeout(function () {
            main.removeChild(toast);
        }, duration + 1000);

        // Remove toast when clicked
        toast.onclick = function (e) {
            if (e.target.closest(".toast-close")) {
                main.removeChild(toast);
                clearTimeout(autoRemoveId);
            }
        };

        const icons = {
            success: "fas fa-check-circle",
            info: "fas fa-info-circle",
            warning: "fas fa-exclamation-circle",
            error: "fas fa-exclamation-circle",
        };
        const icon = icons[type];
        const delay = (duration / 1000).toFixed(2);

        toast.classList.add("toast", `toast--${type}`);
        toast.style.animation = `ToastFadeIn ease .3s, ToastFadeOut linear 1s ${delay}s forwards`;

        toast.innerHTML = `
                    <div class="toast-containter">
                        <span class="toast-info-icon toast-icon">
                            <i class="${icon}"></i>
                        </span>
                    <div class="toast-info">
                        <span class="toast-title">${title}</span>
                        <span class="toast-desc">${message}</span>
                    </div>
                    </div>
                    <span class="toast-icon toast-close">
                        <i class="fa-solid fa-xmark"></i>
                    </span>
                        `;
        main.appendChild(toast);
    }
}

export default toast;
