// THE TOOL
class VXToolSelect extends VXToolModel {
    constructor() {
        super();
        this.state = "select"
    }

    onMouseOut(e) { super.onMouseOut(e); this["onMouseOut" + "_" + this.state](e); }
    onMouseOut_select(e) { }
    onMouseOut_paint(e) {

    }

    onMouseDown(e) {
        super.onMouseDown(e);
        this.state = e.keys & Mouse.ALT ? "paint" : "select";
        this.object = this.selectedObject;
        this["onMouseDown" + "_" + this.state](e);
    }

    onMouseDown_select(e) { }
    onMouseDown_paint(e) {
        if (this.object) {
            this.clear();
            this.createClickMesh();
            this.brush = Editor.self.map.edit.copySelection();
            if (this.brush) {
                var min = this.brush.cropExtents.min;
                this.brushPosition = new Vertex(this.object.index.x - min.x, this.object.index.y - min.y, this.object.index.z - min.z);
                Editor.self.addHistoryMap();
            }
        }
    }

    onSelectedObjectChanged() {
        super.onSelectedObjectChanged();
        this["onSelectedObjectChanged" + "_" + this.state]();
    }
    onSelectedObjectChanged_select() { }
    onSelectedObjectChanged_paint() {
        if (this.object && this.selectedObject && this.brush) {
            var map = Editor.self.map;
            var index = this.selectedObject.index;
            var shape = new Map3Shape(map.size.x, map.size.y, map.size.z);
            var x = index.x - this.brushPosition.x, y = index.y - this.brushPosition.y, z = index.z - this.brushPosition.z;
            shape.drawShape(this.brush, x, y, z);
            this.pasteMemory = shape.updateMap(Editor.self.map, { draw: true, attach: true }, this.pasteMemory);
        }
    }

    clear() { }

    onMouseUp(e) {
        super.onMouseUp(e);
        this["onMouseUp" + "_" + this.state](e);
        this.state = "select";
    }
    onMouseUp_select(e) { }
    onMouseUp_paint(e) {
        this.releaseClickMesh();
        this.pasteMemory = null;
    }
}



//==============================================================================================================================================================================
class TLWandSelect extends TLTool {
    constructor() {
        super("Magic wand");
        this.name = this.constructor.name;
        this.icon = UITools.ICON_WAND;
        this.tool = new VXWand();

        this.main.addControl(this.tlposition = new TLBrushPosition());
        this.tool.brushPosition = this.tlposition.position;

        this.main.addControl(this.tlbrush = new TLBrush(true));
        this.tool.getBrush = this.tlbrush.getBrush.bind(this.tlbrush);

        this.main.addControl(new TLSelectEdit());
    }
}

// THE TOOL
class VXWand extends VXToolSelect {
    constructor() {
        super();
        this.state = "select"
    }
    onDeactivate() { this.clearBrush(true); }

    onMouseOut_select(e) {
        super.onMouseOut_select(e);
        !this.down && this.clearBrush(true);
    }
    onMouseDown_select(e) {
        super.onMouseDown_select(e);
        if (this.object) {
            this.down = true;

            this.clearBrush(true);
            !(e.keys & Mouse.SHIFT) && Editor.self.map.edit.clearSelection();
            this.pasteBrush(this.selectedObject);
        }
    }
    onSelectedObjectChanged_select() {
        super.onSelectedObjectChanged_select();
        this.down ? this.pasteBrush(this.selectedObject) : this.updateBrush(this.selectedObject);
    }
    onMouseUp_select(e) {
        super.onMouseUp_select(e);
        if (this.down) {
            this.down = this.object = null;
            if (this.mouse.clickCount == 1) {
                this.pasteBrush(this.selectedObject);
            } else if (this.mouse.clickCount > 1 && this.selectedObject) {
                var index = this.selectedObject.index;
                var shape = Map3Shape.fromMap(Editor.self.map);
                if (this.mouse.clickCount == 2) {
                    shape.fill2d(index.x, index.y, index.z, 500, this.selectedObject.normal);
                } else if (this.mouse.clickCount > 2) {
                    shape.fill3d(index.x, index.y, index.z, 500);
                }
                shape.selectToMap(Editor.self.map);
            }
            this.memory = null;
        }
    }
    clear() { this.clearBrush(true); }
    clearBrush(destroy) {
        this.memory && this.getBrushAt(null).updateSelection(Editor.self.map, this.memory);
        destroy && (this.memory = null);
    }
    updateBrush(object) { this.memory = this.getBrushAt(object).updateSelection(Editor.self.map, this.memory); }
    pasteBrush(object) { this.getBrushAt(object).selectToMap(Editor.self.map); }
    getBrushAt(object) {
        var s = Editor.self.map.size;
        var brush = new Map3Shape(s.x, s.y, s.z);
        if (object) {
            var index = object.index.toVector3();
            brush = this.getBrush(Editor.self.map, this.brushPosition, index.x, index.y, index.z, 1);
        }
        return brush;
    }
}

//==============================================================================================================================================================================
class TLBoxSelect extends TLTool {
    constructor() {
        super("Box selection");
        this.name = this.constructor.name;
        this.icon = UITools.ICON_SELECT_RECT;
        this.main.addControl(new TLSelectEdit());
        this.tool = new VXBoxSelect();;
    }
}

// THE TOOL
class VXBoxSelect extends VXToolSelect {
    constructor() { super(); }
    onMouseDown_select(e) {
        super.onMouseDown_select(e);
        if (this.object) {
            this.start = this.object.index;
            this.normal = this.object.normal;
            !(e.keys & Mouse.SHIFT) && Editor.self.map.edit.clearSelection();
        }
    }
    onMouseUp_select(e) {
        super.onMouseUp_select(e);
        if (this.end) {
            this.events.raise("complete", { selection: { start: this.start, end: this.end, normal: this.normal } });
            this.end = null;
            this.memory = null;
        }
    }
    onSelectedObjectChanged_select() {
        super.onSelectedObjectChanged_select();
        if (this.mouse.down) {
            this.object = this.tools.getTool("VXToolFaceSelection").selectedObject;
            if (this.object && this.start) {
                this.end = this.object.index;
                var shape = new Map3Shape(Editor.self.map.size.x, Editor.self.map.size.y, Editor.self.map.size.z);
                shape.drawCube(this.start.x, this.start.y, this.start.z, this.end.x, this.end.y, this.end.z, 1);
                this.memory = shape.updateSelection(Editor.self.map, this.memory);
            }
        }
    }
}

// class VXBoxSelect extends VXToolModel {
//     constructor() { super(); }
//     isMouseOver() { return this.tools.getTool("VXToolFaceSelection").selectedObject != null; }
//     onMouseDown(e) {
//         super.onMouseDown(e);
//         if ((this.object = this.tools.getTool("VXToolFaceSelection").selectedObject)) {
//             this.start = this.object.index;
//             this.normal = this.object.normal;
//             var time = Date.now();
//             !(e.keys & Mouse.SHIFT) && Editor.self.map.edit.clearSelection();
//             trace(Date.now() - time);
//         }
//     }
//     onMouseUp(e) {
//         super.onMouseUp(e);
//         if (this.end) {
//             this.events.raise("complete", { selection: { start: this.start, end: this.end, normal: this.normal } });
//             this.end = null;
//             this.memory = null;
//         }
//     }
//     onSelectedObjectChanged() {
//         super.onSelectedObjectChanged();
//         if (this.mouse.down) {
//             this.object = this.tools.getTool("VXToolFaceSelection").selectedObject;
//             if (this.object && this.start) {
//                 this.end = this.object.index;
//                 var shape = new Map3Shape(Editor.self.map.size.x, Editor.self.map.size.y, Editor.self.map.size.z);
//                 shape.drawCube(this.start.x, this.start.y, this.start.z, this.end.x, this.end.y, this.end.z, 1);
//                 this.memory = shape.updateSelection(Editor.self.map, this.memory);
//             }
//         }
//     }
// }

//==============================================================================================================================================================================
class TLSelectEdit extends UIFolder {
    constructor() {
        super("Selection edit", new UIFlowContainer());
        this.container.size = new Size(1, 1.2);

        var addButton = function (button) {
            button.size = new Size(0.25, 1);
            this.container.addControl(button);
        }.bind(this);

        var button;
        addButton(button = new UIImageButton(UITools.ICON_CLEAR_SELECTION));
        button.events.add("click", this.clearSelection.bind(this));
        button.tooltip = "Clear selection";

        addButton(button = new UIImageButton(UITools.ICON_CUT_SELECTION));
        button.events.add("click", this.cutSelection.bind(this));
        button.tooltip = "Cut selection";

        addButton(button = new UIImageButton(UITools.ICON_COPY_SELECTION));
        button.events.add("click", this.copySelection.bind(this));
        button.tooltip = "Copy selection";

        addButton(button = new UIImageButton(UITools.ICON_DELETE_SELECTION));
        button.events.add("click", this.deleteSelection.bind(this));
        button.tooltip = "Delete selection";
    }

    cutSelection() { this.copySelection(); this.deleteSelection(); }
    copySelection() {
        var shape = Editor.self.map.edit.copySelection();
        shape && Editor.self.clipboard.add(shape);
    }
    deleteSelection() { Editor.self.addHistoryMap(); Editor.self.map.edit.deleteSelection(); }
    clearSelection() { Editor.self.map.edit.clearSelection(); }
}


//==============================================================================================================================================================================
