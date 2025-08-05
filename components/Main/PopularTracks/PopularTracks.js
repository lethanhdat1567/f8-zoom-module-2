class PopularTracks extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        const res = await fetch(
            "/components/Main/PopularTracks/PopularTracks.html"
        );
        const html = await res.text();

        this.innerHTML = html;
    }
}

customElements.define("spotify-popular-tracks", PopularTracks);
