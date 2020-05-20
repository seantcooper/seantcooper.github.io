//------------------------------------------------------------------------------------------------------------------------------------------------------
class Map3Shape {
    constructor(sizex, sizey, sizez) {
        this.size = { x: sizex, y: sizey, z: sizez };
        this.data = new Array3(sizex, sizey, sizez);
        this._points = [];
    }

    static fromMap(map) {
        var shape = new Map3Shape(map.size.x, map.size.y, map.size.z);
        shape.data = map.data.clone();
        shape._points = null;
        return shape;
    }

    static fromSelection(map) {
        var shape = new Map3Shape(map.size.x, map.size.y, map.size.z);
        map.edit.selection.forEvery(function (p) { shape.data[p.z][p.y][p.x] = map.data[p.z][p.y][p.x]; });
        shape._points = null;
        return shape;
    }

    get points() {
        if (!this._points) {
            var pts = [], data = this.data;
            data.forEvery(function (p) { pts.push([p.x, p.y, p.z, data[p.z][p.y][p.x]]) });
            this._points = pts;
        }
        return this._points;
    }

    crop() {
        var extents = this.getExtents()
        if (extents) {
            var shape = new Map3Shape(extents.max.x - extents.min.x, extents.max.y - extents.min.y, extents.max.z - extents.min.z);
            this.data.forEveryArea(extents.min.x, extents.min.y, extents.min.z, extents.max.x, extents.max.y, extents.max.z, function (p) {
                shape.data[p.z - extents.min.z][p.y - extents.min.y][p.x - extents.min.x] = this.data[p.z][p.y][p.x];
            }.bind(this));
            shape._points = null;
            shape.cropExtents = extents;
            return shape;
        }
    }

    getExtents() {
        var min = { x: this.size.x, y: this.size.y, z: this.size.z };
        var max = { x: 0, y: 0, z: 0 };
        this.data.forEvery(function (p) {
            if (p.x < min.x) min.x = p.x; if (p.x > max.x) max.x = p.x;
            if (p.y < min.y) min.y = p.y; if (p.y > max.y) max.y = p.y;
            if (p.z < min.z) min.z = p.z; if (p.z > max.z) max.z = p.z;
        });
        max.x++; max.y++; max.z++;
        if (min.x >= max.x || min.y >= max.y || min.z >= max.z) return;
        return { min: min, max: max };
    }

    // static fromData(data) {
    //     if (data) {
    //         var _in = data;
    //         !Array.isArray(data) && (data = data.split(",").select(function (s) { return Number(s) }));
    //         var shape = new VXShape({ x: data.shift(), y: data.shift(), z: data.shift() });
    //         data[0] ? shape.palette = Palette.fromData(data) : data.shift();
    //         while (data.length) shape.add(data.shift(), data.shift(), data.shift(), data.shift());
    //         return shape;
    //     }
    // }
    // toData() {
    //     var output = [this.size.x, this.size.y, this.size.z];
    //     this.palette ? output.push(this.palette.toData()) : output.push(0);
    //     for (var point of this._points) output.push(point.x, point.y, point.z, point.color);
    //     return output.join(",");
    // }

    add(x, y, z, color) {
        if (!this.data[z][y][x]) {
            this._points.push([x, y, z, color]);
            this.data[z][y][x] = color;
        }
    }
    addBound(x, y, z, color) { this.inBounds(x, y, z) && this.add(x, y, z, color); }
    inBounds(x, y, z) { return (x >= 0 && y >= 0 && z >= 0 && x < this.size.x && y < this.size.y && z < this.size.z); }

    mirror(mirror) {
        var sx = this.size.x - 1, sy = this.size.y - 1, sz = this.size.z - 1;
        if (mirror.x) { for (var p of this._points) { this.add(sx - p[0], p[1], p[2], p[3]); } }
        if (mirror.y) { for (var p of this._points) { this.add(p[0], sy - p[1], p[2], p[3]); } }
        if (mirror.z) { for (var p of this._points) { this.add(p[0], p[1], sz - p[2], p[3]); } }
    }
    iterateCube(x1, y1, z1, x2, y2, z2, func) {
        // min / max coords
        if (x1 > x2) { var s = x1; x1 = x2; x2 = s; }
        if (y1 > y2) { var s = y1; y1 = y2; y2 = s; }
        if (z1 > z2) { var s = z1; z1 = z2; z2 = s; }

        // clip
        if (x2 < 0 || y2 < 0 || z2 < 0 || x1 >= this.size.x || y1 >= this.size.y || z1 >= this.size.z) return;
        if (x1 < 0) x1 = 0; if (x2 >= this.size.x) x2 = this.size.x - 1;
        if (y1 < 0) y1 = 0; if (y2 >= this.size.y) y2 = this.size.y - 1;
        if (z1 < 0) z1 = 0; if (z2 >= this.size.z) z2 = this.size.z - 1;

        for (var x = x1; x <= x2; x++) {
            for (var y = y1; y <= y2; y++) {
                for (var z = z1; z <= z2; func(x, y, z), z++);
            }
        }
    }
    setCube(x1, y1, z1, x2, y2, z2, color) {
        // min / max coords
        if (x1 > x2) { var s = x1; x1 = x2; x2 = s; }
        if (y1 > y2) { var s = y1; y1 = y2; y2 = s; }
        if (z1 > z2) { var s = z1; z1 = z2; z2 = s; }

        // clip
        if (x2 < 0 || y2 < 0 || z2 < 0 || x1 >= this.size.x || y1 >= this.size.y || z1 >= this.size.z) return;
        if (x1 < 0) x1 = 0; if (x2 >= this.size.x) x2 = this.size.x - 1;
        if (y1 < 0) y1 = 0; if (y2 >= this.size.y) y2 = this.size.y - 1;
        if (z1 < 0) z1 = 0; if (z2 >= this.size.z) z2 = this.size.z - 1;

        for (var z = z1; z <= z2; z++) {
            for (var y = y1; y <= y2; y++) {
                for (var x = x1, xline = this.data[z][y]; x <= x2; x++) {
                    if (!xline[x]) {
                        this._points.push([x, y, z, color]);
                        xline[x] = color;
                    }
                }
            }
        }
    }

    drawShape(shape, x, y, z) { for (var p of shape.points) this.addBound(p[0] + x, p[1] + y, p[2] + z, p[3]); }
    drawCube(x1, y1, z1, x2, y2, z2, color) {
        this.setCube(x1, y1, z1, x2, y2, z2, color);
    }
    drawEllipse(x1, y1, z1, x2, y2, z2, color) {
        var rx = Math.abs(x2 - x1) / 2, ry = Math.abs(y2 - y1) / 2, rz = Math.abs(z2 - z1) / 2;
        var cx = Math.min(x1, x2) + rx, cy = Math.min(y1, y2) + ry, cz = Math.min(z1, z2) + rz;
        rx++; ry++; rz++;
        this.iterateCube(x1, y1, z1, x2, y2, z2, function (x, y, z) {
            var ux = (x - cx) / rx, uy = (y - cy) / ry, uz = (z - cz) / rz;
            var d = ux * ux + uy * uy + uz * uz;
            d <= 1 && this.add(x, y, z, color);
        }.bind(this));
    }

    drawLine(x1, y1, z1, x2, y2, z2, color, thickness) {
        var dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
        var ax = Math.abs(dx) << 1, ay = Math.abs(dy) << 1, az = Math.abs(dz) << 1;
        var sx = Math.sign(dx), sy = Math.sign(dy), sz = Math.sign(dz);
        var x = x1, y = y1, z = z1;

        if (thickness > 1) {
            var brush = new Map3Shape(thickness, thickness, thickness)
            brush.drawEllipse(0, 0, 0, thickness - 1, thickness - 1, thickness - 1, color);
            var nt = -Math.floor(thickness / 2);
        }

        var add = function (x, y, z) {
            if (thickness > 1) {
                brush.data.forEach(function (px, py, pz) { this.addBound(x + px + nt, y + py + nt, z + pz + nt, color); }.bind(this));
            } else {
                this.addBound(x, y, z, color);
            }
        }.bind(this);

        if (ax >= Math.max(ay, az)) {
            var yd = ay - (ax >> 1), zd = az - (ax >> 1);
            while (true) {
                add(x, y, z);
                if (x == x2) break;
                if (yd >= 0) { y += sy; yd -= ax; }
                if (zd >= 0) { z += sz; zd -= ax; }
                x += sx; yd += ay; zd += az;
            }
        }
        else if (ay >= Math.max(ax, az)) {
            var xd = ax - (ay >> 1), zd = az - (ay >> 1);
            while (true) {
                add(x, y, z);
                if (y == y2) { break; }
                if (xd >= 0) { x += sx; xd -= ay; }
                if (zd >= 0) { z += sz; zd -= ay; }
                y += sy; xd += ax; zd += az;
            }
        }
        else if (az >= Math.max(ax, ay)) {
            var xd = ax - (az >> 1), yd = ay - (az >> 1);
            while (true) {
                add(x, y, z);
                if (z == z2) { break; }
                if (xd >= 0) { x += sx; xd -= az; }
                if (yd >= 0) { y += sy; yd -= az; }
                z += sz; xd += ax; yd += ay;
            }
        }
    }

    drawToMap(map) {
        for (var z = this.size.z - 1; z >= 0; --z) {
            for (var y = this.size.y - 1; y >= 0; --y) {
                for (var x = this.size.x - 1, scolor, sline = this.data[z][y], dline = map.data[z][y]; x >= 0; --x)
                    (scolor = sline[x]) ? map.setAt(x, y, z, scolor) : (dline[x] && map.clearAt(x, y, z));
            }
        }
    }

    // mode = {draw:true, attach:true, copyetc.}
    // mode.draw = change value
    // mode.attach  = add value
    // mode.copy =???? 
    pasteToMap(map, mode) {
        for (var point of this.points) {
            var x = point[0], y = point[1], z = point[2], color = point[3];
            var current = map.data[z][y][x];
            if (current != color) {
                if (current) {
                    mode.draw && map.setAt(x, y, z, color);
                } else {
                    mode.attach && color && current != color && map.setAt(x, y, z, color);
                }
            }
        }
    }
    updateMap(map, mode, memory) {
        var icolor, dcolor, scolor;
        !memory ? memory = { data: Map3Shape.fromMap(map).data, markers: new Array3(map.size.x, map.size.y, map.size.z), damage: [], id: 1 } : memory.id++;
        var add = [], x, y, z;
        for (var p of this.points) {
            var color = p[3], current = map.data[z = p[2]][y = p[1]][x = p[0]];
            if (current != color) {
                if (current) { mode.draw && map.setAt(x, y, z, color); } else { mode.attach && color && current != color && map.setAt(x, y, z, color); }
            }
            memory.markers[z][y][x] = memory.id;
        }
        for (var p of memory.damage) {
            if (memory.markers[z = p[2]][y = p[1]][x = p[0]] != memory.id) {
                var color = memory.data[z][y][x], current = map.data[z][y][x];
                color ? (current != color && map.setAt(x, y, z, color)) : (current && map.clearAt(x, y, z));
            }
        }
        memory.damage = this.points.slice();
        return memory;
    }

    selectToMap(map) {
        for (var point of this.points) {
            map.edit.selectAt(point[0], point[1], point[2], point[3]);
        }
    }
    updateSelection(map, memory) {
        !memory ? (memory = { data: Map3Shape.fromSelection(map).data, markers: new Array3(map.size.x, map.size.y, map.size.z), id: 1, points: [] }) : memory.id++;
        var x, y, z, selects = 0, deselects = 0;
        for (var p of this.points) {
            !map.edit.selection[z = p[2]][y = p[1]][x = p[0]] && map.edit.selectAt(x, y, z);
            memory.markers[z][y][x] = memory.id;
        }
        for (var p of memory.points) {
            if (memory.markers[z = p[2]][y = p[1]][x = p[0]] != memory.id) {
                var selected = memory.data[z][y][x], current = map.edit.selection[z][y][x];
                selected ? (current != selected && map.edit.selectAt(x, y, z)) : (current && map.edit.deselectAt(x, y, z));
                memory.markers[z][y][x] = null;
            }
        }
        memory.points = this.points.slice();
        return memory;
    }

    fill3d(x, y, z, color) {
        var floodfill = new FloodFill(this);
        floodfill.fill3d(x, y, z, color);
    }

    fill2d(x, y, z, color, normal) {
        var floodfill = new FloodFill(this);
        floodfill.fill2d(x, y, z, color, normal);
    }

    getPullPlane(x, y, z, normal) {
        var floodfill = new FloodFill(this);
        floodfill.fill2dPull(x, y, z, normal);

    }

    movePullPlane(map, normal, offset) {
        if (offset) {
            var color, p, i, j, index = new Vector3(), planes = [], ix, iy, iz;
            if (offset < 0) {
                for (i = 0; i > offset; --i) {
                    var plane = [], nx = normal.x * i, ny = normal.y * i, nz = normal.z * i, first = this.points[0];
                    if (!map.inBounds(first[0] + nx, first[1] + ny, first[2] + nz)) break;
                    for (p of this.points)
                        ((color = map.data[iz = p[2] + nz][iy = p[1] + ny][ix = p[0] + nx]) && color == p[3]) && plane.push([ix, iy, iz, p[3]]);
                    if (plane.length == this.points.length) planes.push(plane); else break;
                }
                for (plane of planes) { plane.forEach(function (p) { map.clearAt(p[0], p[1], p[2]); }); }
            }
            else {
                for (i = 1; i <= offset; i++) {
                    var plane = [], nx = normal.x * i, ny = normal.y * i, nz = normal.z * i, first = this.points[0];
                    if (!map.inBounds(first[0] + nx, first[1] + ny, first[2] + nz)) break;
                    for (p of this.points)
                        (!map.data[iz = p[2] + nz][iy = p[1] + ny][ix = p[0] + nx]) && plane.push([ix, iy, iz, p[3]]);
                    if (plane.length == this.points.length) planes.push(plane); else break;
                }
                for (plane of planes) { plane.forEach(function (p) { map.setAt(p[0], p[1], p[2], p[3]); }); }
            }

            if (planes.length) {
                var d = Math.sign(offset) * planes.length, nx = normal.x * d, ny = normal.y * d, nz = normal.z * d;
                for (p of this.points) { p[0] += nx; p[1] += ny; p[2] += nz; }
                return d;
            }
        }
        return 0;
    }

    move(axis, direction) {
        this._points = null;
        switch (axis) {
            case "x":
                for (var z = this.size.z - 1; z >= 0; --z) {
                    for (var y = this.size.y - 1; y >= 0; --y) {
                        var s = this.size.x, line = this.data[z][y];
                        direction < 0 ? line.push.apply(line, line.splice(0, -direction)) : line.unshift.apply(line, line.splice(s - direction, direction));
                    }
                }
                break;
            case "y":
                for (var z = this.size.z - 1; z >= 0; --z) {
                    var s = this.size.y, line = this.data[z];
                    direction < 0 ? line.push.apply(line, line.splice(0, -direction)) : line.unshift.apply(line, line.splice(s - direction, direction));
                }
                break;
            case "z":
                var s = this.size.z, line = this.data;
                direction < 0 ? line.push.apply(line, line.splice(0, -direction)) : line.unshift.apply(line, line.splice(s - direction, direction));
                break;
        }
    }
    rotate(axis, direction) {
        this._points = null;
        var r = direction < 0 ? -(Math.PI / 2) : (Math.PI / 2);
        var sin = Math.sin(r), cos = Math.cos(r);
        var ox = (this.size.x - 1) / 2, oy = (this.size.y - 1) / 2, oz = (this.size.z - 1) / 2;
        switch (axis) {
            case "x":
                var data = new Array3(this.size.x, this.size.z, this.size.y);
                var dx = (data.sizex - 1) / 2, dy = (data.sizey - 1) / 2, dz = (data.sizez - 1) / 2;
                this.data.forEvery(function (p) {
                    var y = p.y - oy, z = p.z - oz;
                    data[Math.round((z * cos - y * sin) + dz)][Math.round((y * cos + z * sin) + dy)][p.x] = this.data[p.z][p.y][[p.x]];
                }.bind(this));
                break;
            case "y":
                var data = new Array3(this.size.z, this.size.y, this.size.x);
                var dx = (data.sizex - 1) / 2, dy = (data.sizey - 1) / 2, dz = (data.sizez - 1) / 2;
                this.data.forEvery(function (p) {
                    var x = p.x - ox, z = p.z - oz;
                    data[Math.round((z * cos - x * sin) + dz)][p.y][Math.round((x * cos + z * sin) + dx)] = this.data[p.z][p.y][[p.x]];
                }.bind(this));
                break;
            case "z":
                var data = new Array3(this.size.y, this.size.x, this.size.z);
                var dx = (data.sizex - 1) / 2, dy = (data.sizey - 1) / 2, dz = (data.sizez - 1) / 2;
                this.data.forEvery(function (p) {
                    var x = p.x - ox, y = p.y - oy;
                    data[p.z][Math.round((y * cos - x * sin) + dy)][Math.round((x * cos + y * sin) + dx)] = this.data[p.z][p.y][[p.x]];
                }.bind(this));
                break;
        }
        this.data = data;
        this.size = data.size;
    }
    flip(axis) {
        this._points = null;
        switch (axis) {
            case "x":
                for (var z = this.size.z - 1; z >= 0; --z)
                    for (var y = this.size.y - 1; y >= 0; this.data[z][y] = this.data[z][y].reverse(), --y);
                break;
            case "y":
                for (var z = this.size.z - 1; z >= 0; this.data[z] = this.data[z].reverse(), --z);
            case "z":
                this.data = this.data.reverse();
                break;
        }
    }
}

//------------------------------------------------------------------------------------------------------------------------------------------------------
class FloodFill {
    constructor(shape) {
        this.shape = shape;
        this.shape._points = [];
    }

    add(x, y, z, color) {
        if (this.start != this.shape.data[z][y][x]) return false;
        this.shape.data[z][y][x] = color;
        var p = [x, y, z, color];
        this.shape._points.push(p);
        this.memory.push(p);
        return true;
    }

    fill3d(x, y, z, color) {
        if (!this.shape.inBounds(x, y, z)) return;
        var sx = this.shape.size.x - 1, sy = this.shape.size.y - 1, sz = this.shape.size.z - 1, ix, iy, iz;
        this.start = this.shape.data[z][y][x];
        if (this.start == color) return;
        this.memory = [];
        this.add(x, y, z, color);
        while (this.memory.length) {
            var p = this.memory.pop();
            x = p[0]; y = p[1]; z = p[2];
            for (ix = x; ix > 0 && this.add(--ix, y, z, color);); for (ix = x; ix < sx && this.add(++ix, y, z, color););
            for (iy = y; iy > 0 && this.add(x, --iy, z, color);); for (iy = y; iy < sy && this.add(x, ++iy, z, color););
            for (iz = z; iz > 0 && this.add(x, y, --iz, color);); for (iz = z; iz < sz && this.add(x, y, ++iz, color););
        }
    }

    _fill2d(x, y, z, color, addx, addy, addz) {
        if (!this.shape.inBounds(x, y, z)) return;
        var sx = this.shape.size.x - 1, sy = this.shape.size.y - 1, sz = this.shape.size.z - 1, ix, iy, iz;
        this.start = this.shape.data[z][y][x];
        if (this.start == color) return;
        this.memory = [];
        this.add(x, y, z, color);
        if (this.normal.x) {
            while (this.memory.length) {
                var p = this.memory.pop(); x = p[0]; y = p[1]; z = p[2];
                for (iy = y; iy > 0 && addx(x, --iy, z, color);); for (iy = y; iy < sy && addx(x, ++iy, z, color););
                for (iz = z; iz > 0 && addx(x, y, --iz, color);); for (iz = z; iz < sz && addx(x, y, ++iz, color););
            }
        }
        else if (this.normal.y) {
            while (this.memory.length) {
                var p = this.memory.pop(); x = p[0]; y = p[1]; z = p[2];
                for (ix = x; ix > 0 && addy(--ix, y, z, color);); for (ix = x; ix < sx && addy(++ix, y, z, color););
                for (iz = z; iz > 0 && addy(x, y, --iz, color);); for (iz = z; iz < sz && addy(x, y, ++iz, color););
            }
        }
        else if (this.normal.z) {
            while (this.memory.length) {
                var p = this.memory.pop(); x = p[0]; y = p[1]; z = p[2];
                for (ix = x; ix > 0 && addz(--ix, y, z, color);); for (ix = x; ix < sx && addz(++ix, y, z, color););
                for (iy = y; iy > 0 && addz(x, --iy, z, color);); for (iy = y; iy < sy && addz(x, ++iy, z, color););
            }
        }
    }

    addx(x, y, z, color) { var ix = x + this.normal.x; return (ix < 0 || ix >= this.shape.size.x || !this.shape.data[z][y][ix]) && this.add(x, y, z, color); }
    addy(x, y, z, color) { var iy = y + this.normal.y; return (iy < 0 || iy >= this.shape.size.y || !this.shape.data[z][iy][x]) && this.add(x, y, z, color); }
    addz(x, y, z, color) { var iz = z + this.normal.z; return (iz < 0 || iz >= this.shape.size.z || !this.shape.data[iz][y][x]) && this.add(x, y, z, color); }

    fill2d(x, y, z, color, normal) {
        this.normal = normal;
        this._fill2d(x, y, z, color, this.addx.bind(this), this.addy.bind(this), this.addz.bind(this));
    }


    fill2dPull(x, y, z, normal) {
        if (!this.shape.inBounds(x, y, z)) return;
        var color = this.shape.data[z][y][x];
        this.normal = normal;
        this._fill2d(x, y, z, color != 255 ? color + 1 : 1, this.addx.bind(this), this.addy.bind(this), this.addz.bind(this));
        this.shape._points.forEach(function (p) { p[3] = color; });
    }
}
//------------------------------------------------------------------------------------------------------------------------------------------------------