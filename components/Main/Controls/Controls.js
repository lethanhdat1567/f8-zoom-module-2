import Tooltip from "../../../components/Tooltip/Tooltip.js";

class Controls extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        const res = await fetch("/components/Main/Controls/Controls.html");
        const html = await res.text();

        this.innerHTML = html;

        new Tooltip(".play-btn-large", {
            content: "Play",
            position: "bottom",
            delay: 500,
        });
    }
}

customElements.define("spotify-controls", Controls);
