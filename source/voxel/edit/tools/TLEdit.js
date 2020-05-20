//-------------------------------------------------------------------------------------------------------------------------------------------------------------------
class TLEdit extends TLTool {
    constructor() {
        super("Edit model");
        this.name = this.constructor.name;
        this.icon = UITools.ICON_LOOP;

        this.tool = new VXMove();
        this.main.addControl(new TLEditSize());
        this.main.addControl(this.tool.moveTool = new TLEditMove());
        this.main.addControl(new TLEditRotate());
        this.main.addControl(new TLEditFlip());


    }
}

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------
class VXMove extends VXTool {
    constructor() { super(); }
    isMouseOver() { return this.tools.getTool("VXToolFaceSelection").selectedObject != null; }
    onMouseDown(e) {
        super.onMouseDown(e);
        this.object = this.tools.getTool("VXToolFaceSelection").selectedObject;
        this.vectors = null;
        if (this.object) {
            Editor.self.map.edit.beginEdit();
            this.tools.makeExclusive(this);
            Editor.self.addHistoryMap();
            this.vectors = {
                x: Editor.self.map.edit.getNormalVector(this.object.position, Map3Node_NORMALS[VX_IPX]),
                y: Editor.self.map.edit.getNormalVector(this.object.position, Map3Node_NORMALS[VX_IPY]),
                z: Editor.self.map.edit.getNormalVector(this.object.position, Map3Node_NORMALS[VX_IPZ])
            };
        }
    }
    onMouseUp(e) {
        super.onMouseUp(e);
        if (this.vectors) {
            this.tools.clearExclusive(this);
            Editor.self.map.edit.endEdit();
            this.component = this.vector3 = this.object = null;
        }
    }
    onMouseMove(e) {
        super.onMouseMove(e);
        if (this.mouse.down && this.vectors) {
            if (!this.component) {
                var dists = [
                    Math.floor(Math.abs(this.distanceAlongVector(this.mouse.delta, this.vectors.x))),
                    Math.floor(Math.abs(this.distanceAlongVector(this.mouse.delta, this.vectors.y))),
                    Math.floor(Math.abs(this.distanceAlongVector(this.mouse.delta, this.vectors.z)))
                ];
                var long = Math.max.apply(null, dists);
                if (long) {
                    if (long == dists[0]) this.component = "x";
                    else if (long == dists[1]) this.component = "y";
                    else if (long == dists[2]) this.component = "z";

                    // trace("results:");
                    // trace("mouse.delta:", this.mouse.delta.toString());
                    // trace("raw dists:",
                    //     this.distanceAlongVector(this.mouse.delta, this.vectors.x),
                    //     this.distanceAlongVector(this.mouse.delta, this.vectors.y),
                    //     this.distanceAlongVector(this.mouse.delta, this.vectors.z)
                    // );
                    // trace("abs dists:", long, dists[0], dists[1], dists[2]);
                    // trace("normals:", this.vectors.x.toString(2), this.vectors.y.toString(2), this.vectors.z.toString(2));
                    // trace("this.component", this.component);
                    this.currentDist = 0;
                }
            }
            else {
                var dist = this.distanceAlongVector(this.mouse.delta, this.vectors[this.component]);
                var moved = Math.round(dist - this.currentDist);
                this.moveTool.move(this.component, moved);
                this.currentDist += moved;
            }
        }
    }
    distanceAlongVector(point, delta) {
        var vx = delta.x, vy = delta.y, wx = point.x, wy = point.y;
        return ((vx * wx + vy * wy) / (vx * vx + vy * vy));
    }
}

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------
class TLEditComponent extends UIContainer {
    constructor(title) {
        super();
        this.addControl(new UIFolder(title, this.container = new UIFlowContainer()));
        this.container.size = new Size(1, 1.2);
        this.container.buttonSize = new Size(0.25, 1);
    }
    addButton(button) {
        button.size = this.buttonSize;
        button.events.add("click", this.clickButton.bind(this));
        this.container.addControl(button);
    }
    clickButton(e) { }
    get model() { return Editor.self.model; }

    // applyPoints(points) {
    //     var model = this.model, blocks = model.blocks;
    //     var time = Date.now();
    //     Editor.self.addHistoryModel();
    //     trace("addState took", (Date.now() - time));
    //     model.edit.pastePoints(points);
    //     trace("applyPoints took", (Date.now() - time));
    // }
}

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------
class TLEditMove extends TLEditComponent {
    constructor() {
        super("Move model:");
        this.buttonSize = new Size(0.25, 1);
        this.addButton(new UIImageButton(UITools.ICON_MINUS).init({ buttonMode: null, bgcolor: uicss.bgcolor }));
        this.addButton(new UIImageButton(UITools.ICON_X).init({ name: "nx" }));
        this.addButton(new UIImageButton(UITools.ICON_Y).init({ name: "ny" }));
        this.addButton(new UIImageButton(UITools.ICON_Z).init({ name: "nz" }));
        this.addButton(new UIImageButton(UITools.ICON_PLUS).init({ buttonMode: null, bgcolor: uicss.bgcolor }));
        this.addButton(new UIImageButton(UITools.ICON_X).init({ name: "px" }));
        this.addButton(new UIImageButton(UITools.ICON_Y).init({ name: "py" }));
        this.addButton(new UIImageButton(UITools.ICON_Z).init({ name: "pz" }));
    }
    clickButton(e) {
        if (e.target.name) {
            Editor.self.addHistoryMap();
            this.move(e.target.name.charAt(1), e.target.name.charAt(0) == "n" ? -1 : 1);
        }
    }

    move(component, direction) {
        var time = Date.now();
        var shape = Map3Shape.fromMap(Editor.self.map);
        shape.move(component, direction);
        shape.drawToMap(Editor.self.map);
        // trace("TLEditMove::move took", Date.now() - time);
    }
}

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------
class TLEditRotate extends TLEditComponent {
    constructor() {
        super("Rotate model:");
        this.buttonSize = new Size(0.25, 1);
        this.addButton(new UIImageButton(UITools.ICON_MINUS).init({ buttonMode: null, bgcolor: uicss.bgcolor }));
        this.addButton(new UIImageButton(UITools.ICON_X).init({ name: "nx" }));
        this.addButton(new UIImageButton(UITools.ICON_Y).init({ name: "ny" }));
        this.addButton(new UIImageButton(UITools.ICON_Z).init({ name: "nz" }));
        this.addButton(new UIImageButton(UITools.ICON_PLUS).init({ buttonMode: null, bgcolor: uicss.bgcolor }));
        this.addButton(new UIImageButton(UITools.ICON_X).init({ name: "px" }));
        this.addButton(new UIImageButton(UITools.ICON_Y).init({ name: "py" }));
        this.addButton(new UIImageButton(UITools.ICON_Z).init({ name: "pz" }));
    }

    clickButton(e) { e.target.name && this.rotate(e.target.name.charAt(1), e.target.name.charAt(0) == "n" ? -1 : 1); }
    rotate(component, direction) {
        Editor.self.addHistoryMap();
        var shape = Map3Shape.fromMap(Editor.self.map);
        shape.rotate(component);
        Editor.self.map.resize(shape.size.x, shape.size.y, shape.size.z);
        shape.drawToMap(Editor.self.map);
    }
}

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------
class TLEditFlip extends TLEditComponent {
    constructor() {
        super("Flip model:");
        this.buttonSize = new Size(0.25, 1);
        this.addButton(new UIButton("").init({ buttonMode: null, bgcolor: uicss.bgcolor }));
        this.addButton(new UIImageButton(UITools.ICON_X).init({ name: "x" }));
        this.addButton(new UIImageButton(UITools.ICON_Y).init({ name: "y" }));
        this.addButton(new UIImageButton(UITools.ICON_Z).init({ name: "z" }));
    }
    clickButton(e) { e.target.name && this.flip(e.target.name.charAt(0)); }
    flip(component) {
        Editor.self.addHistoryMap();
        var shape = Map3Shape.fromMap(Editor.self.map);
        shape.flip(component);
        shape.drawToMap(Editor.self.map);
    }
}

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------
class TLEditSize extends TLEditComponent {
    constructor() {
        super("Resize:");
        var map = Editor.self.map;
        this.container.size = new Size(1, 1);
        this.buttonSize = new Size(0.25, 1);
        var css = { size: this.buttonSize, corners: 0, border: 0 }; //, bgcolor: uicss.bgcolor, fgcolor: uicss.fgcolor };
        this.container.addControl(new UILabel("Size").init({ size: this.buttonSize, corners: 0, border: 0 }));

        var _textchanged = function (e) {
            Editor.self.addHistoryMap();
            Editor.self.map.resize(Number(sx.text), Number(sy.text), Number(sz.text));
        }.bind(this);

        var addInput = function (input) { this.container.addControl(input); input.events.add("textchanged", _textchanged); }.bind(this);
        var _validation = function (text) { return isNaN(text) ? null : Math.min(99, Math.max(4, Number(text))).toString(); }

        var sx, sy, sz;
        addInput(sx = new UITextInput(map.size.x.toString()).init({ validation: _validation, name: "x", size: this.buttonSize, corners: 0, border: 0 }));
        addInput(sy = new UITextInput(map.size.y.toString()).init({ validation: _validation, name: "y", size: this.buttonSize, corners: 0, border: 0 }));
        addInput(sz = new UITextInput(map.size.z.toString()).init({ validation: _validation, name: "z", size: this.buttonSize, corners: 0, border: 0 }));

        var _resized = function (e) {
            sx.text = map.size.x.toString();
            sy.text = map.size.y.toString();
            sz.text = map.size.z.toString();
        }
        map.events.add("resize", _resized);
    }
}

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------
