import Tooltip from "../../components/Tooltip/Tooltip.js";

class Player extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        const res = await fetch("/components/Player/Player.html");
        const html = await res.text();

        this.innerHTML = html;

        // Tooltip
        new Tooltip(".add-btn", {
            content: "Add to Liked Songs",
            position: "top",
        });

        new Tooltip(".control-btn__suffle", {
            content: "Enable suffle",
            position: "top",
        });

        new Tooltip(".control-btn__previous", {
            content: "Previous",
            position: "top",
        });

        new Tooltip(".control-btn__pause", {
            content: "Play",
            position: "top",
        });

        new Tooltip(".control-btn__next", {
            content: "Next",
            position: "top",
        });

        new Tooltip(".control-btn__repeat", {
            content: "Enable repeat",
            position: "top",
        });

        new Tooltip(".control-btn__lyrics", {
            content: "Lyrics",
            position: "top",
        });

        new Tooltip(".control-btn__volumn", {
            content: "Mute",
            position: "top",
        });

        new Tooltip(".control-btn__expand", {
            content: "Enter Full screen",
            position: "top",
        });
    }
}

customElements.define("spotify-player", Player);
