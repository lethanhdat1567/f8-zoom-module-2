import httpRequest from "../../utils/httpRequest.js";

class AuthModal extends HTMLElement {
    constructor() {
        super();

        this.signupForm = null;
        this.loginForm = null;
        this.authModal = null;

        this.displayNameSignUp = null;
        this.emailSignUp = null;
        this.passwordSignUp = null;

        this.emailLogin = null;
        this.passwordLogin = null;

        this.togglePassSignup = null;
        this.togglePassLogin = null;
    }

    async connectedCallback() {
        const res = await fetch("/components/AuthModal/AuthModal.html");
        const html = await res.text();

        this.innerHTML = html;

        this.signupForm = document.getElementById("signupForm");
        this.loginForm = document.getElementById("loginForm");
        this.authModal = document.getElementById("authModal");

        this.displayNameSignUp = this.signupForm.querySelector("#signupName");
        this.emailSignUp = this.signupForm.querySelector("#signupEmail");
        this.passwordSignUp = this.signupForm.querySelector("#signupPassword");

        this.emailLogin = this.loginForm.querySelector("#loginEmail");
        this.passwordLogin = this.loginForm.querySelector("#loginPassword");

        this.togglePassSignup =
            this.signupForm.querySelector(".toggle-password");

        this.togglePassLogin = this.loginForm.querySelector(".toggle-password");

        // ----- Close modal -----
        const modalClose = document.getElementById("modalClose");
        modalClose.addEventListener("click", this._closeModal.bind(this));

        // when clicking overlay (outside modal container)
        this.authModal.addEventListener("click", (e) => {
            if (e.target === this.authModal) {
                this._closeModal();
            }
        });

        // with Escape key
        document.addEventListener("keydown", (e) => {
            if (
                e.key === "Escape" &&
                this.authModal.classList.contains("show")
            ) {
                this._closeModal();
            }
        });

        // ---- Submit signup form ----
        const signupFormContent =
            this.signupForm.querySelector(".auth-form-content");

        signupFormContent.addEventListener(
            "submit",
            this._submitSignUpForm.bind(this)
        );

        // ---- Submit login form ----
        const LoginFormContent =
            this.loginForm.querySelector(".auth-form-content");

        LoginFormContent.addEventListener(
            "submit",
            this._submitLoginForm.bind(this)
        );

        // ---- Remove invalid if change value ----
        this._onChangeInput();

        // ---- Toggle password ----
        const signUpIcon = this.signupForm.querySelector(".toggle-password i");

        this.togglePassSignup.addEventListener(
            "click",
            this._togglePassword.bind(this, signUpIcon, this.passwordSignUp)
        );

        const loginIcon = this.loginForm.querySelector(".toggle-password i");
        this.togglePassLogin.addEventListener(
            "click",
            this._togglePassword.bind(this, loginIcon, this.passwordLogin)
        );
    }

    // Function to show signup form
    _showSignupForm() {
        this.signupForm.style.display = "block";
        this.loginForm.style.display = "none";
    }
    // Function to show login form
    _showLoginForm() {
        this.signupForm.style.display = "none";
        this.loginForm.style.display = "block";
    }

    // Function to open modal
    _openModal() {
        this.authModal.classList.add("show");
        document.body.style.overflow = "hidden"; // Prevent background scrolling
    }

    // Open modal with Sign Up form when clicking Sign Up button
    showSignUpModal() {
        this._showSignupForm();
        this._openModal();
    }

    // Open modal with Login form when clicking Login button
    showLoginModal() {
        this._showLoginForm();
        this._openModal();
    }

    // Close modal function
    _closeModal() {
        this.authModal.classList.remove("show");
        document.body.style.overflow = "auto";
    }

    // ---- Signup submit ----
    async _submitSignUpForm(e) {
        e.preventDefault();

        const credentials = {
            display_name: this.displayNameSignUp.value,
            email: this.emailSignUp.value,
            password: this.passwordSignUp.value,
        };

        try {
            const { access_token } = await httpRequest.post(
                "auth/register",
                credentials,
                {}
            );

            localStorage.setItem("accessToken", access_token);
            this._closeModal();
        } catch (error) {
            this._resetInvalid();

            if (error.response.error.code === "VALIDATION_ERROR") {
                const formGroups =
                    this.signupForm.querySelectorAll(".form-group");

                this._setMutipleInvalid(
                    Array.from(formGroups),
                    error.response.error.details
                );
            }

            if (error.response.error.code === "EMAIL_EXISTS") {
                const emailFormGroup = this.signupForm.querySelector(
                    ".form-group[data-field='email']"
                );

                this._setInvalid(emailFormGroup, error.response.error.message);
            }
        }
    }

    // Login submit
    async _submitLoginForm(e) {
        e.preventDefault();

        const credentials = {
            email: this.emailLogin.value,
            password: this.passwordLogin.value,
        };

        try {
            const { access_token } = await httpRequest.post(
                "auth/login",
                credentials,
                {}
            );

            localStorage.setItem("accessToken", access_token);
            this._closeModal();
        } catch (error) {
            console.dir(error);
            this._resetInvalid();

            if (error.response.error.code === "INVALID_CREDENTIALS") {
                const formGroups =
                    this.loginForm.querySelectorAll(".form-group");

                Array.from(formGroups).forEach((formGroup) => {
                    this._setInvalid(formGroup, error.response.error.message);
                });
            }

            if (error.response.error.code === "VALIDATION_ERROR") {
                const formGroups =
                    this.loginForm.querySelectorAll(".form-group");

                this._setMutipleInvalid(
                    Array.from(formGroups),
                    error.response.error.details
                );
            }
        }
    }

    _setInvalid(element, message) {
        element.classList.add("invalid");
        const errorText = element.querySelector(".error-text");
        errorText.textContent = message;
    }

    _setMutipleInvalid(elements, errors) {
        elements.forEach((formGroup) => {
            const field = formGroup.dataset.field;

            const errorData = errors.find((error) => error.field === field);

            if (errorData) {
                this._setInvalid(formGroup, errorData.message);
            }
        });
    }

    _resetInvalid() {
        const formGroups = this.authModal.querySelectorAll(".form-group");
        Array.from(formGroups).map((formGroup) => {
            formGroup.classList.remove("invalid");
            const errorText = formGroup.querySelector(".error-text");
            errorText.textContent = "";
        });
    }

    _onChangeInput() {
        const inputsToChange = [
            this.displayNameSignUp,
            this.emailSignUp,
            this.passwordSignUp,
            this.emailLogin,
            this.passwordLogin,
        ];

        inputsToChange.forEach((input) => {
            input.addEventListener("input", (e) => {
                this._resetInvalid();
            });
        });
    }

    _togglePassword(toggleIcon, inputPassword) {
        const isHidden = inputPassword.type === "password";
        inputPassword.type = isHidden ? "text" : "password";

        toggleIcon.classList.toggle("fa-eye");
        toggleIcon.classList.toggle("fa-eye-slash");
    }
}

customElements.define("spotify-auth-modal", AuthModal);
