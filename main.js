import "./components/Header/Header.js";
import "./components/Sidebar/Sidebar.js";
import "./components/Main/index.js";
import "./components/Player/Player.js";
import "./components/AuthModal/AuthModal.js";
import "./components/CreatePlaylist/CreatePlaylist.js";
import toast from "./utils/toast.js";
import httpRequest from "./utils/httpRequest.js";
import { formatAudioTime } from "./utils/timer.js";
import { formatNumber } from "./utils/helper.js";
import { dispatch } from "./store/store.js";

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
    // Section to hide
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
    const artistId = params.get("artist");

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
                                ${formatNumber(
                                    artistInfo.monthly_listeners
                                )} monthly listeners
                            </p>
                        </div>
        `;
        const artistTracksHtml = tracks
            .map((track) => {
                return `
                    <div class="track-item" data-id="${track.id}">
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
                        <div class="track-plays">${formatNumber(
                            track.play_count
                        )}</div>
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

        const artistTracks = document.querySelectorAll(".track-item");

        artistTracks.forEach((track) => {
            track.onclick = async () => {
                const id = track.dataset.id;
                const res = await httpRequest.post(`tracks/${id}/play`);
                dispatch("SET_TRACK", res.track);
            };
        });
    } else {
        handleCloseArtistDetail();
    }

    document.addEventListener("back-to-home", () =>
        handleBackToHome("detail-artist")
    );

    function handleCloseArtistDetail() {
        hitsSection.hidden = false;
        popularArtistsSection.hidden = false;

        artistHeroSection.style.display = "none";
        artistControlsSection.style.display = "none";
        artistPopularSection.style.display = "none";
    }

    async function handleFollowAritst() {
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

                    dispatch("REMOVE-PLAYLIST-ITEM", artistId);
                    toast({
                        title: `Đã hủy lưu playlist của bạn`,
                        type: "success",
                    });
                } else {
                    await httpRequest.post(`artists/${artistId}/follow`);
                    const newArtist = await httpRequest.get(
                        `artists/${artistId}`
                    );

                    followBtn.textContent = "Following";
                    isFollowed = !isFollowed;

                    dispatch("ADD_PLAYLIST", { ...newArtist, type: "artist" });
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
    const playlistWrapper = document.querySelector("spotify-create-playlist");

    // --- Init view theo query param ---
    const params = new URLSearchParams(window.location.search);
    const playlistId = params.get("playlist");

    if (playlistId) {
        hitsSection.hidden = true;
        popularArtistsSection.hidden = true;
        playlistWrapper.hidden = false;
    } else {
        hitsSection.hidden = false;
        popularArtistsSection.hidden = false;
        playlistWrapper.hidden = true;
    }

    // --- Handle create playlist event ---
    document.addEventListener("create:playlist", async () => {
        try {
            const res = await httpRequest.post("playlists", {
                name: "My Playlist",
            });

            dispatch("ADD_PLAYLIST", res.playlist);

            const newPlaylistId = res?.playlist?.id;
            if (newPlaylistId) {
                const params = new URLSearchParams(window.location.search);
                params.set("playlist", newPlaylistId);

                window.location.href = `${
                    window.location.pathname
                }?${params.toString()}`;
            }
        } catch (err) {
            console.error("❌ Failed to create playlist:", err);
            showDefaultView();
        }
    });

    document.addEventListener("modal:open-create-playlist", handleOpenModal);
    document.addEventListener("back-to-home", () =>
        handleBackToHome("create-playlist")
    );
});

async function handleOpenModal() {
    const params = new URLSearchParams(window.location.search);
    const playlistId = params.get("playlist");
    // Modal
    const thumbnailEle = document.querySelector(".playlist-thumbnail-image");
    const playlistModal = document.querySelector(".playlist-modal");
    const closeBtn = document.querySelector(".playlist-modal-header-close");

    // Form
    const playlistForm = document.querySelector(".playlist-modal-body");
    const alertEle = document.querySelector(".playlist-alert");
    const uploadInput = document.querySelector("#playlist-thumbnail");
    let thumbnail_url = null;

    // Fields
    const inputName = playlistForm.querySelector("[name=name]");
    const inputDesc = playlistForm.querySelector("[name=description]");

    // Show modal and set value
    const res = await httpRequest.get(`playlists/${playlistId}`);
    inputName.value = res.name;
    inputDesc.value = res.description;
    if (res.image_url) {
        thumbnailEle.src = res.image_url;
        thumbnailEle.style.display = "block";
    }
    playlistModal.classList.add("active");
    uploadInput.click();
    handleShowOption();

    closeBtn.onclick = () => {
        playlistModal.classList.remove("active");
    };

    // Handle Upload Image
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
                thumbnailEle.src = thumbnail_url;
                thumbnailEle.style.display = "block";
            } catch (error) {
                console.error(error);
            }
        }
    };

    // Handle submit form
    playlistForm.onsubmit = async (e) => {
        e.preventDefault();

        const data = Object.fromEntries(new FormData(playlistForm));

        if (!data.name.trim()) {
            // báo lỗi hoặc return
            inputName.classList.add("error");
            alertEle.classList.add("active");
            return;
        }

        data.is_public = true;
        if (thumbnail_url !== null) {
            data.image_url = thumbnail_url;
        }

        try {
            console.log(data);

            const res = await httpRequest.put(`playlists/${playlistId}`, data);
            dispatch("UPDATE_PLAYLIST", res.playlist);
            playlistModal.classList.remove("active");
        } catch (error) {
            console.log(error);
        }
    };
    inputName.addEventListener("input", () => {
        if (inputName.classList.contains("error")) {
            inputName.classList.remove("error");
            alertEle.classList.remove("active");
        }
    });

    function handleShowOption() {
        const optionsBtn = document.querySelector(".playlist-options-btn");
        const optionsDropdown = document.querySelector(
            ".playlist-options-dropdown-list-wrap"
        );

        optionsBtn.onclick = (e) => {
            optionsDropdown.classList.toggle("show");
            e.stopPropagation();
        };

        document.addEventListener("click", (e) => {
            if (!optionsDropdown.contains(e.target)) {
                optionsDropdown.classList.remove("show");
            }
        });

        const optionsItem = document.querySelectorAll(
            ".playlist-options-dropdown-item"
        );

        optionsItem.forEach((option) => {
            option.onclick = function () {
                const type = option.dataset.option;
                if (type === "change-photo") {
                    uploadInput.click();
                } else if (type === "remove-photo") {
                    thumbnail_url = "";
                    thumbnailEle.src = "";
                    thumbnailEle.style.display = "none";
                }
                optionsDropdown.classList.remove("show");
            };
        });
    }
}

function handleBackToHome(section) {
    const hitsSection = document.querySelector("spotify-hits");
    const popularArtistsSection = document.querySelector(
        "spotify-popular-artists"
    );
    hitsSection.hidden = false;
    popularArtistsSection.hidden = false;

    if (section === "detail-artist") {
        const artistHeroSection = document.querySelector(".artist-hero");
        const artistControlsSection =
            document.querySelector(".artist-controls");
        const artistPopularSection = document.querySelector(".popular-section");

        artistHeroSection.style.display = "none";
        artistControlsSection.style.display = "none";
        artistPopularSection.style.display = "none";
    }

    if (section === "create-playlist") {
        const playlistWrapper = document.querySelector(
            "spotify-create-playlist"
        );

        playlistWrapper.hidden = true;
    }

    window.location.href = window.location.pathname;
}
