UIControlID = 0;
class UIControl {
    constructor() {
        this.id = ++UIControlID;
        this._size = new Size(1, 1);
        this._displayRect = new Rect();
        this._layout = null;
        this._margin = uicss.margin;
        this._bgcolor = uicss.bgcolor;
        this._fgcolor = uicss.fgcolor;
        this.selectedColor = uicss.selectedColor; // temp buttons only
        this._enabled = this._visible = true;
        this._font = uicss.font;
        this.mouse = { position: new Point(), down: false, over: false };
        this._controls = [];
        this.events = new EventDispatcher(this);
        this.corners = 4;
        this.layoutRect = new Rect();
    }
    init(obj) { for (var prop in obj) this[prop] = obj[prop]; return this; }
    invalidate(recursive) {
        this._clientRect = null; this._validated = false;
        recursive && this.descendants.forEach(function (c) { c.invalidate(); })
        this.onInvalidate();
    }
    validate() { this._validated = true; }
    onInvalidate() { }
    initialize() {
        if (!this.initialized) {
            this.onInitialize(); this.initialized = true;
            this._controls.forEach(function (c) { c.initialize(); })
        }
    }
    onInitialize() { this.events.raise("initialize"); }
    get validated() { return this._validated && this._controls.all(function (c) { return c.validated; }); }

    // paint
    onPaint() {
        if (!this._visible) return;
        var r = this.clientRect;
        this.paintBackground();
        this.text && this.text.length && this.paintText();
        this.image && this.paintImage();
        this.paintChildren();
        this.paintForeground && this.paintForeground();
    }
    paintBackground() {
        var r = this.clientRect, b = this._border;
        // if (b) {
        //     this._fillRect(this.fgpaint.html, r.x, r.y, r.width, r.height);
        //     this._fillRect(this.bgpaint.html, r.x + b, r.y + b, r.width - b * 2, r.height - b * 2);
        // }
        // else {
        //     this._fillRect(this.bgpaint.html, r.x, r.y, r.width, r.height);
        // }
        this._fillRect(b ? this.fgpaint.html : this.bgpaint.html, r.x, r.y, r.width, r.height);
        b && this._fillRect(this.bgpaint.html, r.x + b, r.y + b, r.width - b * 2, r.height - b * 2);
    }
    paintImage() {
        var im = this.image, r = this.clientRect, w = r.width, h = r.height, r1 = im.width / im.height, r2 = w / h, offx = 0, offy = 0;
        r1 <= r2 ? offx = (r.width - (w = r.height / r1)) / 2 : offy = (r.height - (h = r.width * r1)) / 2
        UIStage.context.drawImage(im.image, im.x, im.y, im.width, im.height, r.x + offx, r.y + offy, w, h);
    }

    paintText() { var r = this.clientRect; this._fillText(this.text, r.x, r.y, r.width, r.height, this._textAlign, this._font); }
    paintChildren() { for (var _control of this._controls) _control.onPaint(); }
    getBGColor(_color) { return this.buttonMode ? this.buttonMode.getBGColor(_color) : _color; }
    getFGColor(_color) { return this.buttonMode ? this.buttonMode.getFGColor(_color) : _color; }
    get fgpaint() { return this.getFGColor(this.fgcolor); }
    get bgpaint() { return this.getBGColor(this.bgcolor); }

    // text
    get text() { return this._text; }
    set text(a) { this._text = a; this.invalidate(); }
    get textAlign() { return this._textAlign; }
    set textAlign(a) { this._textAlign = a; this.invalidate(); }

    // style
    get bgcolor() { return this._bgcolor; }
    set bgcolor(a) { this._bgcolor = a; this.invalidate(); }
    get fgcolor() { return this._fgcolor; }
    set fgcolor(a) { this._fgcolor = a; this.invalidate(); }
    get visible() { return this._visible; }
    set visible(a) { if (this._visible != a) { this._visible = a; this.onVisibleChanged(); this.invalidate(true); } }
    isVisible() {
        for (var ancestors = this.ancestors, i = ancestors.length - 1; i >= 0; --i) { if (!ancestors[i].visible) return false; }
        return this.visible;
    }
    get enable() { return this._enable; }
    set enable(a) { if (this._enable != a) { this._enable = a; this.onEnableChanged(); this.invalidate(); } }
    get border() { return this._border; }
    set border(a) { this._border = a; this.invalidate(); }
    onVisibleChanged() { this.events.raise("visiblechanged"); }
    onEnabledChanged() { this.events.raise("enabledchanged"); }

    // children
    get controls() { return this._controls.slice(); }
    addControl(control) {
        control.parent && control.parent.removeControl(control);
        control.parent = this; this._controls.push(control); this.stage && control.onInitialize();
    }
    addControls(controls) { for (var control of controls) this.addControl(control); }
    removeControl(control) { this._controls.splice(this._controls.indexOf(control), 1); control.parent = null; }
    clearControls() { for (var control of this.controls) this.removeControl(control); }
    get stage() { var _stage = this.ancestors.first(); return (_stage instanceof UIStage) ? _stage : null; }
    get children() { return this._children.slice(); }
    get descendants() { var a = [this]; this._controls.forEach(function (c) { a.push.apply(a, c.descendants) }); return a; }
    get ancestors() { for (var p = this.parent, a = []; p; a.unshift(p), p = p.parent); return a; }
    get first() { return this._controls.legnth ? this._controls[0] : null; }
    get last() { return this._controls.legnth ? this._controls[this._controls.length - 1] : null; }
    performLayout(rect) {
        this.layoutRect = rect;
        this._controls.length && this._layout && this._layout.perform(this, rect);
        this.setDisplayRect(rect);
        this.onLayout();
    }
    setDisplayRect(rect) {
        if (!this._displayRect.equals(rect)) {
            this._displayRect.copyFrom(rect);
            this.invalidate();
            this.onDisplayRectChanged();
        }
    }
    // location & size
    onLayout() { }
    onDisplayRectChanged() { }
    get layout() { return this._layout; }
    set layout(a) { this._layout = a; this.invalidate(); }
    get margin() { return this._margin; }
    set margin(a) { this._margin = a; this.invalidate(); }
    get size() { return this._size.clone(); }
    set size(a) { this._size = a.clone(); this.invalidate(); }
    get displayRect() { return this._displayRect.clone(); }
    get screenRect() { var r = this.clientRect.clone(); r.offset(this.stage.screenX, this.stage.screenY); return r; }
    get clientRect() { !this._clientRect && (this._clientRect = this.getClientRect(this.displayRect)); return this._clientRect; }
    getClientRect(rect) { return new Rect(rect.x + this._margin, rect.y + this._margin, rect.width - this._margin * 2, rect.height - this._margin * 2); }

    // Behaviour
    get buttonMode() { return this._buttonMode; }
    set buttonMode(a) { this._buttonMode = a; this._buttonMode && (this._buttonMode.parent = this); }
    get buttonMode() { return this._buttonMode; }
    set buttonMode(a) { this._buttonMode = a; this._buttonMode && (this._buttonMode.parent = this); }
    get hover() { return this._hover; }
    set hover(a) { if (this._hover != a) { this._hover = a; this.invalidate(); } }
    get hoverDown() { return this._hoverDown; }
    set hoverDown(a) { if (this._hoverDown != a) { this._hoverDown = a; this.invalidate(); } }
    select() { if (!this.selected) { this.selected = true; this.invalidate(); this.events.raise("selected"); } }
    deselect() { if (this.selected) { this.selected = false; this.invalidate(); this.events.raise("deselected"); } }
    // Mouse
    onMouseMove(e) { }
    onMouseDown(e) { this.OnMouseButtonMode("onMouseDown", e); this.mouse.down = this.mouse.position.clone(); this.events.raise("mousedown"); this.invalidate(); }
    onMouseUp(e) { this.OnMouseButtonMode("onMouseUp", e); this.events.raise("mouseup"); this.mouse.down = null; this.invalidate(); }
    onMouseClick(e) { this.OnMouseButtonMode("onMouseClick", e); this.events.raise("click"); }
    onMouseOver(e) { this.OnMouseButtonMode("onMouseOver", e); this.tooltip && UITooltip.setControl(this); }
    onMouseOut(e) { this.OnMouseButtonMode("onMouseOut", e); UITooltip.cancelControl(this); }
    OnMouseButtonMode(funcName, e) { this._buttonMode && (this._buttonMode[funcName](e)); }
    onMouseWheel(e) { }
    onMouse(e) {
        if (!this._visible || !this._enabled) return;
        var _mouseover = (function () {
            this.mouse.position = new Point(e.position.x - this.clientRect.x, e.position.y - this.clientRect.y);
            var _over = this.clientRect.containsPoint(e.position);
            (_over != this.mouse.over) && ((this.mouse.over = _over) ? this.onMouseOver(e) : this.onMouseOut(e));
        }).bind(this);

        switch (e.type) {
            case "mousemove": _mouseover(); (this.mouse.over || this.mouse.down) && this.onMouseMove(e); break;
            case "mouseup": _mouseover(); this.mouse.down && e.button == Mouse.LEFT && this.onMouseUp(e); break;
            case "mousedown": _mouseover(); this.mouse.over && e.button == Mouse.LEFT && this.onMouseDown(e); break;
            case "click": _mouseover(); this.mouse.over && e.button == Mouse.LEFT && this.onMouseClick(e); break;
            case "wheel": this.mouse.over && this.onMouseWheel(e); break;
        }
        this._controls.forEach(function (c) { c.onMouse(e); });
    }

    // Draw Tools
    _fillRect(_style, x, y, w, h) {
        this.corners ? this._pathRoundRect(x, y, w, h, this.corners) : this._pathRect(x, y, w, h);
        UIStage.context.fillStyle = _style;
        UIStage.context.fill();
    }
    _strokeRect(_style, x, y, w, h, thickness) {
        thickness && (UIStage.context.lineWidth = thickness);
        this.corners ? this._pathRoundRect(x, y, w, h, this.corners) : this._pathRect(x, y, w, h);
        UIStage.context.strokeStyle = _style;
        UIStage.context.stroke();
    }
    _strokeLine(_style, x1, y1, x2, y2, thickness) {
        thickness && (UIStage.context.lineWidth = thickness);
        UIStage.context.beginPath();
        UIStage.context.moveTo(x1, y1);
        UIStage.context.lineTo(x2, y2);
        UIStage.context.closePath();
        UIStage.context.strokeStyle = _style;
        UIStage.context.stroke();
    }
    _pathRect(x, y, w, h, ) {
        UIStage.context.beginPath();
        UIStage.context.rect(x, y, w, h);
        UIStage.context.closePath();
    }
    _pathRoundRect(x, y, w, h, r) {
        var ctx = UIStage.context;
        var sx = x, sy = y, ex = x + w, ey = y + h;
        var r2d = Math.PI / 180;
        ctx.beginPath();
        ctx.moveTo(sx + r, sy);
        ctx.lineTo(ex - r, sy);
        ctx.arc(ex - r, sy + r, r, r2d * 270, r2d * 360, false);
        ctx.lineTo(ex, ey - r);
        ctx.arc(ex - r, ey - r, r, r2d * 0, r2d * 90, false);
        ctx.lineTo(sx + r, ey);
        ctx.arc(sx + r, ey - r, r, r2d * 90, r2d * 180, false);
        ctx.lineTo(sx, sy + r);
        ctx.arc(sx + r, sy + r, r, r2d * 180, r2d * 270, false);
        ctx.closePath();
    }
    _fillText(text, x, y, w, h, align, font) {
        x = Math.round(x);
        y = Math.round(y);
        var m = uicss.textMargin;
        UIStage.context.textBaseline = "middle";
        UIStage.context.textAlign = align ? align : "center";
        UIStage.context.font = font;
        UIStage.context.fillStyle = this.fgpaint.html;
        switch (UIStage.context.textAlign) {
            case "center": x += w / 2; break;
            case "left": x += m; break;
            case "right": x = (x + w) - m; break;
        }
        UIStage.context.fillText(text, x, y + h / 2);
    }
}

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------
class ButtonMode {
    constructor() { }
    onMouseOver(e) { this.parent.hover = true; }
    onMouseOut(e) { this.parent.hover = false; }
    onMouseDown(e) { this.parent.hoverDown = true; }
    onMouseUp(e) { this.parent.hoverDown = false; }
    onMouseClick(e) { }
    getBGColor(_color) {
        var p = this.parent;
        return p.selected || p.hoverDown ? p.selectedColor : (p.hover || p.mouse.down ? _color.brightness(uicss.hover) : _color);
    }
    getFGColor(_color) {
        var p = this.parent;
        return (p.selected || p.hoverDown || p.hover || p.mouse.down) ? _color.brightness(uicss.hover) : _color;
    }
}

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------
class ButtonModeList extends ButtonMode {
    constructor(_group) { super(); this.group = _group; }
    onMouseClick(e) {
        if (!this.parent.selected) {
            for (var button of this.group) (button != this.parent) && button.deselect();
            this.parent.select();
        }
    }
}
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------
class ButtonModeToggle extends ButtonMode {
    constructor() { super(); }
    onMouseClick(e) { this.parent.selected ? this.parent.deselect() : this.parent.select(); }
}
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------
