class Object3 {
    constructor(sizex, sizey, sizez) {
        this._size = { x: sizex, y: sizey, z: sizez };
        this._count = 0;
    }
    get size() { return this._size; }
    get count() { return this._count; }

    clone() {
        //Object.assign
    }

    resize(sizex, sizey, sizez) {
        this._size = { x: sizex, y: sizey, z: sizez };
        not_implemented
    }
    setAt(x, y, z, value) {
        var dx, dy, dz;
        dy = this[z] ? this[z] : this[z] = {};
        dx = dy[y] ? dy[y] : dy[y] = {};
        dx[x] == undefined && this._count++;
        dx[x] = value;
    }
    clearAt(x, y, z) {
        delete this[z][y][x];
        this._count--;
        for (var xs in this[z][y]) return;
        delete this[z][y];
        for (var ys in this[z]) return;
        delete this[z];
    }
    getAt(x, y, z) {
        var dx, dy, dz;
        if ((dy = this[z]) && (dx = dy[y])) return dx[x];
    }
    forEvery(func) {
        for (var z in this) {
            if (isNaN(z)) continue;
            var dy = this[z = Number(z)];
            for (var y in dy) {
                var dx = dy[y = Number(y)];
                for (var x in dx) func(Number(x), y, z, dx[x]);
            }
        }
    }
}