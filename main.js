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

        handleFollowAritst(artistInfo);
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

        // params.delete("artistId");
        // params.delete("playlist");
        // const newUrl = params.toString()
        //     ? `${location.pathname}?${params.toString()}`
        //     : location.pathname;

        // history.replaceState(null, "", newUrl);
    }

    async function handleFollowAritst(artistInfo) {
        const followBtn = document.querySelector(".follow-artist-btn");

        const { artists } = await httpRequest.get("me/following");

        let isFollowed = artists.some((artist) => artist.id === artistId);

        followBtn.textContent = isFollowed ? "Following" : "Follow";

        followBtn.onclick = async () => {
            // Follow artist
            try {
                if (isFollowed) {
                    await httpRequest.del(`artists/${artistId}/follow`);

                    followBtn.textContent = "Follow";
                    isFollowed = !isFollowed;
                    toast({
                        title: `Đã hủy lưu playlist của bạn`,
                        type: "success",
                    });
                } else {
                    await httpRequest.post(`artists/${artistId}/follow`);

                    followBtn.textContent = "Following";
                    isFollowed = !isFollowed;

                    toast({
                        title: `Đã lưu vào playlist của bạn`,
                        type: "success",
                    });
                }
            } catch (error) {
                console.dir(error);
            }
        };
    }
});

// Create playlist
document.addEventListener("DOMContentLoaded", function () {
    const hitsSection = document.querySelector("spotify-hits");
    const popularArtistsSection = document.querySelector(
        "spotify-popular-artists"
    );
    const playlistWrapper = document.querySelector(".playlist-wrapper");

    // --- Helpers ---
    async function showPlaylistView() {
        hitsSection.hidden = true;
        popularArtistsSection.hidden = true;
        playlistWrapper.style.display = "block";

        const params = new URLSearchParams(window.location.search);
        const playlistId = params.get("playlist");

        try {
            const playlist = await httpRequest.get(`playlists/${playlistId}`);

            const playlistInfo = document.querySelector(".playlist-header");

            const playlistInfoHtml = `
                 <div class="playlist-header_thumbnail">
                                ${
                                    playlist.image_url
                                        ? ` <img class="playlist-header-image" src="${playlist.image_url}" />`
                                        : ` <span class="playlist-header-thumbnail-icon"><i class="fa-solid fa-music"></i>
                                        </span>
                                            <div class="playlist-header-thumbnail-hover">
                                                <span
                                                    class="playlist-header-thumbnail-hover-icon"
                                                    ><i class="fa-solid fa-pen"></i
                                                ></span>
                                                <span
                                                    class="playlist-header-thumbnail-hover-text"
                                                    >Choose photo</span
                                                >
                                            </div>`
                                }
                               
                               
                            </div>
                            <div class="playlist-header-info">
                                <p class="playlist-header-info_status">
                                    ${
                                        playlist.is_public
                                            ? "Public Playlist"
                                            : "Unpublic Playlist"
                                    }
                                </p>
                                <h1 class="playlist-header_title">
                                    ${playlist.name}
                                </h1>
                                <p class="playlist-header_name">${
                                    playlist.user_display_name
                                }</p>
                            </div>
            `;

            playlistInfo.innerHTML = playlistInfoHtml;
        } catch (error) {
            console.log(error);
        }

        handleOpenModal(playlistId);
    }

    function showDefaultView() {
        hitsSection.hidden = false;
        popularArtistsSection.hidden = false;
        playlistWrapper.style.display = "none";
    }

    // --- Init view theo query param ---
    const params = new URLSearchParams(window.location.search);
    const playlistId = params.get("playlist");

    if (playlistId) {
        showPlaylistView();
    } else {
        showDefaultView();
    }

    // --- Handle create playlist event ---
    document.addEventListener("create:playlist", async () => {
        try {
            const res = await httpRequest.post("playlists", {
                name: "My Playlist",
            });

            const newPlaylistId = res?.playlist?.id;
            if (newPlaylistId) {
                const params = new URLSearchParams(window.location.search);
                params.set("playlist", newPlaylistId);

                // Update URL mà không reload trang
                window.history.replaceState(
                    {},
                    "",
                    `${window.location.pathname}?${params.toString()}`
                );

                showPlaylistView();
            } else {
                showDefaultView();
            }
        } catch (err) {
            console.error("❌ Failed to create playlist:", err);
            showDefaultView();
        }
    });

    document.addEventListener("artist-detail:hide", showDefaultView);
});

function handleOpenModal(playlistId) {
    // Modal
    const thumbnailEle = document.querySelector(".playlist-header_thumbnail");
    const playlistModal = document.querySelector(".playlist-modal");
    const closeBtn = document.querySelector(".playlist-modal-header-close");

    // Form
    const playlistForm = document.querySelector(".playlist-modal-body");
    const fields = playlistForm.querySelectorAll(".playlist-modal-body-input");
    const uploadInput = document.querySelector("#playlist-thumbnail");
    let thumbnail_url = null;

    thumbnailEle.onclick = () => {
        playlistModal.classList.add("active");
    };

    uploadInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append("cover", file);

            try {
                const res = await httpRequest.post(
                    `upload/playlist/${playlistId}/cover`,
                    formData
                );

                thumbnail_url = `https://spotify.f8team.dev${res.file.url}`;
            } catch (error) {
                console.error(error);
            }
        }
    };

    closeBtn.onclick = () => {
        playlistModal.classList.remove("active");
    };

    playlistForm.onsubmit = async (e) => {
        e.preventDefault();
        let data = {};
        let isEmpty = false;
        for (const field of fields) {
            if (!field.value.trim()) {
                isEmpty = true;
                break;
            }
            data = {
                ...data,
                [field.name]: field.value,
            };
        }
        data["is_public"] = true;
        if (thumbnail_url) {
            data["image_url"] = thumbnail_url;
        }

        try {
            const res = await httpRequest.put(`playlists/${playlistId}`, data);

            console.log(res);
        } catch (error) {
            console.log(error);
        }
    };
}
