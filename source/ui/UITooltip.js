class UITooltip {
    constructor() {
        document.body.appendChild(this.canvas = createCanvas("#FFF4C4"));
        this.canvas.style.visibility = "hidden";
        this.canvas.style.boxShadow = "2px 2px 10px rgba(0, 0, 0, 0.5)";
        this.font = uicss.fontMedium;
        this.canvas.width = this.canvas.height = 1;
    }
    static get instance() { return UITooltip._instance ? UITooltip._instance : UITooltip._instance = new UITooltip(); }

    static update() { UITooltip.instance._update(); }
    static setControl(control) {
        UITooltip.instance.control = control;
        if (UITooltip.instance.canvas.style.visibility == "hidden")
            UITooltip.instance.timeout = Date.now() + 500;
    }
    static cancelControl(control) {
        if (UITooltip.instance.control == control) {
            UITooltip.instance.cancelTimeout = Date.now() + 100;
            UITooltip.instance.control = null;
        }
    }
    _update() {
        var now = Date.now();
        if (!this.control && now > this.cancelTimeout && this.canvas.style.visibility == "visible")
            this.canvas.style.visibility = "hidden";
        this.control && now > this.timeout && this.show(this.control);

    }
    cancel() { }
    setControl(control) {
        this.control = control;
        this.timeout = Date.now() + 500;
    }
    setPosition(x, y) {
        this.canvas.style.left = Math.floor(x) + "px";
        this.canvas.style.top = Math.floor(y) + "px";
    }
    show(control) {
        var r = control.screenRect;
        this.text = control.tooltip;

        this.canvas.style.visibility = "visible";
        var ctx = this.canvas.getContext("2d");
        ctx.font = this.font;

        this.canvas.width = ctx.measureText(this.text).width + 10;
        this.canvas.height = 22;
        var d = 10, y = r.bottom + d;
        if (y + this.canvas.height > window.innerHeight) {
            y = r.top - (22 + d);
        }


        this.setPosition(r.x + r.width / 2, y);

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.font = this.font;
        ctx.fillStyle = "#120002";
        ctx.fillText(this.text, this.canvas.width / 2, this.canvas.height / 2);
    }
}