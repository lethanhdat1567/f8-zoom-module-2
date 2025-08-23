import Tooltip from "../../components/Tooltip/Tooltip.js";
import { connect, dispatch } from "../../store/store.js";
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
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
            this.userMenu.style.display = "flex";
            this.authSection.style.display = "none";
            try {
                const { user } = await httpRequest.get("users/me");

                dispatch("SET_USER", user);
            } catch (error) {}
        }

        this.render();
    }

    async render() {
        this._handleShowModal();
        this._handleShowUserDropdown();
        this._handleLogout();
        this._handleClickHome();

        const { user } = this.props;

        if (user) {
            this.userMenu.style.display = "flex";
            this.authSection.style.display = "none";
        } else {
            this.userMenu.style.display = "none";
            this.authSection.style.display = "flex";
        }

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

        // Xóa listener event cũ
        if (this._userMenuClickHandler) {
            this.userMenu.removeEventListener(
                "click",
                this._userMenuClickHandler
            );
        }
        if (this._docClickHandler) {
            document.removeEventListener("click", this._docClickHandler);
        }

        this._userMenuClickHandler = (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle("show");
        };

        this._docClickHandler = (e) => {
            if (
                userDropdown.classList.contains("show") &&
                !this.userMenu.contains(e.target) &&
                !userDropdown.contains(e.target)
            ) {
                userDropdown.classList.remove("show");
            }
        };

        // Gắn lại event
        this.userMenu.addEventListener("click", this._userMenuClickHandler);
        document.addEventListener("click", this._docClickHandler);
    }

    _handleLogout() {
        const logoutBtn = document.querySelector("#logoutBtn");
        logoutBtn.onclick = () => {
            localStorage.removeItem("accessToken");
            dispatch("LOGOUT");

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
            document.dispatchEvent(new CustomEvent("back-to-home"));
        };
    }
}

customElements.define("spotify-header", connect()(Header));
