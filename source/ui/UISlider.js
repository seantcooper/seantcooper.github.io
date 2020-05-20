//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class UISlider extends UIControl {
    constructor(_value, _min, _max, _step, _pretext, _postText) {
        super();
        //this.buttonMode = new ButtonMode();
        this.bgcolor = uicss.bgcolorDark;
        this.pretext = _pretext ? _pretext : "";
        this.postText = _postText ? _postText : "";
        this.min = _min; this.max = _max; this.step = _step;
        this.sliderColor = uicss.sliderColor;
        this.font = uicss.fontSmall;
        this._value = this._parseValue((_value - _min) / this.range);
        this.style = "bar";
        //this.selectedColor = this.sliderColor;
    }

    paintBackground() {
        super.paintBackground();
        this.paintBackgroundSlider();
        this.paintSlider();
    }

    paintBackgroundSlider() { }
    paintSlider() {
        var r = this.clientRect;
        var f = (this.value - this.min) / this.range;
        switch (this.style) {
            case "bar": this._fillRect(this.getBGColor(this.sliderColor).html, r.x, r.y, r.width * f, r.height); break;
            case "cursor":
                var x = r.x + r.width * f, s = 2, ctx = UIStage.context;
                ctx.lineWidth = 2;
                ctx.strokeStyle = this.fgcolor.html;
                ctx.beginPath();
                ctx.moveTo(x, r.top); ctx.lineTo(x, r.bottom);
                ctx.moveTo(x - s, r.top); ctx.lineTo(x + s, r.top);
                ctx.moveTo(x - s, r.bottom); ctx.lineTo(x + s, r.bottom);
                ctx.stroke();
                break;
        }
    }
    get text() { return this.pretext + this._value + this.postText; }

    onMouseMove(e) { super.onMouseMove(e); this._updatePosition(); }
    onMouseDown(e) { super.onMouseDown(e); this._updatePosition(); }
    onMouseUp(e) { super.onMouseUp(e); this._updatePosition(); }
    _updatePosition() { this.mouse.down && (this.value = this._parseValue(this.mouse.position.x / this.clientRect.width)); }
    _parseValue(f) { return Number((Math.min(this.range, Math.max(0, Math.round((f * this.range) / this.step) * this.step)) + this.min).toFixed(getDecimalPlaces(this.step))); }

    get value() { return this._value; }
    set value(a) {
        if (a != this.value) {
            this._value = a;
            this.onValueChanged();
            this.invalidate();
        }
    }
    get range() { return this.max - this.min; }
    onValueChanged() { this.events.raise("valuechanged"); }
}

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------
