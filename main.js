import "./components/Header/Header.js";
import "./components/Sidebar/Sidebar.js";
import "./components/Main/index.js";
import "./components/Player/Player.js";
import "./components/AuthModal/AuthModal.js";
import toast from "./utils/toast.js";
import httpRequest from "./utils/httpRequest.js";
import { formatAudioTime } from "./utils/timer.js";

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

// Show detail artist and tracks
document.addEventListener("DOMContentLoaded", async function () {
    const hitsSection = document.querySelector("spotify-hits");
    const popularArtistsSection = document.querySelector(
        "spotify-popular-artists"
    );

    // Artist detail section
    const artistHeroSection = document.querySelector(".artist-hero");
    const artistControlsSection = document.querySelector(".artist-controls");
    const artistPopularSection = document.querySelector(".popular-section");

    // Get artist Id param
    const params = new URLSearchParams(window.location.search);
    const artistId = params.get("artistId");

    // Handle show detail
    if (artistId) {
        const artistInfo = await httpRequest.get(`artists/${artistId}`);
        const { tracks } = await httpRequest.get(
            `artists/${artistId}/tracks/popular`
        );

        const artistHeroHtml = `
                        <div class="hero-background">
                            <img
                                src="${artistInfo.background_image_url}"
                                alt="${artistInfo.name} artist background"
                                class="hero-image"
                            />
                            <div class="hero-overlay"></div>
                        </div>
                        <div class="hero-content">
                            ${
                                artistInfo.is_verified &&
                                ` <div class="verified-badge">
                                    <i class="fas fa-check-circle"></i>
                                    <span>Verified Artist</span>
                                 </div>`
                            }
                            <h1 class="artist-name">${artistInfo.name}</h1>
                            <p class="monthly-listeners">
                                ${
                                    artistInfo.monthly_listeners
                                } monthly listeners
                            </p>
                        </div>                  
        `;
        const artistTracksHtml = tracks
            .map((track, index) => {
                return `
                    <div class="track-item">
                        <div class="track-number">${track.track_number}</div>
                        <div class="track-image">
                            <img
                                src="${track.image_url}"
                                alt="${track.title}"
                            />
                        </div>
                        <div class="track-info">
                            <div class="track-name">
                                ${track.title}
                            </div>
                        </div>
                        <div class="track-plays">${track.play_count}</div>
                            <div class="track-duration">${formatAudioTime(
                                track.duration
                            )}</div>
                            <button class="track-menu-btn">
                                <i class="fas fa-ellipsis-h"></i>
                            </button>
                        </div>
        `;
            })
            .join("");

        // hide detail
        hitsSection.hidden = true;
        popularArtistsSection.hidden = true;

        // Show detail
        artistHeroSection.style.display = "block";
        artistControlsSection.style.display = "flex";
        artistPopularSection.style.display = "block";

        artistHeroSection.innerHTML = artistHeroHtml;

        const trackContainer =
            artistPopularSection.querySelector(".track-list");
        trackContainer.innerHTML = artistTracksHtml;
    } else {
        handleCloseArtistDetail();
    }

    document.addEventListener("artist-detail:hide", handleCloseArtistDetail);

    function handleCloseArtistDetail() {
        hitsSection.hidden = false;
        popularArtistsSection.hidden = false;

        artistHeroSection.style.display = "none";
        artistControlsSection.style.display = "none";
        artistPopularSection.style.display = "none";

        params.delete("artistId");
        const newUrl = params.toString()
            ? `${location.pathname}?${params.toString()}`
            : location.pathname;

        history.replaceState(null, "", newUrl);
    }
});
