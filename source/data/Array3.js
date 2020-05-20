class Array3 extends Array {
    constructor(sx, sy, sz, add) {
        super();
        if (add) {
            for (var z = 0, yline, y, xline, x; z < sz; z++) {
                for (this.push(yline = []), y = 0; y < sy; y++)
                    for (yline.push(xline = []), x = 0; x < sx; xline.push(add(x, y, z)), x++);
            }
        }
        else {
            for (var z = sz, yline, y, xline; z > 0; --z)
                for (this.push(yline = []), y = sy; y > 0; yline.push(xline = new Array(sx)), --y);
        }
    }

    get sizex() { return this[0][0].length; }
    get sizey() { return this[0].length; }
    get sizez() { return this.length; }
    get size() { return { x: this[0][0].length, y: this[0].length, z: this.length } };

    getN6Flags(x, y, z) {
        var flags = 0b111111;
        (x == 0 ? null : this[z][y][x - 1]) && (flags ^= 1 << 0);
        (x == this.sizex - 1 ? null : this[z][y][x + 1]) && (flags ^= 1 << 1);
        (y == 0 ? null : this[z][y - 1][x]) && (flags ^= 1 << 2);
        (y == this.sizey - 1 ? null : this[z][y + 1][x]) && (flags ^= 1 << 3);
        (z == 0 ? null : this[z - 1][y][x]) && (flags ^= 1 << 4);
        (z == this.sizez - 1 ? null : this[z + 1][y][x]) && (flags ^= 1 << 5);
        return flags;
    }
    getNeighbor0(x, y, z) { return (x == 0 ? null : this[z][y][x - 1]); }
    getNeighbor1(x, y, z) { return (x == this.sizex - 1 ? null : this[z][y][x + 1]) }
    getNeighbor2(x, y, z) { return (y == 0 ? null : this[z][y - 1][x]) }
    getNeighbor3(x, y, z) { return (y == this.sizey - 1 ? null : this[z][y + 1][x]) }
    getNeighbor4(x, y, z) { return (z == 0 ? null : this[z - 1][y][x]) }
    getNeighbor5(x, y, z) { return (z == this.sizez - 1 ? null : this[z + 1][y][x]) }
    getNeighbor(x, y, z, index) { return this["getNeighbor" + index](x, y, z); }

    clone() {
        var array3 = new Array3(), nyline;
        for (var yline of this) {
            array3.push(nyline = []);
            for (var xline of yline)
                nyline.push(xline.slice());
        } return array3;
    }
    toArray() {
        for (var array = [], z = 0, s = this.size, y, x; z < s.z; array = array.concat.apply(array, this[z]), z++);
        return array;
    }
    copyFrom(array3) { this.forEach(function (x, y, z) { this[z][y][x] = array3[z][y][x] }.bind(this)); }
    forEach(func) { for (var z = 0, s = this.size, y, x; z < s.z; z++) { for (y = 0; y < s.y; y++) { for (x = 0; x < s.x; func(x, y, z), x++); } } }
    forEachO(func) {
        for (var v = { x: 0, y: 0, z: 0 }, s = this.size; v.z < s.z; v.z++) {
            for (v.y = 0; v.y < s.y; v.y++)
                for (v.x = 0; v.x < s.x; func(v), v.x++);
        }
    }
    forEvery(func) {
        for (var v = { x: 0, y: 0, z: this.size.z - 1 }, line; v.z >= 0; --v.z) {
            for (v.y = this.size.y - 1; v.y >= 0; --v.y)
                for (v.x = this.size.x - 1, line = this[v.z][v.y]; v.x >= 0; line[v.x] && func(v), --v.x);
        }
    }
    forEachArea(x1, y1, z1, x2, y2, z2, func) {
        for (var v = { x: 0, y: 0, z: z1 }; v.z < z2; v.z++) {
            for (v.y = y1; y < y2; v.y++)
                for (v.x = x1; x < x2; func(v), v.x++);
        }
    }
    forEveryArea(x1, y1, z1, x2, y2, z2, func) {
        for (var line, v = { x: 0, y: 0, z: z1 }; v.z < z2; v.z++) {
            for (v.y = y1; v.y < y2; v.y++)
                for (v.x = x1, line = this[v.z][v.y]; v.x < x2; line[v.x] && func(v), v.x++);
        }
    }
    where(func) {
        for (var v = { x: 0, y: 0, z: 0 }, items = [], s = this.size; v.z < s.z; v.z++) {
            for (v.y = 0; v.y < s.y; v.y++)
                for (v.x = 0; v.x < s.x; func(v) && items.push({ x: v.x, y: v.y, z: v.z }), v.x++);
        }
        return items;
    }
    sum(func) { for (var total = 0, z = 0, s = this.size, y, x; z < s.z; z++) { for (y = 0; y < s.y; y++) { for (x = 0; x < s.x; total += func(this[z][y][x]), x++); } } return total; }
    resize(newx, newy, newz, remove, add) {
        var oldx = this.sizex, oldy = this.sizey, oldz = this.sizez;

        // shrink
        while (oldz > newz) {
            oldz--;
            if (remove) { for (var y = 0; y < oldy; y++) { for (var x = 0; x < oldx; remove(x, y, oldz), x++); } }
            this.pop();
        }
        while (oldy > newy) {
            oldy--;
            for (var z = 0; z < oldz; z++) {
                if (remove) for (var x = 0; x < oldx; remove(x, oldy, z), x++);
                this[z].pop();
            }
        }
        for (; oldx > newx; oldx = newx) {
            for (var z = 0; z < oldz; z++) {
                for (var y = 0; y < oldy; y++) {
                    if (remove) for (var x = newx; x < oldx; remove(x, y, z), x++);
                    this[z][y].length = newx;
                }
            }
        }

        // grow
        var xline, yline;
        for (; oldz < newz; oldz++) {
            this.push(yline = []);
            for (var y = 0, z = oldz; y < oldy; y++) {
                yline.push(new Array(oldx))
                if (add) for (var x = 0; x < oldx; this[z][y][x] = add(x, y, z), x++);
            }
        }
        for (; oldy < newy; oldy++) {
            for (var z = 0, y = oldy, yline; z < oldz; z++) {
                this[z].push(new Array(oldx));
                if (add) for (var x = 0; x < oldx; this[z][y][x] = add(x, y, z), x++);
            }
        }
        for (; oldx < newx; oldx = newx) {
            for (var z = 0; z < oldz; z++) {
                for (var y = 0; y < oldy; y++) {
                    this[z][y].length = newx;
                    if (add) for (var x = oldx; x < newx; this[z][y][x] = add(x, y, z), x++);
                }
            }
        }
    }
}

// class Array3Area {
//     constructor(x1, y1, z1, x2, y2, z2) {
//         this.x1 = x1; this.y1 = y1; this.z1 = z1;
//         this.x2 = x2; this.y2 = y2; this.z2 = z2;
//     }

//     getMinEdgeX() {        

//     }
// }