import { connect } from "../../../store/store.js";
import httpRequest from "../../../utils/httpRequest.js";

class PopularArtists extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        const res = await fetch(
            "/components/Main/PopularArtists/PopularArtists.html"
        );
        const html = await res.text();

        this.innerHTML = html;

        this.render();
    }

    render() {
        this._handleRenderPopularArtists();
    }

    async _handleRenderPopularArtists() {
        const container = document.querySelector(".artists-grid");

        try {
            const { artists } = await httpRequest.get("artists/trending");

            const tracksHtml = artists
                .map((artist) => {
                    return `
                     <a href="/?artistId=${artist.id}">
                         <div class="artist-card">
                            <div class="artist-card-cover">
                                <img
                                    src="${artist.image_url}"
                                    alt="${artist.name}"
                                />
                                <button class="artist-play-btn">
                                    <i class="fas fa-play"></i>
                                </button>
                            </div>
                            <div class="artist-card-info">
                                <h3 class="artist-card-name">${artist.name}</h3>
                                <p class="artist-card-type">Artist</p>
                            </div>
                        </div>
                     </a>
                `;
                })
                .join("");

            container.innerHTML = tracksHtml;
        } catch (error) {
            console.log(error);
        }
    }
}

customElements.define("spotify-popular-artists", connect()(PopularArtists));
