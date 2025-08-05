class HeroArtists extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        const res = await fetch(
            "/components/Main/HeroArtists/HeroArtists.html"
        );
        const html = await res.text();

        this.innerHTML = html;
    }
}

customElements.define("spotify-hero-artists", HeroArtists);
