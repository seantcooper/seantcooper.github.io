//==============================================================================================================================================================================
class UITools extends UIContainer {
    constructor() {
        super();
        //this.margin = 4;

        this.addControl(this.strip = new TLStrip());
        this.addControl(new UIFolder("Tools", this.container = new UIContainer()));

        //this.addControl(new UISpacer(new Size(1, 0.25)));

        this.container.addControl((this.tabs = new UITabs()).init({ tabHeight: 1.20, tabSquare: true }));

        var addTab = (function (tool) {
            tool.tools = this;
            var tab = this.tabs.addImageTab(tool.name, tool.icon, tool);
            tab.button.tooltip = tool.buttonTooltip;
        }).bind(this);

        addTab(new TLPicker());
        addTab(new TLDraw());
        addTab(new TLFill());
        addTab(new TLPushPull());
        addTab(new TLBoxSelect());
        addTab(new TLEdit());
        addTab(new TLBoxDraw());
        addTab(new TLEllipseDraw());
        addTab(new TLLineDraw());
        addTab(new TLWandSelect());

        this.selectTool("TLDraw");
    }
    selectTool(name) {
        this.tabs.selectTab(name.toLowerCase());
    }

    static get ICONS() { return UITools._ICONS ? UITools._ICONS : UITools._ICONS = new SpriteSheet(GetImage("images/icons.png"), 64, 64); }
    static get ICON_BRUSH() { return UITools.ICONS.getImage(0); }
    static get ICON_PENCIL() { return UITools.ICONS.getImage(1); }
    static get ICON_BRUSH_RECT() { return UITools.ICONS.getImage(2); }
    static get ICON_PICK() { return UITools.ICONS.getImage(3); }
    static get ICON_RUBBER() { return UITools.ICONS.getImage(4); }
    static get ICON_FILL() { return UITools.ICONS.getImage(5); }
    static get ICON_DROP() { return UITools.ICONS.getImage(6); }

    static get ICON_WAND() { return UITools.ICONS.getImage(8); }
    static get ICON_SELECT_RECT() { return UITools.ICONS.getImage(9); }
    static get ICON_SELECT_PAINT() { return UITools.ICONS.getImage(10); }
    static get ICON_DRAW() { return UITools.ICONS.getImage(11); }
    static get ICON_ATTACH() { return UITools.ICONS.getImage(12); }

    static get ICON_LOOP() { return UITools.ICONS.getImage(16); }
    static get ICON_CUBE1() { return UITools.ICONS.getImage(17); }
    static get ICON_CUBE2() { return UITools.ICONS.getImage(18); }
    static get ICON_SPHERE() { return UITools.ICONS.getImage(19); }
    static get ICON_PLANE() { return UITools.ICONS.getImage(20); }
    static get ICON_PIXEL() { return UITools.ICONS.getImage(21); }

    static get ICON_PULL() { return UITools.ICONS.getImage(24); }
    static get ICON_MOVE() { return UITools.ICONS.getImage(25); }
    static get ICON_CROP() { return UITools.ICONS.getImage(28); }
    static get ICON_GRID() { return UITools.ICONS.getImage(29); }
    static get ICON_PALETTE() { return UITools.ICONS.getImage(30); }
    static get ICON_MODELS() { return UITools.ICONS.getImage(31); }

    static get ICON_SAVE_CLOUD() { return UITools.ICONS.getImage(32); }
    static get ICON_LOAD_CLOUD() { return UITools.ICONS.getImage(33); }
    static get ICON_OPTIONS() { return UITools.ICONS.getImage(34); }
    static get ICON_UNDO() { return UITools.ICONS.getImage(35); }
    static get ICON_REDO() { return UITools.ICONS.getImage(36); }
    static get ICON_DOWNLOAD() { return UITools.ICONS.getImage(37); }
    static get ICON_UPLOAD() { return UITools.ICONS.getImage(38); }
    static get ICON_NO_IMAGE() { return UITools.ICONS.getImage(39); }

    static get ICON_DRAW_RECT() { return UITools.ICONS.getImage(40); }
    static get ICON_DRAW_CIRCLE() { return UITools.ICONS.getImage(41); }
    static get ICON_DRAW_LINE() { return UITools.ICONS.getImage(42); }
    static get ICON_DRAW_CUBE() { return UITools.ICONS.getImage(43); }
    static get ICON_DRAW_SPHERE() { return UITools.ICONS.getImage(44); }
    static get ICON_DOWNLOAD_MESH() { return UITools.ICONS.getImage(45); }

    static get ICON_X() { return UITools.ICONS.getImage(48); }
    static get ICON_Y() { return UITools.ICONS.getImage(49); }
    static get ICON_Z() { return UITools.ICONS.getImage(50); }
    static get ICON_ALL() { return UITools.ICONS.getImage(51); }
    static get ICON_MINUS() { return UITools.ICONS.getImage(52); }
    static get ICON_PLUS() { return UITools.ICONS.getImage(53); }
    static get ICON_DOT() { return UITools.ICONS.getImage(54); }
    static get ICON_CENTER() { return UITools.ICONS.getImage(55); }

    static get ICON_CUT_SELECTION() { return UITools.ICONS.getImage(56); }
    static get ICON_COPY_SELECTION() { return UITools.ICONS.getImage(57); }
    static get ICON_DELETE_SELECTION() { return UITools.ICONS.getImage(58); }
    static get ICON_CLEAR_SELECTION() { return UITools.ICONS.getImage(59); }
    static get ICON_EXPAND() { return UITools.ICONS.getImage(60); }
    static get ICON_COLLAPSE() { return UITools.ICONS.getImage(61); }
    static get ICON_LEFT() { return UITools.ICONS.getImage(62); }
    static get ICON_RIGHT() { return UITools.ICONS.getImage(63); }

    static get ICON_VIEW_ISO() { return UITools.ICONS.getImage(64); }
    static get ICON_VIEW_FRONT() { return UITools.ICONS.getImage(65); }
    static get ICON_VIEW_LEFT() { return UITools.ICONS.getImage(66); }
    static get ICON_VIEW_RIGHT() { return UITools.ICONS.getImage(67); }
    static get ICON_VIEW_BACK() { return UITools.ICONS.getImage(68); }
    static get ICON_VIEW_TOP() { return UITools.ICONS.getImage(69); }
    static get ICON_VIEW_BOTTOM() { return UITools.ICONS.getImage(70); }



}

//==============================================================================================================================================================================
class TLTool extends UIContainer {
    constructor(title) {
        super();
        this.buttonTooltip = title;
        this.addControl(this.folder = new UIFolder(title, this.main = new UIContainer()));
        this.folder.title.bgcolor = uicss.selectedColor;
    }
    onVisibleChanged() {
        super.onVisibleChanged();
        if (this.tool)
            this.visible ? Editor.self.tools.addTool(this.tool) : Editor.self.tools.removeTool(this.tool);
    }
    get renderer() { return Editor.self.renderer; }
    get picker() { return Editor.self.colorPicker; }
    get color() { return Editor.self.colorPicker.index; }
    get map() { return Editor.self.map; }
}

//------------------------------------------------------------------------------------------------------------------------------------------------------------
class TLMode extends UIContainer {
    constructor() {
        super();

        this.addControl(new UIFolder("Modes", this.container = new UIContainer()));

        this.container.addControl(this.strip = new UIFlowContainer());
        this.strip.size = new Size(1, 1.2);
        this.strip.square = true;
        //this.buttonSize = new Size(0.25, 1);

        this.mode = {};
        this.addButton(new UIImageToggleButton(UITools.ICON_DRAW).init({ name: "draw", tooltip: "Paint on surface" }));
        this.addButton(new UIImageToggleButton(UITools.ICON_ATTACH).init({ name: "attach", tooltip: "Attach to surface" }));
        this.strip.controls[0].select();
        this.strip.controls[1].select();
        this.container.addControl(new UISpacer());
    }

    buttonSelected(e) { this.mode[e.target.name] = e.target.selected; }
    getMode() { return this.mode; }

    addButton(button) {
        //button.size = this.buttonSize;
        button.events.add(["selected", "deselected"], this.buttonSelected.bind(this));
        this.strip.addControl(button);
    }
}

//==============================================================================================================================================================================
class TLMirror extends UIContainer {
    constructor() {
        super();

        var mirror = this.mirror = { x: false, y: false, z: false };
        this.addControl(this.folder = new UIFolder("Mirror", this.container = new UIFlowContainer()));
        this.folder.collapse();
        this.container.size = new Size(1, 1.25);
        var buttons = [];

        var selectAll = function (e) { buttons.forEach(function (b) { b.select() }); }
        var deselectAll = function (e) { buttons.forEach(function (b) { b.deselect() }); }
        var selected = function (e) { mirror[e.target.name] = true; }
        var deselected = function (e) { mirror[e.target.name] = false; }
        var addButton = (function (_button) {
            _button.size = new Size(0.25, 1);
            buttons.push(_button);
            _button.events.add("selected", _button.name == "all" ? selectAll : selected);
            _button.events.add("deselected", _button.name == "all" ? deselectAll : deselected);
            this.container.addControl(_button);
        }).bind(this);

        addButton(new UIToggleButton().init({ name: "x", image: UITools.ICON_X }));
        addButton(new UIToggleButton().init({ name: "y", image: UITools.ICON_Y }));
        addButton(new UIToggleButton().init({ name: "z", image: UITools.ICON_Z }));
        addButton(new UIToggleButton().init({ name: "all", image: UITools.ICON_ALL }));
    }
}

//==============================================================================================================================================================================
class TLStrip extends UIContainer {
    constructor() {
        super();
        this.addControl(this.strip = new UIFlowContainer());
        //this.strip.bgcolor = uicss.bgcolorLight;
        this.strip.square = true;
        this.strip.size = new Size(1, 1.2);

        var _undo = function (e) { Editor.self.history.undo(); }.bind(this);
        var _redo = function (e) { Editor.self.history.redo(); }.bind(this);
        var _grid = function (e) { Editor.self.map.mesh.grid.visible = e.target.selected; }.bind(this);

        var button;
        this.strip.addControl(button = new UIImageButton(UITools.ICON_UNDO));
        button.tooltip = "Undo";
        button.events.add("click", _undo);

        this.strip.addControl(button = new UIImageButton(UITools.ICON_REDO));
        button.tooltip = "Redo";
        button.events.add("click", _redo);

        this.strip.addControl(button = new UIImageToggleButton(UITools.ICON_GRID));
        button.tooltip = "Toggle grid/axis";
        button.events.add(["selected", "deselected"], _grid);
        button.select();

        this.addControl(new UISpacer());
    }
}

//==============================================================================================================================================================================