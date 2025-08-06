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
            },
            options
        );
        this.tooltipEle = document.createElement("div");
        this.tooltipEle.className = "tooltip";

        const tooltipContentEle = document.createElement("p");
        tooltipContentEle.className = "tooltip-content";
        tooltipContentEle.textContent = options.content || "";

        this.tooltipEle.appendChild(tooltipContentEle);

        this._hoverTimeout = null;

        this._init();
    }

    _init() {
        // Set pos
        this.targetEle.addEventListener(
            "mouseover",
            this._handleMouseOver.bind(this)
        );
        this.targetEle.addEventListener(
            "mouseout",
            this._handleMouseOut.bind(this)
        );
    }

    // Check and set pos
    _setValidPosition(initialPosition) {
        let { top, left } = this._setPosition(initialPosition);

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

    // Set pos
    _setPosition(position) {
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
        }

        // Bù lại scroll nếu tooltip là absolute (so với document)
        top += window.scrollY;
        left += window.scrollX;

        return { top, left };
    }

    // Hover
    _handleMouseOver() {
        this._hoverTimeout = setTimeout(() => {
            document.body.appendChild(this.tooltipEle);

            const position = this.options.position;
            this._setValidPosition(position);

            this.tooltipEle.classList.add("active");
        }, this.options.delay);
    }

    _handleMouseOut() {
        if (this._hoverTimeout) {
            clearTimeout(this._hoverTimeout);
            this._hoverTimeout = null;
        }

        if (this.tooltipEle.classList.contains("active")) {
            this.tooltipEle.classList.remove("active");

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
    }
}

export default Tooltip;
