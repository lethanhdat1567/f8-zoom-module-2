import Tooltip from "../../components/Tooltip/Tooltip.js";
import { connect, dispatch } from "../../store/store.js";
import { formatAudioTime } from "../../utils/timer.js";
import httpRequest from "../../utils/httpRequest.js";

class Player extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        const res = await fetch("/components/Player/Player.html");
        const html = await res.text();

        this.innerHTML = html;
        this.audioTooltip = null;
        this.likeTooltip = null;
        this.audio = null;
        this.muted = false;

        this.render();
        this._handleTooltip();
        this._handleRepeat();
    }

    render() {
        this._renderInfoTrack();
        this._handleToggleAudio();
        this._handleProgressTrack();
        this._handleVolume();
        this._handleLikeSong();
    }

    _renderInfoTrack() {
        const track = this.props.trackPlaying;
        if (!track) return;

        // Info track
        const infoWrapper = document.querySelector(".player-left");
        const infoTrackHtml = `
        <img
            src="${track.image_url}"
            alt="${track.title}"
            class="player-image"
        />
        <div class="player-info">
            <div class="player-title">${track.title}</div>
            <div class="player-artist">${track.artist_name}</div>
        </div>
        <button class="add-btn">
            <i class="fa-solid fa-plus"></i>
        </button>`;

        infoWrapper.innerHTML = infoTrackHtml;

        // Durarion
        const endTimeEle = document.querySelector(".end-time");
        endTimeEle.textContent = formatAudioTime(track.duration);

        // Audio
        this.audio = document.querySelector("#audio");
        this.audio.src = track.audio_url;

        this.likeTooltip = new Tooltip(".add-btn", {
            content: "Add to Liked Songs",
            position: "top",
        });

        this.audio.onended = () => {
            dispatch("TOGGLE_TRACK", {
                isPlaying: false,
                currentTime: Math.floor(this.audio.currentTime),
            });
        };
    }

    _handleToggleAudio() {
        const track = this.props.trackPlaying;
        if (!track) return;

        const playBtn = document.querySelector(".play-btn");
        playBtn.innerHTML = track.isPlaying
            ? `<i class="fas fa-pause"></i>`
            : `<i class="fas fa-play"></i>`;
        this.audio.currentTime = track.currentTime;

        if (track.isPlaying) {
            this.audio.play();
        } else {
            this.audio.pause();
        }

        playBtn.onclick = () => {
            if (track.isPlaying) {
                dispatch("TOGGLE_TRACK", {
                    isPlaying: false,
                    currentTime: Math.floor(this.audio.currentTime),
                });
            } else {
                dispatch("TOGGLE_TRACK", {
                    isPlaying: true,
                    currentTime: Math.floor(this.audio.currentTime),
                });
            }
        };
    }

    _handleProgressTrack() {
        const track = this.props.trackPlaying;
        if (!track) return;

        const startTime = document.querySelector(".start-time");
        const progressRange = document.querySelector(".progress-range");

        // cập nhật thanh progress khi nhạc chạy
        this.audio.addEventListener("timeupdate", () => {
            startTime.innerHTML = `${formatAudioTime(
                Math.floor(this.audio.currentTime)
            )}`;

            const progressPercent =
                (this.audio.currentTime / this.audio.duration) * 100;

            progressRange.value = progressPercent;
            progressRange.style.background = `linear-gradient(
            to right,
            #fff ${progressPercent}%,
            var(--bg-tertiary) ${progressPercent}%
        )`;
        });

        // xử lý khi người dùng tua nhạc
        progressRange.oninput = (e) => {
            const percent = e.target.value;
            progressRange.style.background = `linear-gradient(
            to right,
            #fff ${percent}%,
            var(--bg-tertiary) ${percent}%
        )`;

            const newTime = (percent / 100) * this.audio.duration;
            this.audio.currentTime = newTime;
        };
    }

    _handleVolume() {
        if (!this.audio) return;
        const volumnRange = document.querySelector(".volume-range");
        const volumeBtn = document.querySelector(".control-btn__volumn");

        const audioVolume = this.audio.volume;
        this.muted = false;

        // Update volume
        volumnRange.value = audioVolume * 100;
        volumnRange.style.background = `linear-gradient(to right, #fff ${
            audioVolume * 100
        }%, var(--bg-tertiary) ${audioVolume * 100}%)`;

        // User Change volume
        volumnRange.oninput = (e) => {
            const percent = e.target.value;

            this.audio.volume = percent / 100;

            volumnRange.style.background = `linear-gradient(to right, #fff ${percent}%, var(--bg-tertiary) ${percent}%)`;
        };

        volumeBtn.onclick = () => {
            if (this.muted) {
                volumeBtn.innerHTML = `<i class="fas fa-volume-down"></i>`;
                this.audio.muted = false;
            } else {
                volumeBtn.innerHTML = `<i class="fa-solid fa-volume-xmark"></i>`;
                this.audio.muted = true;
            }

            this.muted = !this.muted;
            this.audioTooltip.options.content = this.muted ? "Unmute" : "Mute";
            this.audioTooltip.rerender();
        };
    }

    _handleTooltip() {
        new Tooltip(".control-btn__suffle", {
            content: "Enable suffle",
            position: "top",
        });

        new Tooltip(".control-btn__previous", {
            content: "Previous",
            position: "top",
        });

        new Tooltip(".control-btn__pause", {
            content: "Play",
            position: "top",
        });

        new Tooltip(".control-btn__next", {
            content: "Next",
            position: "top",
        });

        new Tooltip(".control-btn__repeat", {
            content: "Enable repeat",
            position: "top",
        });

        new Tooltip(".control-btn__lyrics", {
            content: "Lyrics",
            position: "top",
        });

        this.audioTooltip = new Tooltip(".control-btn__volumn", {
            content: this.muted ? "Unmute" : "Mute",
            position: "top",
        });

        new Tooltip(".control-btn__expand", {
            content: "Enter Full screen",
            position: "top",
        });
    }

    _handleRepeat() {
        let isRepeat = false;
        const repeatBtn = document.querySelector(".control-btn__repeat");
        repeatBtn.onclick = () => {
            isRepeat = !isRepeat;
            this.audio.loop = isRepeat;

            repeatBtn.classList.toggle("active", isRepeat);
        };
    }

    async _handleLikeSong() {
        const track = this.props.trackPlaying;
        if (!track) return;

        const likeBtn = document.querySelector(".add-btn");
        let isLiked = false;

        try {
            const res = await httpRequest.get("me/tracks/liked");

            isLiked = res.tracks.some((item) => item.id === track.id);

            likeBtn.innerHTML = isLiked
                ? `<i class="fa-solid fa-check"></i>`
                : `<i class="fa-solid fa-plus"></i>`;
            likeBtn.classList.toggle("active", isLiked);

            this.likeTooltip.options.content = isLiked
                ? "Remove from playlist"
                : "Add to playlist";

            this.likeTooltip.rerender();
        } catch (error) {
            console.log(error);
        }

        likeBtn.onclick = async () => {
            if (isLiked) {
                try {
                    await httpRequest.del(`tracks/${track.id}/like`);
                    isLiked = false;

                    likeBtn.innerHTML = `<i class="fa-solid fa-plus"></i>`;
                    likeBtn.classList.remove("active");
                    this.likeTooltip.options.content = "Add to playlist";
                    this.likeTooltip.rerender();
                } catch (error) {
                    console.log(error);
                }
            } else {
                try {
                    await httpRequest.post(`tracks/${track.id}/like`);
                    isLiked = true;

                    likeBtn.innerHTML = `<i class="fa-solid fa-check"></i>`;
                    likeBtn.classList.add("active");
                    this.likeTooltip.options.content = "Remove from playlist";
                    this.likeTooltip.rerender();
                } catch (error) {
                    console.log(error);
                }
            }
        };
    }
}

customElements.define("spotify-player", connect()(Player));
