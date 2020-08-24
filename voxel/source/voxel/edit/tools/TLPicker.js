class TLPicker extends TLTool {
    constructor() {
        super("Color picker");
        this.name = this.constructor.name;
        this.tooltip = "Pick color";
        this.icon = UITools.ICON_PICK;
        this.tool = new VXToolPicker();
    }
}

// THE TOOL
class VXToolPicker extends VXTool {
    constructor() { super(); }
    onMouseClick(e) {
        super.onMouseClick(e);
        if ((this.object = this.tools.getTool("VXToolFaceSelection").selectedObject)) {
            var index = this.object.index;
            if (!this.object.grid)
                this.picker.index = Editor.self.map.getAt(index.x, index.y, index.z);
        }
    }
    isMouseOver() { return this.tools.getTool("VXToolFaceSelection").selectedObject != null; }
}