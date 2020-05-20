class UIColorPicker extends UIContainer {
    constructor() {
        super();
        this.margin = 4;
        this.rgb = new ColorRGB(0, 0, 0); this.hsl = this.rgb.hsl; this.hsv = this.rgb.hsv;

        this.colorBars = new UITabs();
        this.colorBars.addTab("RGB", new CPPanel("rgb", this.rgb, ["red", "green", "blue"]));
        this.colorBars.addTab("HSV", new CPPanel("hsv", this.hsv, ["hue", "saturation", "value"]));
        this.colorBars.addTab("HSL", new CPPanel("hsl", this.hsl, ["hue", "saturation", "lightness"]));
        this.colorBars.tabWidth = 0.333;

        // add controls
        this.addControl(this.colorBars);
        this.addControl(new UISpacer());
        this.addControl(this.html = new CPHTMLColor(this.rgb));
        this.addControl(new UISpacer());
        this.addControl(this.palette = new CPPalette());

        // listen for changes
        var _colorchanged = (function (e) { this.selectColor(e.target.color.rgb); }).bind(this);
        var _startcolorchanged = (function (e) { Editor.self.addHistoryPalette(); }).bind(this);

        this.palette.events.add("selected", _colorchanged);
        this.palette.events.add("colorschanged", _colorchanged);
        this.html.events.add("colorchanged", _colorchanged);
        this.html.events.add("startcolorchanged", _startcolorchanged);
        for (var panel of this.colorBars.panels) {
            panel.events.add("startcolorchanged", _startcolorchanged);
            panel.events.add("colorchanged", _colorchanged);
        }

        // set
        this.palette.selectedIndex = 1;
        this.colorBars.selectTab("rgb");
    }

    get index() { return this.palette.selectedIndex; }
    set index(a) { this.palette.selectedIndex = a; }
    get color() { return this.rgb.toColor(); }

    selectColor(color) {
        this.rgb.copyFrom(color);
        this.hsl.rgb = this.rgb;
        this.hsv.rgb = this.rgb;
        this.palette.color = this.rgb;
        this.invalidate(true);
    }
}

//==============================================================================================================================================================================
class CPPanel extends UIContainer {
    constructor(name, color, components) {
        super();
        this.name = name;
        this.color = color;
        this.components = components;
        this.addControls(this.sliders);
    }

    _valueChanged(e) {
        this.sliders.forEach(function (c) { c.invalidate(); });
        this.events.raise("colorchanged");
    }
    _startValueChange(e) { this.events.raise("startcolorchanged"); }

    get sliders() {
        if (!this._sliders) {
            (this._sliders = this.components.select((function (c) { return new UISliderRGB(this.color, c) }).bind(this)));
            for (var slider of this._sliders) {
                slider.events.add("mousedown", this._startValueChange.bind(this));
                slider.events.add("valuechanged", this._valueChanged.bind(this));
            }
        }
        return this._sliders;
    }
}

//==============================================================================================================================================================================

class CPHTMLColor extends UIContainer {
    constructor(color) {
        super();
        this.layout = new UIHorizontalLayout();
        this.color = color;
        this.button = (new UIControl()).init({ size: new Size(uicss.ratio, 1) });
        this.html = (new UITextInput(this.color.html)).init({ size: new Size(1 - uicss.ratio, 1) });
        this.html.events.add("textchanged", this._textchanged.bind(this));
        this.addControls([this.button, this.html]);
    }

    _textchanged(e) {
        this.events.raise("startcolorchanged");
        Color.validateHTML(this.html.text) ? this.color.html = this.html.text : this.html.text = this.color.html;
        this.invalidate();
        this.events.raise("colorchanged");
    }

    onInvalidate() {
        super.onInvalidate();
        if (!this.color) return;
        this.html.text = this.color.rgb.html;
        this.button.bgcolor = this.color.rgb.toColor();
    }
}

//==============================================================================================================================================================================
class CPPalette extends UIControl {
    constructor() {
        super();
        this.columns = 8;
        this.rows = 32;
        this.size = new Size(1, this.rows * uicss.ratio);
        this.corners = null;
        trace("Palette:", this.palette);
        this.palette.events.add("colorschanged", this.onColorsChanged.bind(this));
    }

    get palette() { return Editor.self.map.palette; }
    set selectedIndex(a) {
        if (this._selectedIndex != a) {
            this._selectedIndex = a;
            this.events.raise("selected");
            this.invalidate();
        }
    }
    get selectedIndex() { return this._selectedIndex; }
    set color(a) { this.palette.setColor(this.selectedIndex, a.toColor()); }
    get color() { return ColorRGB.fromColor(this.palette.getColor(this.selectedIndex)); }

    get colors() { return this.palette.colors.slice(); }
    set colors(a) {
        this.palette.setColors(a);
        this.onColorsChanged();
    }

    onColorsChanged() {
        this.events.raise("colorschanged");
        this.invalidate();
    }

    paintBackground() {
        var m = 0.5, rect = new Rect();
        for (var cell of this.table) {
            rect.copyFrom(cell.rect);
            rect.deflate(m);
            this._fillRect(cell.color.html, rect.x, rect.y, rect.width, rect.height, 2);
        }

        var rect = this.table[0].rect.clone();
        rect.deflate(m);
        this._fillRect("red", rect.x, rect.y, rect.width, rect.height, 2);
        rect.deflate(2);
        this._fillRect("white", rect.x, rect.y, rect.width, rect.height, 2);
        this._strokeLine("red", rect.right, rect.top, rect.left, rect.bottom, 2);

        rect = this.table[this.selectedIndex].rect.clone();
        rect.inflate(1);
        this._strokeRect(this.fgcolor.html, rect.x, rect.y, rect.width, rect.height);
    }

    onMouseDown(e) {
        super.onMouseDown(e);
        this.drag = this.getColorIndexAt(this.mouse.position.x, this.mouse.position.y);
        this.dragCanvas;
        this.selectedIndex = this.drag;
    }

    onMouseMove(e) {
        if (this.drag) {
            var rect = this.table[this.drag].rect, clientLocation = this.clientRect.location;
            var offset = new Point(this.mouse.down.x - rect.x + clientLocation.x, this.mouse.down.y - rect.y + clientLocation.y);
            if (!this.dragCanvas) {
                this.dragCanvas = new HCanvas(this.palette.getColor(this.drag).html, 1);
                this.dragCanvas.style.border = "1px solid #000000";
                this.dragCanvas.size(rect.width, rect.height);
            }
            this.dragCanvas.position(this.mouse.position.x - offset.x + clientLocation.x, this.mouse.position.y - offset.y + clientLocation.y);
        }
    }
    onMouseUp(e) {
        super.onMouseUp(e);
        if (this.drag) {
            if (this.mouse.over) {
                var index = this.getColorIndexAt(this.mouse.position.x, this.mouse.position.y);
                if (index != this.drag) {
                    Editor.self.addHistoryPalette();
                    this.palette.setColor(index, this.palette.getColor(this.drag));
                    this.selectedIndex = index;
                    this.invalidate();
                }
                this.selectedIndex = index;
            }
            if (this.dragCanvas) {
                this.dragCanvas.remove();
                this.dragCanvas = null;
            }
            this.drag = null;
        }
    }
    onMouseClick(e) {
        super.onMouseClick(e);
        this.selectedIndex = this.getColorIndexAt(this.mouse.position.x, this.mouse.position.y);
    }

    getColorIndexAt(x, y) {
        return Math.floor(x / this.pitchx) + Math.floor(y / this.pitchy) * this.columns;
    }

    performLayout(rect) {
        var parentClient = this.parent.getClientRect(this.parent.layoutRect);
        rect.height = this.stage.canvas.height - this.displayRect.y - 12;
        super.performLayout(rect);

        this.table = [];
        var r = this.clientRect, x = 0, y = 0;
        this.pitchx = r.width / this.columns; this.pitchy = r.height / this.rows;
        for (var color of this.palette.colors) {
            this.table.push({ color: ColorRGB.fromColor(color), rect: new Rect(r.x + x * this.pitchx, r.y + y * this.pitchy, this.pitchx, this.pitchy) });
            if ((++x) == this.columns) { x = 0; y++; }
        }
    }
}

//==============================================================================================================================================================================
class UISliderRGB extends UISlider {
    constructor(color, component) {
        super(color[component], 0, UISliderRGB.MAX[component], 1);
        //this.size = new Size(1, 0.8);
        //this.margin = 2;
        this.color = color;
        this.component = component;
        this.style = "cursor";
    }
    paintBackgroundSlider() {
        var r = this.clientRect, color = this.color.clone();
        var grd = UIStage.context.createLinearGradient(r.x, r.y, r.x + r.width, r.y);
        for (var s of UISliderRGB.STOPS[this.component]) { color[this.component] = UISliderRGB.MAX[this.component] * s; grd.addColorStop(s, color.html); }
        this._fillRect(grd, r.x, r.y, r.width, r.height);
    }
    get text() { return null; }
    onValueChanged() { if (this.color) { this.color[this.component] = this._value; super.onValueChanged(); } }
    onInvalidate() {
        this.isVisible() && this.color && (this.value = this.color[this.component]);
        super.onInvalidate();
    }
}

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------
UISliderRGB.STOPS = { red: [0, 1], green: [0, 1], blue: [0, 1], hue: [0, 1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6, 6 / 6], saturation: [0, 1], lightness: [0, 0.5, 1], opactity: [0, 1], value: [0, 1] };
UISliderRGB.MAX = { red: 255, green: 255, blue: 255, hue: 360, saturation: 100, lightness: 100, opactity: 100, value: 100 };
UISliderRGB.POST = { red: "", green: "", blue: "", hue: "°", saturation: "%", lightness: "%", opactity: "%", value: "%" };