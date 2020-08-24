//==============================================================================================================================================================================
class Map3 {
    constructor(sizex, sizey, sizez) {
        this.id = Math.random();

        this.events = new EventDispatcher(this);
        this.data = new Array3(sizex, sizey, sizez, function (x, y, z) { return 0; });
        this.damage = new Array3(sizex, sizey, sizez);
        this.nodes = new Array3(sizex, sizey, sizez);
        this.pretty = new Array3(sizex, sizey, sizez);

        this.size = this.data.size;

        this.edit = new Map3Edit(this);
        this.regions = new Map3Regions(this);
        this.neighbor = new MapNeighbor3(this);
        this.mesh = new Map3Mesh(this);

        this.palette = PALETTE1;
        this.tick = 0;
    }
    update() {
        this.tick++;
        this.regions.update();
    }

    clone() {
        var map = new Map3(this.size.x, this.size.y, this.size.z), nyline;
        map.data = this.data.clone();
        return map;
    }
    resize(sizex, sizey, sizez) {
        if (this.size.x == sizex && this.size.y == sizey && this.size.z == sizez) return;

        this.data.resize(sizex, sizey, sizez, function (x, y, z) { this.data[z][y][x] && this.clearAt(x, y, z); }.bind(this));
        this.nodes.resize(sizex, sizey, sizez, function (x, y, z) { this.nodes[z][y][x] && this.nodes[z][y][x].dispose(); }.bind(this));
        this.damage = new Array3(sizex, sizey, sizez);
        this.pretty = new Array3(sizex, sizey, sizez);

        // mark node edges
        this.nodes.forEvery(function (p) { this.nodes[p.z][p.y][p.x].resize(); }.bind(this));

        this.size = this.data.size;
        this.regions.resize();
        this.edit.resize();
        this.mesh.resize();

        this.data.forEachO(function (p) { this.damageAt(p.x, p.y, p.z, 1) }.bind(this));
        this.update();

        this.events.raise("resize");
    }

    clearAll() { this.data.forEach(function (x, y, z) { this.clearAt(x, y, z) }.bind(this)); }
    setAll(value) { this.data.forEach(function (x, y, z) { this.setAt(x, y, z, value) }.bind(this)); }
    getAt(x, y, z) { return this.data[z][y][x]; }
    setAt(x, y, z, value) {
        if (!value) {
            this.clearAt(x, y, z);
        } else {
            var v = this.data[z][y][x];
            if (v != value) {
                this.data[z][y][x] = value;
                this.damageAt(x, y, z, v ? 1 : 2);
            }
        }
    }
    clearAt(x, y, z) {
        if (this.data[z][y][x]) {
            this.data[z][y][x] = 0;
            this.damageAt(x, y, z, 2);
        }
    }
    damageAt(x, y, z, damage, checkBounds) {
        if (checkBounds && this.outOfBounds(x, y, z)) return;
        var current = this.damage[z][y][x];
        if (!current || damage > current) {
            this.damage[z][y][x] = damage;
            this.regions.damageAt(x, y, z);
        }
    }
    outOfBounds(x, y, z) { return (x < 0 || y < 0 || z < 0 || x >= this.size.x || y >= this.size.y || z >= this.size.z); }
    inBounds(x, y, z) { return x >= 0 && y >= 0 && z >= 0 && x < this.size.x && y < this.size.y && z < this.size.z; }
}

//==============================================================================================================================================================================
class MapNeighbor3 {
    constructor(map) {
        this.map = map;
    }
    getNeighbors6(x, y, z) {
        return [
            x == 0 ? null : this.map.data[z][y][x - 1], x == this.size.x - 1 ? null : this.map.data[z][y][x + 1],
            y == 0 ? null : this.map.data[z][y - 1][x], y == this.size.y - 1 ? null : this.map.data[z][y + 1][x],
            z == 0 ? null : this.map.data[z - 1][y][x], z == this.size.z - 1 ? null : this.map.data[z + 1][y][x]
        ];
    }
    getN6Flags(x, y, z) {
        var flags = 0b111111;
        (x == 0 ? null : this.map.data[z][y][x - 1]) && (flags ^= 1 << 0);
        (x == this.map.size.x - 1 ? null : this.map.data[z][y][x + 1]) && (flags ^= 1 << 1);
        (y == 0 ? null : this.map.data[z][y - 1][x]) && (flags ^= 1 << 2);
        (y == this.map.size.y - 1 ? null : this.map.data[z][y + 1][x]) && (flags ^= 1 << 3);
        (z == 0 ? null : this.map.data[z - 1][y][x]) && (flags ^= 1 << 4);
        (z == this.map.size.z - 1 ? null : this.map.data[z + 1][y][x]) && (flags ^= 1 << 5);
        return flags;
    }
    ForEachNeighbors(x, y, z, func) {
        var z1 = z == 0 ? z1 = 0 : z - 1, z2 = z == size - 1 ? z2 = size - 1 : z + 1;
        var y1 = y == 0 ? y1 = 0 : y - 1, y2 = y == size - 1 ? y2 = size - 1 : y + 1;
        var x1 = x == 0 ? x1 = 0 : x - 1, x2 = x == size - 1 ? x2 = size - 1 : x + 1;
        for (var dz = z1; dz <= z2; dz++) {
            for (var dy = y1; dy <= y2; dy++) {
                for (var dx = x1; dx <= x2; func(dx, dy, dz), dx++);
            }
        }
    }
    static getNeighborDeltas6() {
        if (!MapNeighbor3.deltas6) {
            MapNeighbor3.deltas6 = [
                { x: -1, y: 0, z: 0 },
                { x: +1, y: 0, z: 0 },
                { x: 0, y: -1, z: 0 },
                { x: 0, y: +1, z: 0 },
                { x: 0, y: 0, z: -1 },
                { x: 0, y: 0, z: +1 }
            ];
        }
        return MapNeighbor3.deltas6;
    }
    static getNeighborDeltas27() {
        if (!MapNeighbor3.deltas27) {
            MapNeighbor3.deltas27 = [];
            for (var z = -1; z <= 1; z++) {
                for (var y = -1; y <= 1; y++) {
                    for (var x = -1; x <= 1; x++) {
                        (x || y || z) && MapNeighbor3.deltas27.push({ x: x, y: y, z: z });
                    }
                }
            }
        }
        return MapNeighbor3.deltas27;
    }
}

//==============================================================================================================================================================================
class Map3Data {
    constructor(map) {
        // data:
        // size: x, y, z
        // palette: 256 {r,g,b}
        // map: x * y * z {color}

    }

    static fromMap(map) {

        trace(map.mesh.container.concatenatedMatrix.toString());

        var mapData = new Map3Data();
        mapData.image = Map3Thumbnail.getImage(map.data, map.palette.colors, Editor.self.camera);
        mapData.data = [map.size.x, map.size.y, map.size.z].concat(map.palette.toArray()).concat(map.data.toArray());
        mapData.data = mapData.data.RLEncode();
        return mapData;
    }

    static fromString(strData) {
        if (!strData) return;
        //UITools.ICON_VIEW_ISO
        var mapData = new Map3Data();
        mapData.data = strData.split(",").select(function (s) { return Number(s) });
        var object = mapData.getData();
        var time = Date.now();
        mapData.image = Map3Thumbnail.getImage(object.data, object.colors);
        trace("Thumbnail took", Date.now() - time);
        return mapData;
    }

    toString() { return this.data.join(","); }

    download(name) {
        File.downloadText(name + ".txt", this.data.join(","));
    }

    setMap(map) {
        var decode = this.data.RLDecode();

        var sx = decode.shift(), sy = decode.shift(), sz = decode.shift();
        map.resize(sx, sy, sz);
        for (var i = 0, colors = []; i < 256; colors.push(new Color(decode.shift(), decode.shift(), decode.shift())), i++);

        map.palette.setColors(colors);

        for (var z = 0, i = 0; z < sz; z++) {
            for (var y = 0; y < sy; y++) {
                for (var x = 0, v, xline = map.data[z][y]; x < sx; ((v = decode[i++]) != xline[x]) && map.setAt(x, y, z, v), x++);
            }
        }
    }

    getData() {
        var decode = this.data.RLDecode();
        var object = {};
        object.size = { x: decode.shift(), y: decode.shift(), z: decode.shift() };

        for (var i = 0, colors = []; i < 256; colors.push(new Color(decode.shift(), decode.shift(), decode.shift())), i++);
        object.colors = colors;

        var data = new Array3(object.size.x, object.size.y, object.size.z);
        for (var z = 0, i = 0; z < object.size.z; z++) {
            for (var y = 0; y < object.size.y; y++) {
                for (var x = 0; x < object.size.x; data[z][y][x] = decode[i++], x++);
            }
        }
        object.data = data;
        return object;
    }

    matrix() {
    }
}
