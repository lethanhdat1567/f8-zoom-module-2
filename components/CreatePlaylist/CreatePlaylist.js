import { connect } from "../../store/store.js";

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
                this._handleShowModal();
            }
        }
    }

    async showPlaylistView(playlistDetail) {
        try {
            const playlistInfo = document.querySelector(".playlist-header");

            const playlistInfoHtml = `
                  <div class="playlist-header_thumbnail">
                        <img class="playlist-header-image" ${
                            playlistDetail.image_url &&
                            `src="${playlistDetail.image_url}"`
                        } />
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
