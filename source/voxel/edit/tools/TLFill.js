class TLFill extends TLTool {
    constructor() {
        super("Flood fill");
        this.name = this.constructor.name;
        this.icon = UITools.ICON_FILL;
        var dimension = new TLDimension();
        this.main.addControl(dimension);
        this.tool = new VXToolFill();
        this.tool.getDimension = function () { return dimension.value; };
    }
}

// THE TOOL
class VXToolFill extends VXTool {
    constructor() { super(); }
    onMouseDown(e) {
        super.onMouseDown(e);
        (this.start = this.tools.getTool("VXToolFaceSelection").selectedObject);
    }
    onMouseUp(e) {
        super.onMouseUp(e);
        if ((this.object = this.tools.getTool("VXToolFaceSelection").selectedObject) && this.start) {
            Editor.self.map.edit.beginEdit();
            var index = this.object.index, normal = this.object.normal, shape;

            switch (this.getDimension().toLowerCase()) {
                case "2d": (shape = Map3Shape.fromMap(Editor.self.map)).fill2d(index.x, index.y, index.z, this.color, normal); break;
                case "3d": (shape = Map3Shape.fromMap(Editor.self.map)).fill3d(index.x, index.y, index.z, this.color); break;
            }
            shape.pasteToMap(Editor.self.map, { draw: true });
            Editor.self.map.edit.endEdit();
        }
        this.start = null;
    }
    isMouseOver() { return this.tools.getTool("VXToolFaceSelection").selectedObject != null; }
}

class TLDimension extends UIFlowContainer {
    constructor() {
        super();

        this.buttons = [];
        this.buttons.push(new UIListButton("3D", this.buttons).init({ tooltip: "3d fill" }), new UIListButton("2D", this.buttons).init({ tooltip: "2d plane fill" }));
        var selected = (function (e) {
            this.value = e.target.text;
            this.events.raise("valuechanged");
        }).bind(this);

        for (var button of this.buttons) {
            button.size = new Size(1 / this.buttons.length, 1);
            button.events.add("selected", selected);
            this.addControl(button);
        }
    }
    onInitialize() {
        super.onInitialize();
        this.buttons[0].select();
    }
}
