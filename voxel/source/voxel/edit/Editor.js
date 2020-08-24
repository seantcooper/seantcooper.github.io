//------------------------------------------------------------------------------------------------------------------------------------------------------------
class Editor {
    constructor() {
        if (Editor.self) return;

        Editor.self = this;

        this.camera = new Camera();
        this.camera.flip = true;
        this.renderer = new GLRender();
        this.scratch = new VXScratch(true);
        this.history = new History(this);
        this.clipboard = new TLClipboard();

        var size = 64;
        !this.map && (this.map = new Map3(size, size, size));

        this.map.data.forEach(function (x, y, z) {
            z < size / 4 && this.map.setAt(x, y, z, 20);
        }.bind(this));

        this.renderer.addContainer(this.map.mesh.container);

        this.map.mesh.container.matrix = Matrix4.identity;
        this.map.mesh.container.matrix.translate(-size / 2, -size / 2, -size / 2);

        // tools
        this.tools = new VXTools(this.scratch.canvas);
        this.tools.addTool(new VXToolFaceSelection());
        this.tools.addTool(new VXToolCameraControl(this.camera));
        this.tools.addTool(new VXToolCameraZoom(this.camera));

        // UI
        trace(Editor.self);
        trace(Editor.self.map);
        trace(Editor.self.map.palette);
        this.ui = new CustomUI(this);
        this.footer = new FooterUI(this);
        this.fps = new FPS();
    }

    closing() {
        trace("Editor::closing");
        //   localStorage.currentModel = this.model.toData();
    }

    render() {
        Profiler.clear();
        Profiler.startTimer("Editor::render");
        this.fps.update();
        this.map.update();
        this.renderer.render(this.camera.matrix);
        this.scratch.clear();
        this.renderSelectObject();
        this.ui.onPaint();
        this.footer.onPaint();
        this.fps.paint();
        Profiler.stopTimer("Editor::render");

        if (Profiler.show) {
            trace(Profiler.toString());
            trace(this.damage);
            Profiler.show = false;
        }
    }

    resize(w, h) {
        var x = this.ui.resizeCanvas(w, h);
        w -= x;
        this.footer.resizeCanvas(x, h - uicss.height, w, uicss.height);

        this.fps.resize(x, 0, w, h);
        h -= uicss.height;
        this.renderer.resize(x, 0, w, h);
        this.scratch.resize(x, 0, w, h);
        this.camera.resize(w, h);
    }

    renderSelectObject() {
        if (!this.selectedFace) return;

        this.renderer.concatenatedMatrix.multiplyVertices(this.selectedFace.vertices);

        var vt1 = this.renderer.GLToCanvas(this.selectedFace.vertices[0].trans);
        var vt2 = this.renderer.GLToCanvas(this.selectedFace.vertices[1].trans);
        var vt3 = this.renderer.GLToCanvas(this.selectedFace.vertices[2].trans);
        var vt4 = this.renderer.GLToCanvas(this.selectedFace.vertices[3].trans);

        var ctx = this.scratch.context;
        ctx.globalAlpha = 0.5;

        ctx.beginPath();
        ctx.moveTo(vt1.x, vt1.y);
        ctx.lineTo(vt2.x, vt2.y);
        ctx.lineTo(vt3.x, vt3.y);
        ctx.lineTo(vt4.x, vt4.y);
        ctx.lineTo(vt1.x, vt1.y);

        var time = (Date.now() / 500) % 2, c = Math.floor(Math.abs(255 * (time - 1)));
        var color = new Color(255 - c, c, c).html;
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.fill();

        // if (this.normals) {
        //     ctx.beginPath();
        //     ctx.moveTo(this.normals.position.x, this.normals.position.y);
        //     ctx.lineTo(this.normals.positionx.x, this.normals.positionx.y);
        //     ctx.strokeStyle = "#ff0000";
        //     ctx.stroke();
        //     ctx.beginPath();
        //     ctx.moveTo(this.normals.position.x, this.normals.position.y);
        //     ctx.lineTo(this.normals.positiony.x, this.normals.positiony.y);
        //     ctx.strokeStyle = "#00ff00";
        //     ctx.stroke();
        //     ctx.beginPath();
        //     ctx.moveTo(this.normals.position.x, this.normals.position.y);
        //     ctx.lineTo(this.normals.positionz.x, this.normals.positionz.y);
        //     ctx.strokeStyle = "#0000ff";
        //     ctx.stroke();
        // }
    }

    get selectedFace() { return this._selectedFace; }
    set selectedFace(a) { this._selectedFace = a; }

    saveModel() {
        // var fileSelector = document.createElement('input');
        // fileSelector.setAttribute('type', 'file');

        // var selectDialogueLink = document.createElement('a');
        // selectDialogueLink.setAttribute('href', '');
        // selectDialogueLink.innerText = "Select File";

        // fileSelector.click();
        // document.body.appendChild(selectDialogueLink);
    }

    addHistoryPalette() { this.history.addState("palette", this.map.palette); }
    addHistoryMap() { this.history.addState("map", this.map); }
}

//------------------------------------------------------------------------------------------------------------------------------------------------------------
class TLClipboard {
    constructor() {
        this.items = [];
        this.events = new EventDispatcher(this);
    }
    add(shape) {
        this.items.push(shape);
        this.events.raise("added", { item: shape });
    }
    remove(shape) {
        var index = this.items.indexOf(shape);
        var item = this.items[index];
        this.items.splice(index, 1);
        this.events.raise("removed", { item: item });
    }
}
//------------------------------------------------------------------------------------------------------------------------------------------------------------
class CustomUI extends UIStage {
    constructor() {
        super();
        this.layout = new UIHorizontalLayout();

        this.addControl(new UISpacer(new Size(8 / uicss.width, 1)));

        var container = new UIContainer();
        this.addControl(container);
        container.addControl(new UISpacer(new Size(1, 0.3)));
        container.addControl(this.tabs = new UITabs().init({ tabHeight: 1.20, tabSquare: true }));
        this.tabs.addImageTab("palette", UITools.ICON_PALETTE, Editor.self.colorPicker = new UIColorPicker(Editor.self)).button.tooltip = "Palette";
        this.tabs.addImageTab("model", UITools.ICON_MODELS, new UISavedMaps()).button.tooltip = "Models";
        this.tabs.selectTab("palette");

        this.addControl(new UISpacer(new Size(8 / uicss.width, 1)).init({}));
        var container = new UIContainer();
        this.addControl(container);
        container.addControl(new UISpacer(new Size(1, 0.3)));
        container.addControl(this.tools = new UITools());
        this.addControl(new UISpacer(new Size(8 / uicss.width, 1)));

    }
    resizeCanvas(w, h) {
        this.resize(uicss.width, h);
        w = this.displayRect.width;
        this.canvas.size(w, h);
        this.canvas.position(0, 0);
        return this.canvas.width;
    }
}

//------------------------------------------------------------------------------------------------------------------------------------------------------------
class UISavedMaps extends UIContainer {
    constructor() {
        super();

        this.addControl(this.strip = new UISavedStrip());
        this.addControl(this.container = new UIFlowContainer());

        this.container.size = new Size(1, 2);
        this.container.square = true;
        this.maps = [];
        this.buttons = [];

        var _upload = function (e) { this.upload(this.currentIndex); }.bind(this);
        var _download = function (e) { this.download(this.currentIndex); }.bind(this);
        var _save = function (e) { this.save(this.currentIndex); }.bind(this);
        var _load = function (e) { this.load(this.currentIndex); }.bind(this);
        var _select = function (e) { this.load(this.currentIndex = e.target.index); }.bind(this);

        this.strip.events.add("upload", _upload);
        this.strip.events.add("download", _download);
        this.strip.events.add("save", _save);
        this.strip.events.add("load", _load);

        var button;
        var select = function (e) { this.selectedShape = e.target.shape; }.bind(this);

        var add = function (index) {
            this.container.addControl(button = new UIImageListButton(UITools.ICON_NO_IMAGE, this.buttons));
            this.buttons.push(button);
            button.index = index;
            this.maps.push(Map3Data.fromString(localStorage["SAVED_MAP_" + index]));
            if (this.maps[index]) {
                button.image = this.maps[index].image;
            }
            button.events.add("selected", _select);
        }.bind(this);

        for (var i = 0; i < 36; add(i), i++);
        this.buttons[0].select();
    }
    download(index) {
        trace("DOWNLOAD", index);
        File.downloadText("Mesh" + index + ".txt", Editor.self.map.mesh.container.toCode(Editor.self.map.size, ["grid"]));
    }
    upload(index) {
    }
    load(index) {
        trace("LOAD", index);
        var data = this.maps[index];
        data && data.setMap(Editor.self.map);
    }
    save(index) {
        trace("SAVE", index);
        this.maps[index] = Map3Data.fromMap(Editor.self.map);
        this.buttons[index].image = this.maps[index].image;
        localStorage["SAVED_MAP_" + index] = this.maps[index].toString();
    }
}

class UISavedStrip extends UIFlowContainer {
    constructor() {
        super();
        this.square = true;
        this.size = new Size(1, 1.2);

        var add = function (button, tooltip, events, func) {
            button.tooltip = tooltip;
            button.events.add(events, func);
            this.addControl(button);
        }.bind(this);

        add(new UIImageButton(UITools.ICON_SAVE_CLOUD), "Save model", "click", function (e) { this.events.raise("save"); }.bind(this));
        add(new UIImageButton(UITools.ICON_DOWNLOAD), "Download model", "click", function (e) { this.events.raise("download"); }.bind(this));
        //add(new UIImageButton(UITools.ICON_UPLOAD), "Upload model", "click", function (e) { this.events.raise("upload"); }.bind(this));
        //add(new UIImageButton(UITools.ICON_LOAD_CLOUD), "Load model", "click", function (e) { this.events.raise("load"); }.bind(this));
        this.addControl(new UISpacer());
    }
}

//------------------------------------------------------------------------------------------------------------------------------------------------------------
class FooterUI extends UIStage {
    constructor() {
        super(uicss.bgcolor);
        this.layout = new UIHorizontalLayout();

        this.addControl(this.container = new UIContainer(new UIHorizontalLayout));
        this.container.margin = 4;

        //this.addSizing(this.container);
        this.addLocation(this.container);
        this.container.addControl(new UISpacer(new Size(8 / uicss.width, 1)).init({}));
        this.addView(this.container);
    }

    addLocation(cointainer) {
        this.container.addControl(this.cursor = new UILabel("").init({ size: new Size(0.7, 1), bgcolor: Color.red }));
    }

    addView(container) {
        var camera = Editor.self.camera;
        var click = function (e) {
        }.bind(this);

        var addButton = (function (_button, _tooltip, _callback) {
            _button.tooltip = _tooltip;
            _button.size = new Size(uicss.ratio, 1);
            _button.events.add("click", _callback);
            container.addControl(_button);
        }).bind(this);

        // views
        addButton(new UIImageButton(UITools.ICON_VIEW_ISO), "Iso", camera.setIsoView.bind(camera));
        addButton(new UIImageButton(UITools.ICON_VIEW_TOP), "Top", camera.setTopView.bind(camera));
        addButton(new UIImageButton(UITools.ICON_VIEW_FRONT), "Front", camera.setFrontView.bind(camera));
        addButton(new UIImageButton(UITools.ICON_VIEW_LEFT), "Left", camera.setLeftView.bind(camera));
        addButton(new UIImageButton(UITools.ICON_VIEW_RIGHT), "Right", camera.setRightView.bind(camera));
        addButton(new UIImageButton(UITools.ICON_VIEW_BACK), "Back", camera.setBackView.bind(camera));
        addButton(new UIImageButton(UITools.ICON_VIEW_BOTTOM), "Bottom", camera.setBottomView.bind(camera));
    }
    setLocation(index) {
        this.cursor.text = "cursor " + (index ? index.x + " " + index.y + " " + index.z : "- - -");
    }

    resizeCanvas(x, y, w, h) {
        this.resize(uicss.width, h);
        this.canvas.position(x, y);
        this.canvas.size(w, h);
    }
}
