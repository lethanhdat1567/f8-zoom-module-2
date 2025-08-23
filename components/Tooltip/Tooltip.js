class Tooltip {
    constructor(selector, options = {}) {
        this.targetEle = document.querySelector(selector);

        if (!this.targetEle) {
            console.error("Target element not found");
            return;
        }

        this.options = Object.assign(
            {
                content: "",
                position: "bottom",
                delay: 200,
                // manual, contextmenu
                trigger: null,
                render: null,
            },
            options
        );

        this._init();
    }

    _init() {
        // State hover
        this.isCheduled = false;
        this._hoverTimeout = null;

        this._createTooltip();

        if (this.options.trigger === "contextmenu") {
            this.targetEle.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                this.show(e);
            });
        } else if (this.options.trigger !== "manual") {
            this.targetEle.addEventListener(
                "mouseover",
                this._handleMouseOver.bind(this)
            );
            this.targetEle.addEventListener(
                "mouseout",
                this._handleMouseOut.bind(this)
            );
        }
    }

    _createTooltip() {
        this.tooltipEle = document.createElement("div");
        this.tooltipEle.className = "tooltip";

        if (this.options.render) {
            if (this.options.content) {
                const error = new Error("Can't use both content and render");
                throw error;
            } else {
                if (!this.options.render(this)) {
                    throw new Error("render need to be return");
                }
                const renderedEle = this.options.render(this);
                this.tooltipEle.appendChild(renderedEle);
            }
        }
        // If don't have render and have content
        else {
            const tooltipContentEle = document.createElement("p");
            tooltipContentEle.className = "tooltip-content";
            tooltipContentEle.textContent = this.options.content || "";

            this.tooltipEle.appendChild(tooltipContentEle);
        }
    }

    // Check and set pos
    _setValidPosition(initialPosition) {
        let { top, left } = this._getPosition(initialPosition);

        const tooltipWidth = this.tooltipEle.offsetWidth;
        const tooltipHeight = this.tooltipEle.offsetHeight;

        // Lấy viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const scrollTop = window.scrollY;
        const scrollLeft = window.scrollX;

        // Vèn trái/phải
        if (left < scrollLeft) {
            left = scrollLeft + 4; // padding nhỏ
        } else if (left + tooltipWidth > scrollLeft + viewportWidth) {
            left = scrollLeft + viewportWidth - tooltipWidth - 4;
        }

        // Vèn trên/dưới
        if (top < scrollTop) {
            top = scrollTop + 4;
        } else if (top + tooltipHeight > scrollTop + viewportHeight) {
            top = scrollTop + viewportHeight - tooltipHeight - 4;
        }

        this.tooltipEle.style.position = "absolute";
        this.tooltipEle.style.top = `${top}px`;
        this.tooltipEle.style.left = `${left}px`;
    }

    // get pos
    _getPosition(position) {
        const space = 8;

        const targetRect = this.targetEle.getBoundingClientRect();
        const tooltipRect = this.tooltipEle.getBoundingClientRect();

        let top = 0;
        let left = 0;

        switch (position) {
            case "top":
                top = targetRect.top - tooltipRect.height - space;
                left =
                    targetRect.left +
                    targetRect.width / 2 -
                    tooltipRect.width / 2;
                break;
            case "bottom":
                top = targetRect.bottom + space;
                left =
                    targetRect.left +
                    targetRect.width / 2 -
                    tooltipRect.width / 2;
                break;
            case "left":
                top =
                    targetRect.top +
                    targetRect.height / 2 -
                    tooltipRect.height / 2;
                left = targetRect.left - tooltipRect.width - space;
                break;
            case "right":
                top =
                    targetRect.top +
                    targetRect.height / 2 -
                    tooltipRect.height / 2;
                left = targetRect.right + space;
                break;
            case "top-left":
                top = targetRect.top - tooltipRect.height - space;
                left = targetRect.left;
                break;
            case "top-right":
                top = targetRect.top - tooltipRect.height - space;
                left = targetRect.right - tooltipRect.width;
                break;
            case "bottom-left":
                top = targetRect.bottom + space;
                left = targetRect.left;
                break;
            case "bottom-right":
                top = targetRect.bottom + space;
                left = targetRect.right - tooltipRect.width;
                break;
        }

        // Bù lại scroll nếu tooltip là absolute (so với document)
        top += window.scrollY;
        left += window.scrollX;

        return { top, left };
    }

    // Hover
    _handleMouseOver() {
        if (this.isCheduled) return;

        this.isCheduled = true;

        this._hoverTimeout = setTimeout(() => {
            document.body.appendChild(this.tooltipEle);

            const position = this.options.position;
            this._setValidPosition(position);

            this.tooltipEle.classList.add("active");

            this.isCheduled = false;
            this._hoverTimeout = null;
        }, this.options.delay);
    }

    _handleMouseOut() {
        if (this._hoverTimeout) {
            clearTimeout(this._hoverTimeout);
            this._hoverTimeout = null;
        }

        if (this.tooltipEle.classList.contains("active")) {
            this.tooltipEle.classList.remove("active");
            this.isVisible = false;

            this.tooltipEle.addEventListener(
                "transitionend",
                () => {
                    if (document.body.contains(this.tooltipEle)) {
                        document.body.removeChild(this.tooltipEle);
                    }
                },
                { once: true }
            );
        }

        this.isCheduled = false;
    }

    show(e) {
        document.body.appendChild(this.tooltipEle);

        if (e && e.type === "contextmenu") {
            this.tooltipEle.style.position = "absolute";
            this.tooltipEle.style.top = `${e.pageY}px`;
            this.tooltipEle.style.left = `${e.pageX}px`;
        } else {
            const position = this.options.position;
            this._setValidPosition(position);
        }

        this.tooltipEle.classList.add("active");
    }

    hide() {
        this.tooltipEle.classList.remove("active");

        setTimeout(() => {
            if (document.body.contains(this.tooltipEle)) {
                document.body.removeChild(this.tooltipEle);
            }
        }, 200);
    }

    rerender() {
        if (!this.tooltipEle) return;
        this.tooltipEle.innerHTML = "";

        if (this.options.render) {
            const renderedEle = this.options.render(this);
            if (!renderedEle) {
                throw new Error("render must return an element");
            }
            this.tooltipEle.appendChild(renderedEle);
        } else if (this.options.content) {
            const tooltipContentEle = document.createElement("p");
            tooltipContentEle.className = "tooltip-content";
            tooltipContentEle.textContent = this.options.content;
            this.tooltipEle.appendChild(tooltipContentEle);
        }
    }
}

export default Tooltip;
