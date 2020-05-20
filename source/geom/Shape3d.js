class Shape3d {
    constructor() {
        this.data = new StaticDictionary();
        // { x: x, y: y, z: z, key: key, color: color }
    }

    get points() { return this.data.values.slice(); }
    get extents() {
        var first = this.points[0];
        var min = { x: first.x, y: first.y, z: first.z }, max = { x: first.x, y: first.y, z: first.z };
        for (var point of this.points) {
            if (point.x < min.x) min.x = point.x; else if (point.x > max.x) max.x = point.x;
            if (point.y < min.y) min.y = point.y; else if (point.y > max.y) max.y = point.y;
            if (point.z < min.z) min.z = point.z; else if (point.z > max.z) max.z = point.z;
        }
        return new Rect3(min.x, min.y, min.z, max.x - min.x + 1, max.y - min.y + 1, max.z - min.z + 1);
    }

    get size() {
        if (!this._size) {
            var extents = this.extents;
            this._size = { x: extents.sizex, y: extents.sizey, z: extents.sizez };
        }
        return this._size;
    }

    add(p) {
        this.data.add(p.key = this.key(p), p);
        this._size = null;
    }

    drawShape(brush, color) {
        var points = this.points;
        var pbrush = brush.points;
        for (var p1 of points) {
            for (var p2 of pbrush) {
                var x = p1.x + p2.x, y = p1.y + p2.y, z = p1.z + p2.z;
                var key = x + "_" + y + "_" + z;
                if (!this.data[key]) {
                    var p = { x: x, y: y, z: z, color: color, key: key };
                    this.data.add(p);
                }
            }
        }
    }

    key(p) { return p.x + "_" + p.y + "_" + p.z; }

    static lineWidth(x1, y1, z1, x2, y2, z2, color, thickness) {
        var shape = Shape3d.line(x1, y1, z1, x2, y2, z2, color);
        if (thickness > 1) {
            var nt = -Math.floor(thickness / 2);
            var pt = (thickness + nt) - 1;
            var brush = Shape3d.ellipse(nt, nt, nt, pt, pt, pt, thickness);
            shape.drawShape(brush, color);
        }
        return shape;
    }

    static line(x1, y1, z1, x2, y2, z2, color) {
        var shape = new Shape3d();
        var dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
        var ax = Math.abs(dx) << 1, ay = Math.abs(dy) << 1, az = Math.abs(dz) << 1;
        var sx = Math.sign(dx), sy = Math.sign(dy), sz = Math.sign(dz);
        var x = x1, y = y1, z = z1;
        if (ax >= Math.max(ay, az)) {
            var yd = ay - (ax >> 1), zd = az - (ax >> 1);
            while (true) {
                shape.add({ x: x, y: y, z: z, color: color });
                if (x == x2) break;
                if (yd >= 0) { y += sy; yd -= ax; }
                if (zd >= 0) { z += sz; zd -= ax; }
                x += sx; yd += ay; zd += az;
            }
        }
        else if (ay >= Math.max(ax, az)) {
            var xd = ax - (ay >> 1), zd = az - (ay >> 1);
            while (true) {
                shape.add({ x: x, y: y, z: z, color: color });
                if (y == y2) { break; }
                if (xd >= 0) { x += sx; xd -= ay; }
                if (zd >= 0) { z += sz; zd -= ay; }
                y += sy; xd += ax; zd += az;
            }
        }
        else if (az >= Math.max(ax, ay)) {
            var xd = ax - (az >> 1), yd = ay - (az >> 1);
            while (true) {
                shape.add({ x: x, y: y, z: z, color: color });
                if (z == z2) { break; }
                if (xd >= 0) { x += sx; xd -= az; }
                if (yd >= 0) { y += sy; yd -= az; }
                z += sz; xd += ax; yd += ay;
            }
        }
        return shape;
    }

    static ellipse(x1, y1, z1, x2, y2, z2, color) {
        var shape = new Shape3d(), s;
        if (x1 > x2) { s = x1; x1 = x2; x2 = s; }
        if (y1 > y2) { s = y1; y1 = y2; y2 = s; }
        if (z1 > z2) { s = z1; z1 = z2; z2 = s; }
        var rx = ((x2) - x1) / 2, ry = ((y2) - y1) / 2, rz = ((z2) - z1) / 2;
        var cx = x1 + rx, cy = y1 + ry, cz = z1 + rz;
        rx++; ry++; rz++;
        for (var z = z1; z <= z2; z++) {
            for (var y = y1; y <= y2; y++) {
                for (var x = x1; x <= x2; x++) {
                    var ux = (x - cx) / rx, uy = (y - cy) / ry, uz = (z - cz) / rz;
                    var d = ux * ux + uy * uy + uz * uz;
                    d <= 1 && shape.add({ x: x, y: y, z: z, color: color });
                }
            }
        }
        return shape;
    }

    static cube(x1, y1, z1, x2, y2, z2, color) {
        var shape = new Shape3d(), s, points = [];
        if (x1 > x2) { s = x1; x1 = x2; x2 = s; }
        if (y1 > y2) { s = y1; y1 = y2; y2 = s; }
        if (z1 > z2) { s = z1; z1 = z2; z2 = s; }
        for (var x = x1; x <= x2; x++) {
            for (var y = y1; y <= y2; y++) {
                for (var z = z1; z <= z2; z++) {
                    var p = { x: x, y: y, z: z, key: x + "_" + y + "_" + z, color: color }
                    shape.data.add(p.key, p);
                }
            }
        }
        return shape;
    }

    static cubeOutline(x1, y1, z1, x2, y2, z2, color) {
        var shape = new Shape3d(), s, points = [], x, y, z, p;
        if (x1 > x2) { s = x1; x1 = x2; x2 = s; }
        if (y1 > y2) { s = y1; y1 = y2; y2 = s; }
        if (z1 > z2) { s = z1; z1 = z2; z2 = s; }
        for (x = x1; x <= x2; x++) {
            for (y = y1; y <= y2; y++) {
                var p = { x: x, y: y, z: z1, key: x + "_" + y + "_" + z1, color: color }
                shape.data.add(p.key, p);
                var p = { x: x, y: y, z: z2, key: x + "_" + y + "_" + z2, color: color }
                shape.data.add(p.key, p);
            }
        }
        for (x = x1; x <= x2; x++) {
            for (z = z1; z <= z2; z++) {
                var p = { x: x, y: y1, z: z, key: x + "_" + y1 + "_" + z, color: color }
                shape.data.add(p.key, p);
                var p = { x: x, y: y2, z: z, key: x + "_" + y2 + "_" + z, color: color }
                shape.data.add(p.key, p);
            }
        }
        for (y = y1; y <= y2; y++) {
            for (z = z1; z <= z2; z++) {
                var p = { x: x1, y: y, z: z, key: x1 + "_" + y + "_" + z, color: color }
                shape.data.add(p.key, p);
                var p = { x: x2, y: y, z: z, key: x2 + "_" + y + "_" + z, color: color }
                shape.data.add(p.key, p);
            }
        }
        return shape;
    }
}
