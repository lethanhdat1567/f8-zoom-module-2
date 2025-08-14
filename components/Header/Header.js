import Tooltip from "../../components/Tooltip/Tooltip.js";
import httpRequest from "../../utils/httpRequest.js";
import toast from "../../utils/toast.js";

class Header extends HTMLElement {
    constructor() {
        super();

        this.userMenu = null;
        this.authSection = null;
    }

    async connectedCallback() {
        const res = await fetch("/components/Header/Header.html");
        const html = await res.text();

        this.innerHTML = html;

        this.authSection = document.querySelector(".auth-buttons");
        this.userMenu = document.querySelector(".user-menu");

        this._handleShowModal();
        this._handleShowUserDropdown();
        this._handleLogout();
        this._handleClickHome();

        try {
            const { user } = await httpRequest.get("users/me");

            if (user) {
                this.userMenu.style.display = "flex";
                this.authSection.style.display = "none";
            }
        } catch (error) {}

        // Tooltip
        new Tooltip(".home-btn", {
            content: "Home",
            position: "bottom",
        });
    }

    _handleShowModal() {
        const signUpBtn = document.querySelector(".signup-btn");
        const LoginBtn = document.querySelector(".login-btn");

        // Show modal
        signUpBtn.onclick = function () {
            document.dispatchEvent(new CustomEvent("modal:open-signup"));
        };

        LoginBtn.onclick = function () {
            document.dispatchEvent(new CustomEvent("modal:open-login"));
        };
    }

    _handleShowUserDropdown() {
        const userDropdown = document.querySelector("#userDropdown");

        this.userMenu.addEventListener("click", (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle("show");
        });

        document.addEventListener("click", (e) => {
            if (
                !userDropdown.contains(e.target) &&
                !this.userMenu.contains(e.target)
            ) {
                userDropdown.classList.remove("show");
            }
        });
    }

    _handleLogout() {
        const logoutBtn = document.querySelector("#logoutBtn");
        logoutBtn.onclick = () => {
            localStorage.removeItem("accessToken");
            toast({
                title: "Đăng xuất thành công!",
                message: "Bạn đã đăng xuất thành công",
                type: "success",
            });
        };
    }

    _handleClickHome() {
        const home = document.querySelector(".home-btn");

        home.onclick = () => {
            document.dispatchEvent(new CustomEvent("artist-detail:hide"));
        };
    }
}

customElements.define("spotify-header", Header);
