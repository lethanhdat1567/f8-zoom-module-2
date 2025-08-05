class Controls extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        const res = await fetch("/components/Main/Controls/Controls.html");
        const html = await res.text();

        this.innerHTML = html;
    }
}

customElements.define("spotify-controls", Controls);
