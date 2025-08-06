import Tooltip from "../Tooltip/Tooltip.js";

class Sidebar extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        const res = await fetch("/components/Sidebar/Sidebar.html");
        const html = await res.text();

        this.innerHTML = html;

        // Tooltip
        new Tooltip("#library-create-btn", {
            content: "Create a playlist, folder, or Jam",
            position: "top",
        });
        new Tooltip(".search-library-btn", {
            content: "Search in Your Library",
            position: "top",
        });
    }
}

customElements.define("spotify-sidebar", Sidebar);
