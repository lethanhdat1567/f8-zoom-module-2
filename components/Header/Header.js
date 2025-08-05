import httpRequest from "../../utils/httpRequest.js";

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

        const signUpBtn = document.querySelector(".signup-btn");
        const LoginBtn = document.querySelector(".login-btn");

        // Show modal
        signUpBtn.onclick = function () {
            document.dispatchEvent(new CustomEvent("modal:open-signup"));
        };

        LoginBtn.onclick = function () {
            document.dispatchEvent(new CustomEvent("modal:open-login"));
        };

        // Get user
        this.authSection = document.querySelector(".auth-buttons");
        this.userMenu = document.querySelector(".user-menu");

        try {
            const { user } = await httpRequest.get("users/me");

            if (user) {
                this.userMenu.style.display = "flex";
                this.authSection.style.display = "none";
            }
        } catch (error) {}
    }
}

customElements.define("spotify-header", Header);
