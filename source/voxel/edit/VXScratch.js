class VXScratch {
    constructor(transparent) {
        document.body.appendChild(this.canvas = createCanvas(transparent ? "transparent" : "#ff0000"));
    }

    get context() {
        return this._context ? this._context : this._context = this.canvas.getContext("2d");
    }

    set cursor(a) { this.canvas.style.cursor = a; }
    get cursor() { return this.canvas.style.cursor; }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    resize(x, y, w, h) {
        this.canvas.style.left = x + "px";
        this.canvas.style.top = y + "px";
        this.canvas.width = w;
        this.canvas.height = h;
    }

}