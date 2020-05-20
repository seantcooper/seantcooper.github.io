class UITextInput extends UIControl {
    constructor(_text) {
        super();
        this.border = 0;
        this.text = _text;
        this.fgcolor = Color.black;
        this.bgcolor = Color.white;
        window.addEventListener('resize', this.stopInput.bind(this), false);
    }

    onMouseClick(e) {
        super.onMouseClick();
        this.startInput();
    }

    startInput() {
        if (this.input) return;
        this.input = document.createElement('input');
        this.input.type = 'text';
        var s = this.input.style;
        s.position = "fixed";
        var r = this.clientRect.clone();
        r.offset(this.stage.screenX, this.stage.screenY);
        s.left = r.x + "px";
        s.top = r.y + "px";
        s.width = (r.width - this.border * 2 - 2) + "px";
        s.height = (r.height - this.border * 2 - 2) + "px";
        s.background = this.bgcolor.html;
        s.color = this.fgcolor.html;
        s.border = this.border + "px solid " + this.fgcolor.html;
        s.font = this._font;
        s.textAlign = "center";
        this.input.value = this.text;
        document.body.appendChild(this.input);
        this.input.addEventListener("focusout", this.stopInput.bind(this));
        this.input.addEventListener("keypress", this._keypress.bind(this));
        this.input.focus();
    }

    _keypress(_evt) {
        if (_evt.keyCode == 13) {
            _evt.preventDefault();
            this.stopInput();
        }
    }

    stopInput() {
        if (!this.input || this.lockstopInput) return;
        this.lockstopInput = true;

        var text = this.validation ? this.validation(this.input.value) : this.input.value;
        if (text && this.text != text) {
            this.text = text;
            this.events.raise("textchanged", { text: this.text });
        }
        this.input.remove();
        this.input = null;
        this.lockstopInput = false;
        this.invalidate();
    }
}