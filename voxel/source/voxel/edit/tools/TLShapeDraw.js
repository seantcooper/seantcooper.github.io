class TLShapeDraw extends TLTool {
    constructor(title) {
        super(title);

        var _tlmode, _tlmirror;
        this.main.addControl(_tlmirror = new TLMirror());
        this.main.addControl(_tlmode = new TLMode());

        this.tool = new VXShapeDraw();
        this.tool.getMode = _tlmode.getMode.bind(_tlmode);
        this.tool.mirror = _tlmirror.mirror;
    }
    newShape() { return new Map3Shape(Editor.self.map.size.x, Editor.self.map.size.y, Editor.self.map.size.z); }
}
class TLEllipseDraw extends TLShapeDraw {
    constructor() {
        super("Draw ellipse");
        this.name = this.constructor.name;
        this.icon = UITools.ICON_DRAW_CIRCLE;
        this.tool.getShape = function (x1, y1, z1, x2, y2, z2, color) {
            var shape = this.newShape();
            shape.drawEllipse(x1, y1, z1, x2, y2, z2, color);
            return shape;
        }.bind(this);
    }
}
class TLBoxDraw extends TLShapeDraw {
    constructor() {
        super("Draw cube");
        this.name = this.constructor.name;
        this.icon = UITools.ICON_DRAW_RECT;
        this.tool.getShape = function (x1, y1, z1, x2, y2, z2, color) {
            var time = Date.now();
            var shape = this.newShape();
            shape.drawCube(x1, y1, z1, x2, y2, z2, color);
            trace(Date.now() - time);
            return shape;
        }.bind(this);
    }
}
class TLLineDraw extends TLShapeDraw {
    constructor() {
        super("Draw line");
        this.name = this.constructor.name;
        this.icon = UITools.ICON_DRAW_LINE;
        this.main.addControl(new UIFolder("Thickness", this.container = new UIContainer()));
        this.container.addControl(this.slider = new UISlider(1, 1, 8, 1), 0);

        this.tool.getShape = function (x1, y1, z1, x2, y2, z2, color) {
            var shape = this.newShape();
            shape.drawLine(x1, y1, z1, x2, y2, z2, color, Number(this.slider.value));
            return shape;
        }.bind(this);
    }
}
// THE TOOL
class VXShapeDraw extends VXTool {
    constructor() { super(); }
    isMouseOver() { return this.tools.getTool("VXToolFaceSelection").selectedObject != null; }
    onMouseDown(e) {
        super.onMouseDown(e);
        this.mode = this.getMode();
        this.start = this.index;
        if (this.start) {
            Editor.self.map.edit.beginEdit();
            Editor.self.map.mesh.createClickMesh();
        }
    }
    onMouseUp(e) {
        super.onMouseUp(e);
        Editor.self.map.mesh.releaseClickMesh();
        if (this.start) {
            this.end = this.index;
            this.end && this.drawShape(this.start, this.end);
            this.start = this.end = null;
            this.memory = null;
            Editor.self.map.edit.endEdit();
        }
    }
    onMouseMove(e) {
        super.onMouseMove(e);
        if (this.start) {
            this.end = this.index;
            this.end && this.drawShape(this.start, this.end);
        }
    }
    drawShape(s, e) {
        var shape = this.getShape(s.x, s.y, s.z, e.x, e.y, e.z, this.color);
        shape.mirror(this.mirror);
        this.memory = shape.updateMap(Editor.self.map, this.getMode(), this.memory);
    }

    get index() {
        var object = this.tools.getTool("VXToolFaceSelection").selectedObject;
        if (object) {
            var index = object.index.clone();
            if (this.mode.attach) {
                index.x += object.normal.x;
                index.y += object.normal.y;
                index.z += object.normal.z;
            }
            return index;
        }
        return null;
    }
}
