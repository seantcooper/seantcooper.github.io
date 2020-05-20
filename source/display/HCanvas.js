class HCanvas {
    constructor(color, ratio) {
        document.body.appendChild(this.canvas = document.createElement('canvas'));
        this.canvas.style.position = "fixed";
        this.canvas.style.background = color ? color : "#000000";
        this._ratio = ratio ? ratio : window.devicePixelRatio;
    }

    get width() { return this.canvas.width / this.ratio; }
    get height() { return this.canvas.height / this.ratio; }

    get context2d() {
        var ctx = this.canvas.getContext("2d");
        ctx.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
        return ctx;
    }
    get style() { return this.canvas.style; }
    position(x, y) {
        this.canvas.style.left = x + "px";
        this.canvas.style.top = y + "px";
    }
    size(w, h) {
        this.canvas.width = w * this.ratio;
        this.canvas.height = h * this.ratio;
        this.canvas.style.width = w + "px";
        this.canvas.style.height = h + "px";
    }
    remove() {
        this.canvas.remove();
    }

    get ratio() { return this._ratio; }
}