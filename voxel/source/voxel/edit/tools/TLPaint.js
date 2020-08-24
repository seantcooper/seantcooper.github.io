//==============================================================================================================================================================================
class TLDraw extends TLTool {
    constructor() {
        super("Draw blocks");
        var _tlmode, _tlbrush, _tlmirror, _tlposition;
        this.main.addControl(_tlmirror = new TLMirror());
        this.main.addControl(_tlmode = new TLMode());
        this.main.addControl(_tlposition = new TLBrushPosition());
        this.main.addControl(_tlbrush = new TLBrush());
        this.tool = new VXToolPaint();
        this.tool.getMode = _tlmode.getMode.bind(_tlmode);
        this.tool.getBrush = _tlbrush.getBrush.bind(_tlbrush);
        this.tool.brushPosition = _tlposition.position;
        this.tool.mirror = _tlmirror.mirror;
        this.name = this.constructor.name;
        this.icon = UITools.ICON_BRUSH;
    }
}

//------------------------------------------------------------------------------------------------------------------------------------------------------------
// THE TOOL
class VXToolPaint extends VXToolModel {
    constructor() {
        super();
        this.mirror = { x: false, y: false, z: false };
    }
    onDeactivate() {
        this.clearBrush(true); this.releaseClickMesh();
    }
    onActivate() { }
    onMouseOut(e) {
        if (!this.down) {
            this.clearBrush(true);
            this.releaseClickMesh();
        }
    }
    onMouseOver(e) { !this.down && this.createClickMesh(); }
    onMouseDown(e) {
        super.onMouseDown(e);
        this.downObject = this.selectedObject;
        if (this.downObject) {
            this.down = true;
            this.clearBrush(true);
            Editor.self.map.edit.beginEdit();
            this.pasteBrush();
        }
    }
    onSelectedObjectChanged() {
        super.onSelectedObjectChanged();
        this.down ? this.pasteBrush() : this.updateBrush();
    }
    onMouseUp(e) {
        super.onMouseUp(e);
        if (this.down) {
            this.down = this.downObject = null;
            this.pasteBrush();
            this.memory = null;
            this.releaseClickMesh();
            this.createClickMesh();
            Editor.self.map.edit.endEdit();
        }
    }
    clearBrush(destroy) {
        this.memory && this.getBrushAt(null).updateMap(Editor.self.map, this.getMode(), this.memory);
        destroy && (this.memory = null);
    }
    updateBrush() {
        if (Editor.self.map.mesh.hasClickMesh()) {
            this.memory = this.getBrushAt(this.selectedObject).updateMap(Editor.self.map, this.getMode(), this.memory);
        }
    }
    pasteBrush() {
        this.getBrushAt(this.selectedObject).pasteToMap(Editor.self.map, this.getMode());
    }
    getBrushAt(object) {
        var s = Editor.self.map.size;
        var brush = new Map3Shape(s.x, s.y, s.z);
        if (object) {
            var index = object.index.toVector3();
            this.getMode && this.getMode().attach && index.add(object.normal);
            brush = this.getBrush(Editor.self.map, this.brushPosition, index.x, index.y, index.z, this.color);
            brush.mirror(this.mirror);
        }
        return brush;
    }
}

//------------------------------------------------------------------------------------------------------------------------------------------------------------
class TLBrush extends UIContainer {
    constructor(hideCustom) {
        super();

        this.addControl(new UIFolder("Brush", this.container = new UIContainer()));
        this.container.addControl((this.tabs = new UITabs()).init({ tabHeight: 1.20, tabSquare: true }));

        var _invalidateBrush = (function (e) {
            var tab = this.tabs.selectedTab;
            tab.user.slider && (tab.user.size = tab.user.slider.value);
        }).bind(this);
        this.tabs.events.add("selected", _invalidateBrush);

        // pixel
        var tab = this.tabs.addImageTab("pixel", UITools.ICON_PIXEL);
        tab.button.tooltip = "Draw voxel";

        var brushMaxSize = 24;

        // cube
        tab = this.tabs.addImageTab("cube", UITools.ICON_CUBE1, new UIFlowContainer());
        tab.button.tooltip = "Draw cube";
        tab.panel.addControl(tab.user.slider = new UISlider(4, 2, brushMaxSize, 1, "Size:"));
        tab.user.slider.events.add("valuechanged", _invalidateBrush);

        // sphere
        tab = this.tabs.addImageTab("sphere", UITools.ICON_SPHERE, new UIFlowContainer());
        tab.panel.addControl(tab.user.slider = new UISlider(4, 2, brushMaxSize / 2, 1, "Radius:"));
        tab.button.tooltip = "Draw sphere";
        tab.user.slider.events.add("valuechanged", _invalidateBrush);

        // clipboard
        if (!hideCustom) {
            tab = this.tabs.addImageTab("brush", UITools.ICON_SELECT_PAINT, this.custom = new UICustomBrushes());
            tab.button.tooltip = "Draw clipboard";
        }

        this.tabs.selectTab("pixel");
    }

    getBrush(map, position, x, y, z, color) {
        var time = Date.now();
        var tab = this.tabs.selectedTab, size = tab.user.size, shape;
        var shape = new Map3Shape(map.size.x, map.size.y, map.size.z);
        switch (tab.name) {
            case "pixel": shape.drawCube(x, y, z, x, y, z, color); break;
            case "cube":
                size--;
                x -= Math.floor((position.x + 1) * size / 2);
                y -= Math.floor((position.y + 1) * size / 2);
                z -= Math.floor((position.z + 1) * size / 2);
                shape.drawCube(x, y, z, x + size, y + size, z + size, color);
                break;
            case "sphere":
                x -= Math.floor((position.x + 1) * size);
                y -= Math.floor((position.y + 1) * size);
                z -= Math.floor((position.z + 1) * size);
                var r2 = size * 2 - 1;
                shape.drawEllipse(x, y, z, x + r2, y + r2, z + r2, color);
                break;
            case "brush":
                if (this.custom.selectedShape) {
                    var size = this.custom.selectedShape.size;
                    x -= Math.floor((position.x + 1) * size.x / 2);
                    y -= Math.floor((position.y + 1) * size.y / 2);
                    z -= Math.floor((position.z + 1) * size.z / 2);
                    shape.drawShape(this.custom.selectedShape, x, y, z);
                }
                break;
        }
        //trace("getBrush took", Date.now() - time);
        return shape;
    }
}

//------------------------------------------------------------------------------------------------------------------------------------------------------------
class TLBrushPosition extends UIFolder {
    constructor() {
        super("Position", new UIFlowContainer());
        this.container.size = new Size(1, 1.2);
        this.position = { x: 0, y: 0, z: 0 };
        this.collapse();

        var addButton = function (button) {
            button.size = new Size(0.25, 1);
            button.events.add("click", this.clickButton.bind(this));
            this.container.addControl(button);
        }.bind(this);

        var nonButton = { buttonMode: null, bgcolor: uicss.bgcolor };
        var addGroup = function (icon, component) {
            addButton(new UIImageButton(icon).init(nonButton));
            var group = [];
            group.push(
                new UIImageListButton(UITools.ICON_LEFT, group).init({ name: "n" + component }),
                new UIImageListButton(UITools.ICON_CENTER, group).init({ name: "c" + component }),
                new UIImageListButton(UITools.ICON_RIGHT, group).init({ name: "p" + component }));
            group.forEach(function (b) { addButton(b) });
            group[1].select();
        }.bind(this);

        addGroup(UITools.ICON_X, "x");
        addGroup(UITools.ICON_Y, "y");
        addGroup(UITools.ICON_Z, "z");
    }

    clickButton(e) {
        if (e.target.name) {
            var component = e.target.name.charAt(1);
            switch (e.target.name.charAt(0)) {
                case "n": this.position[component] = -1; break;
                case "c": this.position[component] = 0; break;
                case "p": this.position[component] = 1; break;
            }
        }
    }
}

//------------------------------------------------------------------------------------------------------------------------------------------------------------
class UICustomBrushes extends UIFlowContainer {
    constructor() {
        super();
        this.images = [];
        this.size = new Size(1, 2);
        this.square = true;
        Editor.self.clipboard.events.add(["added", "removed"], this.updateClipboard.bind(this));
    }

    updateClipboard(e) {
        this.clearControls();
        var button, group = [];

        var select = function (e) { this.selectedShape = e.target.shape; }.bind(this);

        var add = function (shape) {
            this.addControl(button = new UIImageListButton(shape.thumbnail ? shape.thumbnail : UITools.ICON_NO_IMAGE, group));
            button.shape = shape;
            group.push(button);
            button.events.add("selected", select.bind(this));
        }.bind(this);

        for (var shape of Editor.self.clipboard.items) add(shape);
        this.selectedShape = null;
        group.length && group[0].select();
    }
}
