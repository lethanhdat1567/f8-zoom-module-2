import "./components/Header/Header.js";
import "./components/Sidebar/Sidebar.js";
import "./components/Main/index.js";
import "./components/Player/Player.js";
import "./components/AuthModal/AuthModal.js";

// Auth Modal Functionality
document.addEventListener("DOMContentLoaded", function () {
    document.addEventListener("contextmenu", function (e) {
        e.preventDefault();
    });
    // Get DOM elements
    const authModal = document.querySelector("spotify-auth-modal");

    document.addEventListener("modal:open-signup", () => {
        authModal.showSignUpModal();
    });
    document.addEventListener("modal:open-login", () => {
        authModal.showLoginModal();
    });
});

// User Menu Dropdown Functionality
// document.addEventListener("DOMContentLoaded", function () {
//     const userAvatar = document.getElementById("userAvatar");
//     const userDropdown = document.getElementById("userDropdown");
//     const logoutBtn = document.getElementById("logoutBtn");

//     // Toggle dropdown when clicking avatar
//     userAvatar.addEventListener("click", function (e) {
//         e.stopPropagation();
//         userDropdown.classList.toggle("show");
//     });

//     // Close dropdown when clicking outside
//     document.addEventListener("click", function (e) {
//         if (
//             !userAvatar.contains(e.target) &&
//             !userDropdown.contains(e.target)
//         ) {
//             userDropdown.classList.remove("show");
//         }
//     });

//     // Close dropdown when pressing Escape
//     document.addEventListener("keydown", function (e) {
//         if (e.key === "Escape" && userDropdown.classList.contains("show")) {
//             userDropdown.classList.remove("show");
//         }
//     });

//     // Handle logout button click
//     logoutBtn.addEventListener("click", function () {
//         // Close dropdown first
//         userDropdown.classList.remove("show");

//         console.log("Logout clicked");
//         // TODO: Students will implement logout logic here
//     });
// });

// Other functionality
// document.addEventListener("DOMContentLoaded", async function () {
//     // TODO: Implement other functionality here
// });
