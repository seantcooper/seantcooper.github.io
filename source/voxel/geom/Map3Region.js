//==============================================================================================================================================================================
class Map3Regions {
    constructor(map) {
        this.map = map;
        this.data = new Array3(this.sizex, this.sizey, this.sizez, this.add.bind(this));
        this.damage = [];
    }
    resize() {
        var size = this.setSize;
        this.data.resize(this.sizex, this.sizey, this.sizez, this.dispose.bind(this), this.add.bind(this));
        this.data.forEvery(function (r) { this.data[r.z][r.y][r.x].resize(); }.bind(this));
        this.damage = [];
    }
    update() {
        if (this.damage.length) {
            for (var i = this.damage.length - 1, damage = this.damage.slice(); i >= 0; damage[i].validate(), --i);
            for (var i = this.damage.length - 1, damage = this.damage; i >= 0; damage[i].update(), --i);
            for (var i = this.damage.length - 1, damage = this.damage.slice(); i >= 0; damage[i].prettify(), --i);
            for (var i = this.damage.length - 1, damage = this.damage; i >= 0; this.map.mesh.updateRegion(damage[i]), --i);
            this.damage.length = 0;
        }
    }

    damageAt(mx, my, mz) { this.data[mz >> VX_REGION_SHIFT][my >> VX_REGION_SHIFT][mx >> VX_REGION_SHIFT].setDamage(); }

    getAt(mx, my, mz) { return this.data[mz >> VX_REGION_SHIFT][my >> VX_REGION_SHIFT][mx >> VX_REGION_SHIFT]; }
    get sizex() { return Math.ceil(this.map.size.x * VX_REGION_SCALE); }
    get sizey() { return Math.ceil(this.map.size.y * VX_REGION_SCALE); }
    get sizez() { return Math.ceil(this.map.size.z * VX_REGION_SCALE); }
    add(x, y, z) { return new Map3Region(this.map, x, y, z, VX_REGION_SIZE); }
    dispose(x, y, z) { return this.data[z][y][x].dispose(); }
}

//==============================================================================================================================================================================
var Map3RegionID = 0;
class Map3Region {
    constructor(map, x, y, z, size) {
        this.id = ++Map3RegionID;
        this.index = new Vertex(x, y, z);
        this.position = new Vertex(x * VX_REGION_SIZE, y * VX_REGION_SIZE, z * VX_REGION_SIZE);
        this.map = map;
        this.size = size;
        this.faces = [];
        this.resize();
        this.damage = false;
    }
    setDamage() {
        if (!this.damage) {
            this.damage = true;
            this.map.regions.damage.push(this);
        }
    }
    get neighbors() {
        if (!this._neighbors) {
            var x = this.index.x, y = this.index.y, z = this.index.z;
            this._neighbors = [
                (x == 0 ? null : this.map.regions.data[z][y][x - 1]),
                (x == this.map.size.x - 1 ? null : this.map.regions.data[z][y][x + 1]),
                (y == 0 ? null : this.map.regions.data[z][y - 1][x]),
                (y == this.map.size.y - 1 ? null : this.map.regions.data[z][y + 1][x]),
                (z == 0 ? null : this.map.regions.data[z - 1][y][x]),
                (z == this.map.size.z - 1 ? null : this.map.regions.data[z + 1][y][x])
            ];
        }
        return this._neighbors;
    }
    dispose() {
        this.disposed = true;
        this.map.mesh.disposeGLRegion(this);
        //trace("Map3Region::dispose", this.position.toString());
    }
    resize() {
        var a = this.area = { x1: this.position.x, y1: this.position.y, z1: this.position.z }, size = this.map.size;
        a.x2 = Math.min(a.x1 + this.size, size.x); a.y2 = Math.min(a.y1 + this.size, size.y); a.z2 = Math.min(a.z1 + this.size, size.z);
        this.area.edge = (a.x1 == 0 || a.y1 == 0 || a.z1 == 0 || a.x2 == this.map.size.x || a.y2 == this.map.size.y || a.z2 == this.map.size.z);
        delete this.damage;
    }
    prettify() {
        for (var z = this.area.z1; z < this.area.z2; z++) {
            for (var y = this.area.y1; y < this.area.y2; y++) {
                for (var x = this.area.x1, pline = this.map.pretty[z][y]; x < this.area.x2; x++) {
                    if (pline[x]) {
                        pline[x] = 0;
                        for (var offset of VX_ALL_NEIGHBORS) {
                            var ix = x + offset.x, iy = y + offset.y, iz = z + offset.z, node;
                            if (!this.area.edge || (ix >= 0 && iy >= 0 && iz >= 0 && ix < this.map.size.x && iy < this.map.size.y && iz < this.map.size.z)) {
                                if ((node = this.map.nodes[iz][iy][ix]) && node.shadingID != this.map.tick) {
                                    node.prettify();
                                    node.shadingID = this.map.tick;
                                    node.region.setDamage();
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    validate() {
        var neighbors = MapNeighbor3.getNeighborDeltas6();
        var sx = this.map.size.x - 1, sy = this.map.size.y - 1, sz = this.map.size.z - 1;
        for (var z = this.area.z1; z < this.area.z2; z++) {
            for (var y = this.area.y1; y < this.area.y2; y++) {
                for (var x = this.area.x1, dline = this.map.damage[z][y]; x < this.area.x2; x++) {
                    if (dline[x] == 2) {
                        if (x > 0 && !dline[x - 1]) this.map.damageAt(x - 1, y, z, 1);
                        if (x < sx && !dline[x + 1]) this.map.damageAt(x + 1, y, z, 1);
                        if (y > 0 && !this.map.damage[z][y - 1][x]) this.map.damageAt(x, y - 1, z, 1);
                        if (y < sy && !this.map.damage[z][y + 1][x]) this.map.damageAt(x, y + 1, z, 1);
                        if (z > 0 && !this.map.damage[z - 1][y][x]) this.map.damageAt(x, y, z - 1, 1);
                        if (z < sz && !this.map.damage[z + 1][y][x]) this.map.damageAt(x, y, z + 1, 1);
                    }
                }
            }
        }
    }
    update() {
        this.faces = [];
        var first = true, map = this.map;
        for (var z = this.area.z1; z < this.area.z2; z++) {
            for (var y = this.area.y1; y < this.area.y2; y++) {
                var nline = map.nodes[z][y], dline = map.damage[z][y], cline = map.data[z][y], sline = map.edit.selection[z][y];
                for (var x = this.area.x1; x < this.area.x2; x++) {
                    var damage = dline[x], node = nline[x], remove = false;
                    if (damage) {
                        dline[x] = 0;
                        var n6 = map.neighbor.getN6Flags(x, y, z);
                        if (n6 == 0) {
                            remove = true;
                        }
                        else {
                            if (cline[x]) {
                                node ? node.color = cline[x] : nline[x] = node = new Map3Node(map, x, y, z, cline[x]);
                                node.update(n6) && (map.pretty[z][y][x] = 1);
                            }
                            else {
                                remove = true;
                            }
                        }
                    }
                    if (node) {
                        if (remove) {
                            map.pretty[z][y][x] = 1;
                            node.dispose();
                            nline[x] = null;
                        }
                        else {
                            node.selected = sline[x];
                            this.faces.push.apply(this.faces, node.faces);
                        }
                    }
                }
            }
        }
    }
}
