class Map3Edit {
    constructor(map) {
        this.map = map;
        this.selection = new Array3(this.map.size.x, this.map.size.y, this.map.size.z);
    }

    beginEdit() {
        Editor.self.addHistoryMap();
        this.clearSelection();
    }
    endEdit() {
    }

    resize() { this.selection.resize(this.map.size.x, this.map.size.y, this.map.size.z); }
    selectAt(x, y, z) {
        this.selection[z][y][x] = 1;
        this.map.damageAt(x, y, z, 1);
    }
    deselectAt(x, y, z) {
        this.selection[z][y][x] = null;
        this.map.damageAt(x, y, z, 1);
    }
    clearSelection() {
        this.selection.forEvery(function (p) { this.deselectAt(p.x, p.y, p.z) }.bind(this));
    }
    deleteSelection() {
        this.selection.forEvery(function (p) { this.map.clearAt(p.x, p.y, p.z); }.bind(this));
    }
    copySelection() {
        var selection = Map3Shape.fromSelection(this.map);
        if (selection) {
            var shape = selection.crop();
            if (shape) {
                shape.matrix = this.map.mesh.container.concatenatedMatrix;
                shape.palette = this.map.palette;
                shape.thumbnail = Map3Thumbnail.getImage(selection.data, shape.palette.colors, Editor.self.camera);
                return shape;
            }
        }
    }
    getNormalVector(position, normal) {
        var container = this.map.mesh.container;
        var matrix = container.concatenatedMatrix;
        var renderer = container.renderer;
        var p = renderer.GLToCanvas(matrix.multiplyVertex(position));
        var n = renderer.GLToCanvas(matrix.multiplyVertex(new Vector3(position.x + normal.x, position.y + normal.y, position.z + normal.z)));
        return new Point(n.x - p.x, n.y - p.y);
    }
    // getNormalVector2(position, normal) {
    //     var container = this.map.mesh.container;
    //     var matrix = container.concatenatedMatrix;
    //     var renderer = container.renderer;
    //     var p = renderer.GLToCanvas(matrix.multiplyVertex(position));
    //     var n = renderer.GLToCanvas(matrix.multiplyVertex(new Vector3(position.x + normal.x, position.y + normal.y, position.z + normal.z)));
    //     return { position: p, normal: n }
    // }
}

