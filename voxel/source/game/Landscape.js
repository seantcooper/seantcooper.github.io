var LS_REGION_SIZE = 32; // 50
var LS_WATER = 8; // 50


class Landscape {
    constructor(sizex, sizey) {
        this.size = { x: sizex, y: sizey };
        this.map = new Map(sizex, sizey);
        this.mesh = new LandscapeMesh(this);

        this.map.setAltitude(12);

        var x = sizex / 2 - 25, y = sizey / 2 - 25;
        this.map.addHill(x, y, Math.rndInt(20) + 10, Math.random() * 0.5 + 1.3);

        // for (var i = 0; i < 20; i++) {
        //     var x = Math.rndInt(this.size.x), y = Math.rndInt(this.size.y);
        //     this.map.addHill(x, y, Math.rndInt(50) + 16, Math.random() * 0.8);
        // }
        // for (var i = 0; i < 20; i++) {
        //     var x = Math.rndInt(this.size.x), y = Math.rndInt(this.size.y);
        //     this.map.addHill(x, y, Math.rndInt(8) + 4, -Math.random() * 0.7);
        // }
        //this.map.smooth(32, 0.5);
    }
    update() {
        this.mesh.update();
    }
}

class LandscapeMesh {
    constructor(landscape) {
        this.landscape = landscape;
        this.regions = [];
        this.container = new GLContainer("landscape");
        this.container.matrix = Matrix4.identity;
        //this.container.matrix.translate(-this.landscape.size.x / 2, -this.landscape.size.y / 2, 0);

        // this.container.addRegion(this.water = new LMRWater(landscape, 0.25 * MaxAltitude - 0.1));

        for (var y = 0; y < landscape.size.y; y += LS_REGION_SIZE) {
            for (var x = 0; x < landscape.size.x; x += LS_REGION_SIZE) {
                var region = new LMRegion(landscape, x, y);
                this.container.addRegion(region);
            }
        }
    }
    update() {
        for (var region of this.container.regions.values) {
            region.update();
        }
    }
}

class LMRWater extends GLRegion {
    constructor(landscape, height) {
        super("water");
        var cube = LMRegion.getCube(0, 0);
        this.landscape = landscape;

        var data = { vertices: [], colors: [], indices: [] }, faces = 0, size = landscape.size;

        for (var v of cube) {
            data.vertices.push(v.x * size.x, v.y * size.y, v.z * height);
        }

        var r = 1 / 255, g = 136 / 255, b = 136 / 255;
        data.colors.push(r, g, b, r, g, b, r, g, b, r, g, b, r, g, b, r, g, b, r, g, b, r, g, b);

        for (var quad of VX_FACES) {
            data.indices.push(quad[0], quad[1], quad[2], quad[0], quad[2], quad[3]);
        }
        trace(data);
        this.data = data;
    }

    update() {
    }
}

class LMRegion extends GLRegion {
    constructor(landscape, x, y) {
        super(x + "_" + y);
        this.landscape = landscape;
        this.area = { x1: x, y1: y, x2: Math.min(this.landscape.size.x, x + LS_REGION_SIZE), y2: Math.min(this.landscape.size.y, y + LS_REGION_SIZE) };
        this.damage = true;
        for (var y = this.area.y1; y < this.area.y2; y++) {
            for (var x = this.area.x1, cells = this.landscape.map.cells[y]; x < this.area.x2; x++) {
                var cell = cells[x];
                cell.region = this;
            }
        }
    }

    damageAt(x, y) {
        this.damage = true;
    }

    update() {
        if (!this.damage) return;
        this.damage = false;
        var data = { vertices: [], colors: [], indices: [] }, faces = 0;
        // var quadIds = []
        for (var y = this.area.y1; y < this.area.y2; y++) {
            for (var x = this.area.x1, cells = this.landscape.map.cells[y]; x < this.area.x2; x++) {
                var cell = cells[x];
                var cube = LMRegion.getCube(cell.x, cell.y);

                var addFace = function (id, alt1, alt2) {
                    var quad = VX_FACES[id];
                    var shade = VX_SHADING[id] / 255;
                    var v1 = cube[quad[0]], v2 = cube[quad[1]], v3 = cube[quad[2]], v4 = cube[quad[3]];

                    alt1 = Math.max(LS_WATER, alt1);
                    alt2 = Math.max(LS_WATER, alt2);

                    var idx = data.vertices.length / 3;
                    data.indices.push(idx + 0, idx + 1, idx + 2, idx + 0, idx + 2, idx + 3);

                    data.vertices.push(
                        v1.x, v1.y, v1.z ? alt1 : alt2,
                        v2.x, v2.y, v2.z ? alt1 : alt2,
                        v3.x, v3.y, v3.z ? alt1 : alt2,
                        v4.x, v4.y, v4.z ? alt1 : alt2
                    );

                    var r = cell.color.r * shade, g = cell.color.g * shade, b = cell.color.b * shade;
                    data.colors.push(r, g, b, r, g, b, r, g, b, r, g, b);
                    faces += 2;
                }

                var neighbors = cell.neighbors;

                addFace(VX_IPZ, cell.altitude, cell.altitude); // top
                cell.altitude > neighbors[0].altitude && addFace(VX_INX, cell.altitude, neighbors[0].altitude);
                cell.altitude > neighbors[1].altitude && addFace(VX_INY, cell.altitude, neighbors[1].altitude);
                cell.altitude > neighbors[2].altitude && addFace(VX_IPX, cell.altitude, neighbors[2].altitude);
                cell.altitude > neighbors[3].altitude && addFace(VX_IPY, cell.altitude, neighbors[3].altitude);
            }
        }
        this.data = data;
    }

    static getCube(x, y) {
        var vertices = [];
        for (var v of VX_CUBE)
            vertices.push(new Vertex(x + v.x, y + v.y, v.z));
        return vertices;
    }

    static getIndices(length) {
        if (!LMRegion._indices) { LMRegion._indices = []; }
        for (var i = LMRegion._indices.length * 4 / 6, len = length * 6; LMRegion._indices.length < len; i += 4)
            LMRegion._indices.push(i + 0, i + 1, i + 2, i + 0, i + 2, i + 3);
        return LMRegion._indices.slice(0, len);
    }
}