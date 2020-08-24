class UIFolder extends UIContainer {
    constructor(title, container) {
        super();
        this.addControl(this.title = new UIFolderTitle(title));
        this.title.events.add("click", this.headerClick.bind(this));
        this.addControl(new UISpacer());
        this.addControl(this.container = container);
        this.addControl(this.spacer = new UISpacer());
        this.expand();
    }
    get expanded() { return this.title.expanded; }
    collapse() { this.spacer.visible = this.container.visible = this.title.expanded = false; }
    expand() { this.spacer.visible = this.container.visible = this.title.expanded = true; }
    headerClick() { this.expanded ? this.collapse() : this.expand(); }
}

class UIFolderTitle extends UIButton {
    constructor(title) {
        super(title);
        this.margin = 0;
        this.font = uicss.fontSmall;
        this.textAlign = "left";
        this.corners = 0;
    }

    set expanded(a) { this._expanded = a; this.invalidate(); }
    get expanded() { return this._expanded; }

    paintBackground() {
        super.paintBackground();
        var ctx = UIStage.context, r = this.clientRect, img = this.expanded ? UITools.ICON_EXPAND : UITools.ICON_COLLAPSE;
        img && ctx.drawImage(img.image, img.x, img.y, img.width, img.height, r.x, r.y, r.height, r.height);
    }
    paintText() { var r = this.clientRect, dx = r.height * 0.75; this._fillText(this.text, r.x + dx, r.y, r.width - dx, r.height, this._textAlign, this._font); }
}