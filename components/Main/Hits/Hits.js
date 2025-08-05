class Hits extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        const res = await fetch("/components/Main/Hits/Hits.html");
        const html = await res.text();

        this.innerHTML = html;
    }
}

customElements.define("spotify-hits", Hits);
