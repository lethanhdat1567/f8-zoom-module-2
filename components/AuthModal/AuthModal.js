import httpRequest from "../../utils/httpRequest.js";
import toast from "../../utils/toast.js";
import { connect, dispatch } from "../../store/store.js";

class AuthModal extends HTMLElement {
    constructor() {
        super();

        this.signupForm = null;
        this.loginForm = null;
        this.authModal = null;

        this.displayNameSignUp = null;
        this.displayUsernameSignUp = null;
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

        // Form Element
        this.signupForm = document.getElementById("signupForm");
        this.loginForm = document.getElementById("loginForm");
        this.authModal = document.getElementById("authModal");

        // Register input
        this.displayNameSignUp = this.signupForm.querySelector("#signupName");
        this.displayUsernameSignUp =
            this.signupForm.querySelector("#signupUsername");
        this.emailSignUp = this.signupForm.querySelector("#signupEmail");
        this.passwordSignUp = this.signupForm.querySelector("#signupPassword");

        // Login input
        this.emailLogin = this.loginForm.querySelector("#loginEmail");
        this.passwordLogin = this.loginForm.querySelector("#loginPassword");

        // Show pass icon
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
            username: this.displayUsernameSignUp.value,
            email: this.emailSignUp.value,
            password: this.passwordSignUp.value,
        };

        // Check errors
        const errors = this._validateForm({
            display_name: credentials.display_name,
            username: credentials.username,
            email: credentials.email,
            password: credentials.password,
        });

        if (errors.length > 0) {
            const formGroups = this.signupForm.querySelectorAll(".form-group");
            this._setMutipleInvalid(Array.from(formGroups), errors);
            return;
        }
        try {
            const res = await httpRequest.post(
                "auth/register",
                credentials,
                {}
            );

            localStorage.setItem("accessToken", res.access_token);
            dispatch("SET_USER", res.user);

            toast({
                title: "Đăng kí thành công!",
                message: "Bạn đã đăng kí tài khoản thành công",
                type: "success",
            });

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

            if (error.response.error.code === "USERNAME_EXISTS") {
                const usernameFormGroup = this.signupForm.querySelector(
                    ".form-group[data-field='username']"
                );

                this._setInvalid(
                    usernameFormGroup,
                    "Tên người dùng đã tồn tại"
                );
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

        const errors = this._validateForm({
            email: credentials.email,
            password: credentials.password,
        });

        if (errors.length > 0) {
            const formGroups = this.loginForm.querySelectorAll(".form-group");
            this._setMutipleInvalid(Array.from(formGroups), errors);
            return;
        }

        try {
            const res = await httpRequest.post("auth/login", credentials, {});

            localStorage.setItem("accessToken", res.access_token);
            dispatch("SET_USER", res.user);

            toast({
                title: "Đăng nhập thành công!",
                message: "Bạn đã đăng nhập thành công",
                type: "success",
            });
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
            this.displayUsernameSignUp,
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

    _validateForm(fields, value) {
        const errors = [];

        const validations = {
            display_name: {
                isRequired: "Tên hiển thị không được để trống",
            },
            username: {
                isRequired: "Tên người dùng không được để trống",
            },
            email: {
                isRequired: "Email không được để trống",
                regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Email không hợp lệ",
            },
            password: {
                isRequired: "Password không được để trống",
                regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,
                message:
                    "Mật khẩu phải ít nhất 6 ký tự, có chữ hoa, chữ thường và số",
            },
        };

        for (const field in fields) {
            const value = fields[field];

            if (validations[field]?.isRequired && !value.trim()) {
                errors.push({
                    field: field,
                    message: validations[field].isRequired,
                });

                continue;
            }

            const regex = validations[field]?.regex;

            if (regex) {
                const valid = regex.test(value);
                if (!valid) {
                    errors.push({
                        field: field,
                        message: valid ? "" : validations[field].message,
                    });
                }
            }
        }

        return errors;
    }
}

customElements.define("spotify-auth-modal", connect()(AuthModal));
