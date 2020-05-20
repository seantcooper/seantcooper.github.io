class VXTool {
    constructor() {
        this.name = this.constructor.name;
        this.enabled = true;
        this.mouse = { position: new Point(), down: false, over: false };
        this.events = new EventDispatcher(this);
        this.mouseButton = Mouse.LEFT;
    }

    onMouse(e) {
        if (!this.enabled) return;
        var _mouseover = (function () {
            var _over;
            this.mouse.position = new Point(e.position.x, e.position.y);
            this.mouse.delta = this.mouse.down ? new Point(e.position.x - this.mouse.down.x, e.position.y - this.mouse.down.y) : null;
            var _over = e.over && this.isMouseOver(e);
            (_over != this.mouse.over) && ((this.mouse.over = _over) ? this.onMouseOver(e) : this.onMouseOut(e));
        }).bind(this);

        switch (e.type) {
            case "mousemove": _mouseover(); (this.mouse.over || this.mouse.down) && this.onMouseMove(e); break;
            //     case "mouseout": _mouseover(); break;
            case "mouseup":
                _mouseover();
                if (this.mouse.down && e.button == this.mouseButton) {
                    this.successiveClicks();
                    this.onMouseUp(e);
                }
                break;
            case "mousedown":
                _mouseover();
                if (this.mouse.over && e.button == this.mouseButton) {
                    this.onMouseDown(e);
                }
                break;
            case "click": _mouseover(); this.mouse.over && e.button == this.mouseButton && this.onMouseClick(e); break;
            case "wheel": this.mouse.over && this.onMouseWheel(e); break;
            case "dblclick": _mouseover(); this.mouse.over && e.button == this.mouseButton && this.onMouseDoubleClick(e); break;
        }
    }

    successiveClicks() {
        this.mouse.clickCount && Date.now() - this.mouse.upTime < 500 ? this.mouse.clickCount++ : this.mouse.clickCount = 1;
        this.mouse.upTime = Date.now();
    }


    isMouseOver(e) { return false; }
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

    get renderer() { return Editor.self.renderer; }
    get picker() { return Editor.self.colorPicker; }
    get color() { return Editor.self.colorPicker.index; }
    get model() { return Editor.self.model; }
    //get mouseVector() { return new Vector3(this.mouse.down.x, _mouse.down.y)}
}

VXTool.KEY_ALT = 1 << 0;
VXTool.KEY_SHIFT = 1 << 1;
VXTool.KEY_CTRL = 1 << 2;
VXTool.KEY_META = 1 << 3;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class VXTools {
    constructor(canvas) {
        this.tools = new Dictionary();
        new Mouse(canvas, this.onMouse.bind(this));
    }
    getTool(name) { return this.tools[name]; }
    addTool(tool) {
        tool.tools = this;
        this.tools.add(tool.name, tool);
        tool.onActivate();
    }
    removeTool(tool) {
        this.tools.remove(tool.name);
        tool.onDeactivate();
    }
    onMouse(e) {
        e.type == "mousemove" && (this.mousePosition = new Point(e.position.x, e.position.y));
        for (var tool of this.tools.values) {
            tool.onMouse(e);
            if (e.cancel) break;
        }
    }
    makeExclusive(_exclusiveTool) {
        this.exclusiveTool = _exclusiveTool;
        for (var tool of this.tools.values)
            tool.enabled = tool == this.exclusiveTool;
    }
    clearExclusive() {
        for (var tool of this.tools.values)
            tool.enabled = true;
        this.exclusiveTool = null;
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class VXToolFaceSelection extends VXTool {
    constructor() { super(); }
    onMouseMove(e) {
        super.onMouseMove(e);
        this.selectedObject = this.mouseObject;
        Editor.self.footer.setLocation(this.selectedObject ? this.selectedObject.index : null);
    }
    onMouseOut(e) {
        super.onMouseOut(e);
        this.selectedObject = null;
        Editor.self.scratch.cursor = "normal";
    }
    isMouseOver(e) { return this.mouseObject != null; }
    get mouseObject() { return Editor.self.map.mesh.getFaceAt(this.mouse.position); }
    set selectedObject(a) {
        if ((!a || !this._selectedObject) || !(a.index.equals(this._selectedObject.index) && a.id == this._selectedObject.id)) {
            this._selectedObject = a;
            Editor.self.selectedFace = a;
        }
    }
    get selectedObject() { return this._selectedObject; }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class VXToolModel extends VXTool {
    constructor() { super(); }
    get selectedObject() { return this.tools.getTool("VXToolFaceSelection").selectedObject; }
    isMouseOver(e) { return this.selectedObject != null; }
    onMouseMove(e) {
        super.onMouseMove(e);
        if (this.selectedObject != this.lastSelectedObject) {
            this.onSelectedObjectChanged();
            this.lastSelectedObject = this.selectedObject;
        }
    }
    onSelectedObjectChanged() { }
    createClickMesh() { Editor.self.map.mesh.createClickMesh(); }
    releaseClickMesh() { Editor.self.map.mesh.releaseClickMesh(); }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class VXToolCameraZoom extends VXTool {
    constructor(_camera) { super(); this.camera = _camera; }
    onMouseWheel(e) { super.onMouseWheel(e); this.camera.translateZ(-e.position.y / 30); }
    isMouseOver() { return true; }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class VXToolCameraControl extends VXTool {
    constructor(_camera) {
        super();
        this.camera = _camera;
        this.mouseButton = Mouse.RIGHT;
    }
    isMouseOver() { return true; } //return this.tools.getTool("VXToolFaceSelection").selectedObject == null; }
    onMouseDown(e) {
        super.onMouseDown(e);
        this.move = (e.keys & Mouse.ALT) > 0;
        this.camera.backup();
        this.tools.makeExclusive(this);
    }
    onMouseUp(e) {
        super.onMouseUp(e);
        this.tools.clearExclusive(this);
    }
    onMouseMove(e) {
        super.onMouseMove(e);
        if (this.mouse.down) {
            this.camera.restore();
            if (this.move) {
                this.camera.translateX(this.mouse.delta.x / 10);
                this.camera.translateY(-this.mouse.delta.y / 10);
            } else {
                this.camera.rotateZ(this.mouse.delta.x / 200);
                this.camera.rotateX(this.mouse.delta.y / 200);
            }
        }
    }
}