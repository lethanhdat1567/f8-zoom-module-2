class Player extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        const res = await fetch("/components/Player/Player.html");
        const html = await res.text();

        this.innerHTML = html;
    }
}

customElements.define("spotify-player", Player);
