import { connect, dispatch } from "../../../store/store.js";
import httpRequest from "../../../utils/httpRequest.js";

class Hits extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        const res = await fetch("/components/Main/Hits/Hits.html");
        const html = await res.text();

        this.innerHTML = html;

        await this._handleRenderHits();
        this._handlePlayTrack();
    }

    render() {}

    async _handleRenderHits() {
        const container = document.querySelector(".hits-grid");

        try {
            const { tracks } = await httpRequest.get("tracks/trending");

            const tracksHtml = tracks
                .map((track) => {
                    return `
                    <div class="hit-card" data-id="${track.id}">
                        <div class="hit-card-cover">
                            <img
                                src="${track.image_url}"
                                alt="${track.title}"
                            />
                            <button class="hit-play-btn">
                                <i class="fas fa-play"></i>
                            </button>
                        </div>
                        <div class="hit-card-info">
                            <h3 class="hit-card-title">${track.title}</h3>
                            <p class="hit-card-artist">${track.album_title}</p>
                        </div>
                    </div>
                `;
                })
                .join("");

            container.innerHTML = tracksHtml;
        } catch (error) {
            console.log(error);
        }
    }

    _handlePlayTrack() {
        const tracksEle = document.querySelectorAll(".hit-card");

        tracksEle.forEach((track) => {
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
}

customElements.define("spotify-hits", connect()(Hits));
