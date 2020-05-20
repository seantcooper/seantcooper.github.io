class Mouse {
    constructor(_element, _callback) {
        this.x = this.y = 0;
        this.down = 0;
        this.over = false;
        this.element = _element;
        this.callback = _callback;

        document.addEventListener("mouseup", this.onMouseUp.bind(this));
        document.addEventListener("mousemove", this.onMouseMove2.bind(this));
        document.addEventListener("contextmenu", this.onContextMenu.bind(this));
        _element.addEventListener("mouseover", this.onMouseOver.bind(this));
        _element.addEventListener("mouseout", this.onMouseOut.bind(this));
        _element.addEventListener("mousemove", this.onMouseMove.bind(this));
        _element.addEventListener("mousedown", this.onMouseDown.bind(this));
        _element.addEventListener("mouseup", this.onMouseUp.bind(this));
        _element.addEventListener("wheel", this.onMouseWheel.bind(this));
        _element.addEventListener("click", this.onMouseClick.bind(this));
        _element.addEventListener("dblclick", this.onMouseDoubleClick.bind(this));

    }

    getPosition(e) { return new Point(e.clientX - this.element.offsetLeft, e.clientY - this.element.offsetTop); }
    getKeys(e) { return (e.altKey ? Mouse.ALT : 0) | (e.ctrlKey ? Mouse.CTRL : 0) | (e.shiftKey ? Mouse.SHIFT : 0) | (e.metaKey ? Mouse.META : 0); }
    onContextMenu(e) { e.preventDefault(); }
    onMouseDown(e) { (this.down = this.validButton(e.button)) && this.callback(new MouseEvt(e.type, this.getPosition(e), this.over, this.down, this.getKeys(e))); }
    onMouseUp(e) { if (this.validButton(e.button)) { this.callback(new MouseEvt(e.type, this.getPosition(e), this.over, this.validButton(e.button), this.getKeys(e))); this.down = 0; } }
    onMouseClick(e) { this.validButton(e.button) && this.callback(new MouseEvt(e.type, this.getPosition(e), this.over, this.validButton(e.button), this.getKeys(e))); }
    onMouseDoubleClick(e) { this.validButton(e.button) && this.callback(new MouseEvt(e.type, this.getPosition(e), this.over, this.validButton(e.button), this.getKeys(e))); }
    onMouseOut(e) { this.over = false; }
    onMouseOver(e) { this.over = true; }
    onMouseMove(e) { this.callback(new MouseEvt(e.type, this.getPosition(e), this.over, this.down, this.getKeys(e))); }
    onMouseMove2(e) { this.callback(new MouseEvt(e.type, this.getPosition(e), this.over, this.down, this.getKeys(e))); }
    onMouseWheel(e) { this.callback(new MouseEvt(e.type, new Point(e.deltaX, e.deltaY)), this.over, this.down, this.getKeys(e)); }
    validButton(button) { return (button == 0) ? Mouse.LEFT : (button == 2 ? Mouse.RIGHT : 0); }
}

class Keyboard {
    constructor(_element, _callback) {
        document.addEventListener('keypress', this.onKeyPress.bind(this));
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
        this.keys = {};
    }
    onKeyPress(e) { }
    onKeyUp(e) {
        trace("Keyboard::onKeyUp", e.key);
        this.keys[e.key] = false;
    }
    onKeyDown(e) { trace("Keyboard::onKeyDown", e.key); this.keys[e.key] = true; }
}

class MouseEvt {
    constructor(type, position, over, button, keys) {
        this.type = type;
        this.position = position;
        this.button = button;
        this.keys = keys;
        this.over = over;
    }
}

class MouseStub {
    constructor(canvas) {
        new Mouse(canvas, this.onMouse.bind(this));
        this.name = this.constructor.name;
        this.enabled = true;
        this.mouse = { position: new Point(), down: false, over: false };
        this.events = new EventDispatcher(this);
        this.mouseButton = Mouse.LEFT;
    }

    onMouse(e) {
        if (!this.enabled) return;
        var _mouseover = (function () {
            this.mouse.position = new Point(e.position.x, e.position.y);
            this.mouse.delta = this.mouse.down ? new Point(e.position.x - this.mouse.down.x, e.position.y - this.mouse.down.y) : null;
            var _over = e.over && this.isMouseOver(e);
            (_over != this.mouse.over) && ((this.mouse.over = _over) ? this.onMouseOver(e) : this.onMouseOut(e));
        }).bind(this);
        switch (e.type) {
            case "mousemove": _mouseover(); (this.mouse.over || this.mouse.down) && this.onMouseMove(e); break;
            case "mouseup": _mouseover(); if (this.mouse.down && e.button == this.mouseButton) { this.successiveClicks(); this.onMouseUp(e); } break;
            case "mousedown": _mouseover(); this.mouse.over && e.button == this.mouseButton && this.onMouseDown(e); break;
            case "click": _mouseover(); this.mouse.over && e.button == this.mouseButton && this.onMouseClick(e); break;
            case "wheel": this.mouse.over && this.onMouseWheel(e); break;
            case "dblclick": _mouseover(); this.mouse.over && e.button == this.mouseButton && this.onMouseDoubleClick(e); break;
        }
    }

    successiveClicks() {
        this.mouse.clickCount && Date.now() - this.mouse.upTime < 500 ? this.mouse.clickCount++ : this.mouse.clickCount = 1;
        this.mouse.upTime = Date.now();
    }
    isMouseOver(e) { return true; }
    onMouseMove(e) { }
    onMouseDown(e) { this.mouse.down = this.mouse.position.clone(); }
    onMouseUp(e) { this.mouse.down = null; }
    onMouseClick(e) { }
    onMouseDoubleClick(e) { }
    onMouseOver(e) { }
    onMouseOut(e) { }
    onMouseWheel(e) { }
    onActivate() { }
    onDeactivate() { }
}

Mouse.ALT = 1 << 0;
Mouse.SHIFT = 1 << 1;
Mouse.CTRL = 1 << 2;
Mouse.META = 1 << 3;
Mouse.LEFT = 1;
Mouse.RIGHT = 2;
