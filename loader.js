console.log("START");

var images = {};

document.onreadystatechange = function () {
    console.log("readyState", document.readyState);
}

window.onload = function () {
    console.log("window", "onload");
}

var GetImage = function (_path) { return document.getElementById(_path.toLowerCase()); }

var loadCount;
var elementLoaded = function (index, path) {
    console.log("LOADED", index, path, loadCount);
    (--loadCount) == 0 && loaded();
}

var loadScripts = function (scripts, _version) {
    console.log("Start Load:");
    var _load = function (path, index) {
        path = path.toLowerCase();
        var write, onloadF = "\"elementLoaded(" + index + ",'" + path + "')\"";
        var _vpath = path + (!RELEASE ? "?v=" + _version : "");
        switch (path.split(".").pop()) {
            case "js": document.write(write = "<script onreadystate=" + onloadF + " onload=" + onloadF + " src=\"" + _vpath + "\"></script>"); break;
            case "css": document.write(write = "<link  onload=" + onloadF + " rel=\"stylesheet\" type=\"text/css\" href=\"" + _vpath + "\">"); break;
            case "png":
            case "jpg":
                document.write(write = "<img style=\"display: none\" onload=" + onloadF + " id=\"" + path + "\" src=\"" + _vpath + "\"></img>");
                break;
            default: console.log(write = "NO EXT!", path); return;
        }
        console.log(write);
    }

    loadCount = scripts.length;
    for (var i = 0; i < loadCount; _load(scripts[i], i), i++);
}

var load = function (_version) {
    var scripts = [];

    scripts.push("images/icons.png");

    scripts.push("source/system/Debug.js");
    // source/data
    scripts.push("source/data/Dictionary.js");
    scripts.push("source/data/Array.js");
    scripts.push("source/data/Array3.js");
    scripts.push("source/data/Object3.js");

    // source/system
    scripts.push("source/system/EventDispatcher.js");
    scripts.push("source/system/File.js");

    // source/display
    scripts.push("source/display/Color.js");
    scripts.push("source/display/Display.js");
    scripts.push("source/display/FPS.js");
    scripts.push("source/display/Mouse.js");
    scripts.push("source/display/SpriteSheet.js");
    scripts.push("source/display/HCanvas.js");

    // source/geom
    scripts.push("source/geom/Rect.js");
    scripts.push("source/geom/Math.js");
    scripts.push("source/geom/Matrix4.js");
    scripts.push("source/geom/Vector3.js");
    scripts.push("source/geom/Shape3d.js");
    scripts.push("source/geom/Vertex.js");

    // source/ui
    scripts.push("source/ui/UIControl.js");
    scripts.push("source/ui/UIControls.js");
    scripts.push("source/ui/UITextInput.js");
    scripts.push("source/ui/UISlider.js");
    scripts.push("source/ui/UILayout.js");
    scripts.push("source/ui/UITabs.js");
    scripts.push("source/ui/UIColorPicker.js");
    scripts.push("source/ui/UIStage.js");
    scripts.push("source/ui/UITooltip.js");
    scripts.push("source/ui/UIFolder.js");

    // source/voxel/gl
    scripts.push("source/voxel/gl/GLRegion.js");
    scripts.push("source/voxel/gl/GLBuffer.js");
    scripts.push("source/voxel/gl/GLRender.js");
    scripts.push("source/voxel/gl/GLContainer.js");
    scripts.push("source/voxel/gl/Camera.js");

    // source/voxel/geom
    scripts.push("source/voxel/geom/Constants.js");
    scripts.push("source/voxel/geom/Palette.js");
    scripts.push("source/voxel/geom/Map3.js");
    scripts.push("source/voxel/geom/Map3Edit.js");
    scripts.push("source/voxel/geom/Map3Node.js");
    scripts.push("source/voxel/geom/Map3Region.js");
    scripts.push("source/voxel/geom/Map3Mesh.js");
    scripts.push("source/voxel/geom/Map3Grid.js");
    scripts.push("source/voxel/geom/Map3Shape.js");

    // source/voxel/edit
    scripts.push("source/voxel/edit/Editor.js");
    scripts.push("source/voxel/edit/VXScratch.js");
    scripts.push("source/voxel/edit/VXTool.js");
    scripts.push("source/voxel/edit/History.js");
    scripts.push("source/voxel/edit/Map3Thumbnail.js");

    // source/voxel/edit/tools
    scripts.push("source/voxel/edit/tools/UITool.js");
    scripts.push("source/voxel/edit/tools/TLFill.js");
    scripts.push("source/voxel/edit/tools/TLPaint.js");
    scripts.push("source/voxel/edit/tools/TLPicker.js");
    scripts.push("source/voxel/edit/tools/TLPushPull.js");
    scripts.push("source/voxel/edit/tools/TLSelection.js");
    scripts.push("source/voxel/edit/tools/TLShapeDraw.js");
    scripts.push("source/voxel/edit/tools/TLEdit.js");

    // main
    scripts.push("main.css");
    scripts.push("main.js");

    loadScripts(scripts, _version);
}

var loaded = function () {
    console.log("Window loaded");
    console.log(document);
    console.log(document.body);
    Start();
}

