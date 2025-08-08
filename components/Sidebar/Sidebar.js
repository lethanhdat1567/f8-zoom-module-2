import Tooltip from "../Tooltip/Tooltip.js";

class Sidebar extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        const res = await fetch("/components/Sidebar/Sidebar.html");
        const html = await res.text();

        this.innerHTML = html;

        // Recents tooltip
        this.sortInstance = new Tooltip(".sort-btn", {
            position: "bottom-right",
            render: this._renderMenuList,
            trigger: "manual",
        });

        const sortBtn = document.querySelector(".sort-btn");
        this.sortByValue = "recents";
        this.viewAsValue = "default_list";
        this._renderLibraryContent(this.viewAsValue);
        // toggle show tooltip
        this.isShown = false;

        document.onclick = (e) => {
            if (!this.sortInstance.tooltipEle.contains(e.target)) {
                this.sortInstance.hide();
                this.isShown = false;
            }
        };

        sortBtn.onclick = (e) => {
            e.stopPropagation();
            if (this.isShown) {
                this.sortInstance.hide();
            } else {
                this.sortInstance.show();
                this._renderAndListenClickEvent();
            }
            this.isShown = !this.isShown;
        };

        // Tooltip other
        this.useTooltipContent();
    }

    useTooltipContent() {
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

    _renderMenuList() {
        const menuItems = [
            { name: "Recents", value: "recents" },
            { name: "Recently Added", value: "recently_added" },
            { name: "Alphabetical", value: "alphabetical" },
            { name: "Creator", value: "creator" },
        ];
        const gridItems = [
            {
                name: "Compact list",
                value: "compact_list",
                icon: "fas fa-bars",
            },
            {
                name: "Default list",
                value: "default_list",
                icon: "fas fa-list",
            },
            {
                name: "Compact grid",
                value: "compact_grid",
                icon: "fas fa-th",
            },
            {
                name: "Default grid",
                value: "default_grid",
                icon: "fas fa-border-all",
            },
        ];

        const wrapper = document.createElement("div");
        wrapper.className = "recent-menu-wrap";

        const menuTitle = document.createElement("p");
        menuTitle.className = "recent-menu-title";
        menuTitle.textContent = "Sort by";

        // Menu list
        const menuList = document.createElement("ul");
        menuList.className = "recent-menu-list";

        menuItems.forEach((menuItem, index) => {
            const item = document.createElement("li");
            item.className = "recent-menu-item";

            const itemText = document.createElement("span");
            itemText.textContent = menuItem.name;
            itemText.className = "recent-menu-item-text";

            const itemCheckIcon = document.createElement("li");
            itemCheckIcon.className = "fa-solid fa-check recent-menu-item-icon";

            item.dataset.value = menuItem.value;

            item.append(itemText, itemCheckIcon);

            menuList.appendChild(item);
        });

        // Menu grid
        const menuGridWrap = document.createElement("div");
        menuGridWrap.className = "recent-menu-grid-wrap";

        const menuGridTitle = document.createElement("p");
        menuGridTitle.className = "recent-menu-grid-title";
        menuGridTitle.textContent = "View as";

        const menuGrid = document.createElement("ul");
        menuGrid.className = "recent-menu-grid";

        gridItems.forEach((grid, index) => {
            const gridItem = document.createElement("li");
            gridItem.className = "recent-menu-grid-item";
            gridItem.id = grid.value;

            gridItem.dataset.value = grid.value;

            const icon = document.createElement("i");
            icon.className = grid.icon;

            gridItem.appendChild(icon);
            menuGrid.appendChild(gridItem);
        });

        menuGridWrap.append(menuGridTitle, menuGrid);

        wrapper.append(menuTitle, menuList, menuGridWrap);

        return wrapper;
    }

    _renderAndListenClickEvent() {
        this.sortEles = document.querySelectorAll(".recent-menu-item");
        this.viewEles = document.querySelectorAll(".recent-menu-grid-item");

        this._renderSortBy();
        this._renderViewAs();

        this.sortEles.forEach((sortItem) => {
            const sortValue = sortItem.dataset.value;

            sortItem.onclick = () => {
                this.sortByValue = sortValue;
                this._renderSortBy();
                this.sortInstance.hide();
                this.isShown = false;
            };
        });

        this.viewEles.forEach((viewItem) => {
            const viewValue = viewItem.dataset.value;

            viewItem.onclick = () => {
                this.viewAsValue = viewValue;
                this._renderViewAs();
                this._renderLibraryContent(viewValue);
                this.sortInstance.hide();
                this.isShown = false;
            };
        });

        new Tooltip("#compact_list", {
            content: "Compact list",
            position: "top",
        });
        new Tooltip("#default_list", {
            content: "Default list",
            position: "top",
        });
        new Tooltip("#compact_grid", {
            content: "Compact grid",
            position: "top",
        });
        new Tooltip("#default_grid", {
            content: "Default grid",
            position: "top",
        });
    }
    _renderSortBy() {
        this.sortEles.forEach((sortItem) => {
            const sortValue = sortItem.dataset.value;
            if (sortValue === this.sortByValue) {
                sortItem.classList.add("active");
            } else {
                sortItem.classList.remove("active");
            }
        });
    }
    _renderViewAs() {
        this.viewEles.forEach((viewItem) => {
            const viewValue = viewItem.dataset.value;
            if (viewValue === this.viewAsValue) {
                viewItem.classList.add("active");
            } else {
                viewItem.classList.remove("active");
            }
        });
    }

    _renderLibraryContent(viewAsValue) {
        const libraryContentEles =
            document.querySelectorAll(".library-content");

        libraryContentEles.forEach((item) => {
            if (item.classList.contains(`library-${viewAsValue}`)) {
                item.classList.add("active");
            } else {
                item.classList.remove("active");
            }
        });
    }
}

customElements.define("spotify-sidebar", Sidebar);
