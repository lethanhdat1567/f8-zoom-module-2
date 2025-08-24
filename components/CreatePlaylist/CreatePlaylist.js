import { connect } from "../../store/store.js";
import { formatNumber } from "../../utils/helper.js";
import { formatAudioTime } from "../../utils/timer.js";
import httpRequest from "../../utils/httpRequest.js";

class CreatePlaylist extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        const res = await fetch(
            "/components/CreatePlaylist/CreatePlaylist.html"
        );
        const html = await res.text();

        this.innerHTML = html;

        this.render();
    }

    render() {
        const params = new URLSearchParams(window.location.search);
        const playlistId = params.get("playlist");

        if (playlistId) {
            const { playlists } = this.props;
            const playlistDetail = playlists.find(
                (playlist) => playlist.id === playlistId
            );

            if (playlistDetail) {
                this.showPlaylistView(playlistDetail);
                this._renderTracks(playlistId);
                this._handleShowModal();
            }
        }
    }

    async showPlaylistView(playlistDetail) {
        try {
            const playlistInfo = document.querySelector(".playlist-header");

            const playlistInfoHtml = `
                  <div class="playlist-header_thumbnail">
                        <img 
                            class="playlist-header-image"
                            src="${
                                playlistDetail.id ===
                                "018f3619-67c5-4582-a6a7-9b5020b86dfa"
                                    ? "https://misc.scdn.co/liked-songs/liked-songs-300.jpg"
                                    : playlistDetail.image_url || ""
                            }"
                            />
                        <span class="playlist-header-thumbnail-icon"
                            ><i class="fa-solid fa-music"></i>
                        </span>
                        <div class="playlist-header-thumbnail-hover">
                <span class="playlist-header-thumbnail-hover-icon"
                    ><i class="fa-solid fa-pen"></i
                ></span>
                <span class="playlist-header-thumbnail-hover-text"
                    >Choose photo</span
                >
            </div>
                    </div>
                        <div class="playlist-header-thumbnail-hover">
                            <span class="playlist-header-thumbnail-hover-icon"
                                ><i class="fa-solid fa-pen"></i
                            ></span>
                            <span class="playlist-header-thumbnail-hover-text"
                                >Choose photo</span
                            >
                        </div>
                        <div class="playlist-header-info">
                                <p class="playlist-header-info_status">
                                    ${
                                        playlistDetail.is_public
                                            ? "Public Playlist"
                                            : "Unpublic Playlist"
                                    }
                                </p>
                                <h1 class="playlist-header_title">
                                    ${playlistDetail.name}
                                </h1>
                                <p class="playlist-header_name">${
                                    playlistDetail.user_display_name
                                }</p>
                            </div>
            `;

            playlistInfo.innerHTML = playlistInfoHtml;
        } catch (error) {
            console.log(error);
        }
    }

    async _renderTracks(playlistId) {
        try {
            const trackWrapper = document.querySelector(".playlist-tracks");
            let tracks = null;
            if (playlistId === "018f3619-67c5-4582-a6a7-9b5020b86dfa") {
                const res = await httpRequest.get("me/tracks/liked");
                tracks = res.tracks;
            } else {
                const res = await httpRequest.get(
                    `playlists/${playlistId}/tracks`
                );
                tracks = res.tracks;
            }
            const trackHtml = tracks
                .map((track) => {
                    return `
                <div class="track-item" data-id="${track.id}">
                        <div class="track-number">${track.track_number}</div>
                        <div class="track-image">
                            <img src="${track.image_url}" alt="${track.title}">
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
                                <i class="fas fa-ellipsis-h"></i></button></div>
            </div>
               `;
                })
                .join("");

            trackWrapper.innerHTML = trackHtml;
            this._handlePlayTrack();
        } catch (error) {
            console.log(error);
        }
    }

    async _handlePlayTrack() {
        const tracks = document.querySelectorAll(".track-item");

        tracks.forEach((track) => {
            track.onclick = async () => {
                const id = track.dataset.id;
                try {
                    const res = await httpRequest.post(`tracks/${id}/play`);
                    dispatch("SET_TRACK", res.track);
                } catch (error) {
                    console.log(error);
                }
            };
        });
    }

    _handleShowModal() {
        const thumbnailEle = document.querySelector(
            ".playlist-header_thumbnail"
        );

        thumbnailEle.onclick = () => {
            document.dispatchEvent(
                new CustomEvent("modal:open-create-playlist")
            );
        };
    }
}

customElements.define("spotify-create-playlist", connect()(CreatePlaylist));
