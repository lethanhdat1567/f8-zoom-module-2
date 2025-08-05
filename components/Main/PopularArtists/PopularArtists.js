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
    }
}

customElements.define("spotify-popular-artists", PopularArtists);
