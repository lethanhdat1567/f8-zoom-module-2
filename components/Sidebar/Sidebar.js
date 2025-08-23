import Tooltip from "../Tooltip/Tooltip.js";
import httpRequest from "../../utils/httpRequest.js";
import { connect, dispatch } from "../../store/store.js";

class Sidebar extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        const res = await fetch("/components/Sidebar/Sidebar.html");
        const html = await res.text();

        this.innerHTML = html;
        this.menuContextItem = null;
        this.contextMenu = null;

        this._handleGetPlaylist();
    }

    render() {
        // Recents tooltip
        this._handleRecentTooltip();

        // Search
        this._handleSearchBtn();

        // Nav tabs
        this._handleNavTabs();

        // Context Menu
        this._handleContenxtMenu();

        // Click Logo
        this._handleClickLogo();

        // Click create playlist
        this._handleCreatePlaylist();

        // Tooltip other
        this.useTooltipContent();
    }

    // Filter and save playlists
    async _handleGetPlaylist() {
        try {
            const { tracks } = await httpRequest.get("me/tracks/liked");
            const { artists } = await httpRequest.get("me/following");
            const { playlists } = await httpRequest.get("me/playlists");

            const myLikedSongs = tracks.map((track) => {
                return { ...track, type: "liked_songs" };
            });
            const myPlaylists = playlists.map((playlist) => {
                return { ...playlist, type: "playlist" };
            });
            const myArtists = artists.map((artist) => {
                return { ...artist, type: "artist" };
            });

            const playlistsData = [
                ...myLikedSongs,
                ...myPlaylists,
                ...myArtists,
            ];

            const sortedPlaylists = playlistsData.sort(
                (a, b) => new Date(b.followed_at) - new Date(a.followed_at)
            );

            dispatch("SET_PLAYLIST", sortedPlaylists);
        } catch (error) {
            console.log(error);
        }
    }

    // Render Playlists
    async _handleRenderPlaylist(viewAsValue) {
        const wrapper = document.querySelector(".library-content.active");
        const { user } = this.props;
        if (!user) {
            wrapper.innerHTML = "";
            return;
        }

        const sortedPlaylists = this.props.playlists;

        const renderMap = {
            default_list: this._renderDefaultList,
            compact_list: this._renderCompactList,
            default_grid: this._renderDefaultGrid,
            compact_grid: this._renderCompactGrid,
        };
        const renderFunction =
            renderMap[viewAsValue] || this._renderDefaultList;

        const artistHtml = sortedPlaylists
            .map((item) => renderFunction(item))
            .join("");

        wrapper.innerHTML = artistHtml;
    }
    // Recent tooltip
    _handleRecentTooltip() {
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

        document.addEventListener("click", (e) => {
            if (!this.sortInstance.tooltipEle.contains(e.target)) {
                this.sortInstance.hide();
                this.isShown = false;
            }
        });

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
                // Render playlist
                this._handleRenderPlaylist(viewAsValue);
            } else {
                item.classList.remove("active");
            }
        });
    }

    // Search
    _handleSearchBtn() {
        const searchWrapEle = document.querySelector(".search-library-wrap");

        // Click search btn
        searchWrapEle.onclick = (e) => {
            if (!searchWrapEle.classList.contains("active")) {
                e.stopPropagation();
                searchWrapEle.classList.add("active");
            }
        };

        // Click outside
        document.addEventListener("click", (e) => {
            if (!searchWrapEle.contains(e.target)) {
                searchWrapEle.classList.remove("active");
            }
        });
    }

    // Nav tabs
    _handleNavTabs() {
        const navtabs = document.querySelectorAll(".nav-tab");

        navtabs.forEach((nav) => {
            nav.onclick = async () => {
                await this._handleGetPlaylist();
                if (nav.className.includes("active")) {
                    nav.classList.remove("active");
                } else {
                    navtabs.forEach((nav) => nav.classList.remove("active"));
                    nav.classList.add("active");
                    dispatch("NAV_PLAYLIST", nav.dataset.type);
                }
            };
        });
    }

    // Context Menu
    _handleContenxtMenu() {
        if (this.contextMenu) return;
        this.contextMenu = new Tooltip(".library-content", {
            render: this._renderContextItem.bind(this),
            trigger: "contextmenu",
        });

        document.addEventListener("contextmenu", (e) => {
            if (
                !this.contextMenu.targetEle.contains(e.target) &&
                !this.contextMenu.tooltipEle.contains(e.target)
            ) {
                this.contextMenu.hide();
            } else {
                const targetEle = e.target;
                const item = targetEle.closest(".library-item");
                this.menuContextItem = item;

                this.contextMenu.rerender();
            }
        });

        document.addEventListener("click", (e) => {
            if (
                !this.contextMenu.targetEle.contains(e.target) &&
                !this.contextMenu.tooltipEle.contains(e.target)
            ) {
                this.contextMenu.hide();
            }
        });
    }
    _renderContextItem() {
        const contextMenuWrapper = document.createElement("ul");
        contextMenuWrapper.className = "library-menu-list";

        // Unfollow Item
        const deleteItem = document.createElement("li");
        deleteItem.className = "library-menu-item";

        const deleteIconItem = document.createElement("i");
        deleteIconItem.className = "fa-solid fa-x";
        deleteIconItem.style.color = "green";

        const deleteTextItem = document.createElement("span");

        const type = this.menuContextItem?.dataset?.type;
        deleteTextItem.innerText = `Unfollow this ${
            type === "artist" ? "artist" : "playlist"
        }`;

        deleteTextItem.className = "library-menu-item-text";

        deleteItem.append(deleteIconItem, deleteTextItem);

        // Ban Item
        const banItem = document.createElement("li");
        banItem.className = "library-menu-item";

        const banIconItem = document.createElement("i");
        banIconItem.className = "fa-solid fa-ban";
        banIconItem.style.color = "rgb(159 155 155)";

        const banTextItem = document.createElement("span");
        banTextItem.innerText = "Don't play this artist";
        banTextItem.className = "library-menu-item-text";

        banItem.append(banIconItem, banTextItem);

        contextMenuWrapper.append(deleteItem, banItem);

        deleteItem.onclick = async () => {
            const { id, type } = this.menuContextItem.dataset;

            if (type === "artist") {
                try {
                    await httpRequest.del(`artists/${id}/follow`);
                    dispatch("REMOVE-PLAYLIST-ITEM", id);
                    this.contextMenu.hide();
                } catch (error) {
                    console.log(error);
                }
            } else if (type === "playlist") {
                try {
                    await httpRequest.del(`playlists/${id}`);
                    dispatch("REMOVE-PLAYLIST-ITEM", id);
                    this.contextMenu.hide();
                } catch (error) {
                    console.log(error);
                }
            }
        };

        return contextMenuWrapper;
    }

    _handleClickLogo() {
        const logo = document.querySelector(".logo");

        logo.onclick = () => {
            document.dispatchEvent(new CustomEvent("back-to-home"));
        };
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

    _handleCreatePlaylist() {
        const createBtn = document.querySelector("#library-create-btn");

        createBtn.onclick = () => {
            document.dispatchEvent(new CustomEvent("create:playlist"));
        };
    }

    // Render library
    _renderDefaultList(item) {
        return `
        <a href="/?${item.type}=${item.id}">
            <div class="library-item" data-type="${item.type}" data-id="${
            item.id
        }">
                <img src="${item.image_url}" alt="${
            item.name
        }" class="item-image" />
                <div class="item-info">
                    <div class="item-title">${item.name}</div>
                    <div class="item-subtitle">
                        ${
                            item.type === "artist"
                                ? "Artist"
                                : `Playlist • ${item.user_display_name}`
                        }
                    </div>
                </div>
            </div>
        </a>
    `;
    }

    _renderCompactList(item) {
        return `
       <div class="library-item library-compact_list-item">
            <div class="item-title">${item.name}</div>
            <p class="library-content-separate"></p>
            <div class="item-subtitle">${
                item.type === "artist"
                    ? "Artist"
                    : `Playlist • ${item.user_display_name}`
            }</div>
        </div>
    `;
    }

    _renderDefaultGrid(item) {
        return `
         <div class="library-item library-default-grid-item active">
            <img
                src="${item.image_url}"
                alt="${item.name}"
                class="library-default-grid-item-image item-image"
            />
            <div class="item-info">
                <div class="item-title">${item.name}</div>
                <div class="item-subtitle">${
                    item.type === "artist"
                        ? "Artist"
                        : `Playlist • ${item.user_display_name}`
                }</div>
            </div>
        </div>
    `;
    }

    _renderCompactGrid(item) {
        return `
        <div class="library-item library-compact-grid-item">
            <img
                src="${item.image_url}"
                alt="${item.name}"
                class="library-compact-grid-item-image item-image"
            />
        </div>
    `;
    }
}

customElements.define("spotify-sidebar", connect()(Sidebar));
