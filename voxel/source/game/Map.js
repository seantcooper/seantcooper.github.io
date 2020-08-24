MaxAltitude = 32;
AltitudeRaise = 0.5;
CellDirections = [
    { x: -1, y: +0 },
    { x: -1, y: -1 },
    { x: +0, y: -1 },
    { x: +1, y: -1 },
    { x: +1, y: +0 },
    { x: +1, y: +1 },
    { x: +0, y: +1 },
    { x: -1, y: +1 },
]

class Map {
    constructor(sizex, sizey) {
        this.colorGroups = new SpriteSheet(GetImage("images/landscape.png"), 8, 256).getLinearPalette();
        this.size = { x: sizex, y: sizey };
        this.sizeA = { x: sizex - 1, y: sizey - 1 };
        this.cells = [];
        for (var y = 0, xline; y < this.size.y; y++) {
            this.cells.push(xline = []);
            for (var x = 0; x < this.size.x; x++) {
                xline.push(new MapCell(this, x, y));
            }
        }
    }

    getAltitudeAt(x, y) {
        return this.cells[y & this.sizeA.y][x & this.sizeA.x].altitude;
    }

    addHill(x, y, radius, scale) {
        var xa = this.size.x - 1, ya = this.size.y - 1;
        var x1 = x - radius, y1 = y - radius, x2 = x + radius, y2 = y + radius;
        for (var iy = y1; iy <= y2; iy++) {
            for (var ix = x1; ix <= x2; ix++) {
                var ax = ix & xa, ay = iy & ya;
                var dx = ix - x, dy = iy - y;
                var d = Math.sqrt(dx * dx + dy * dy);

                if (d < radius) {
                    var rads = (d / radius) * Math.PI / 2;
                    var altitude = (Math.cos(rads)) * radius * scale;
                    this.cells[ay][ax].altitude += altitude;
                }
            }
        }
    }

    smooth(size, strength) {
        var xa = this.size.x - 1, ya = this.size.y - 1;
        for (var y = 0; y < this.size.y; y++) {
            for (var x = 0; x < this.size.x; x++) {
                var cell1 = this.cells[(y - size) & ya][(x - size) & xa];
                var cell2 = this.cells[(y - size) & ya][(x + size) & xa];
                var cell3 = this.cells[(y + size) & ya][(x + size) & xa];
                var cell4 = this.cells[(y + size) & ya][(x - size) & xa];

                var avg = (cell1.altitude + cell2.altitude + cell3.altitude + cell4.altitude) / 4;
                var alt = this.cells[y][x].altitude;

                this.cells[y][x].altitude = (avg - alt) * strength + alt;
            }
        }
    }
    setAltitude(altitude) {
        for (var y = 0; y < this.size.y; y++) {
            for (var x = 0; x < this.size.x; x++) {
                this.cells[y][x].altitude = altitude;
            }
        }
    }
}

class MapCell {
    constructor(map, x, y) {
        this.map = map;
        this.x = x;
        this.y = y;
        this.altitude = 0;//MaxAltitude / 2;
    }

    raise() {
        this.altitude += AltitudeRaise;
        var min = this.altitude - AltitudeRaise;
        for (var n of this.neighbors8) {
            if (n.x != -1 && n.altitude < min) {
                n.raise();
            }
        }
    }
    lower() {
        this.altitude -= AltitudeRaise;
        var max = this.altitude + AltitudeRaise;
        for (var n of this.neighbors8) {
            if (n.x != -1 && n.altitude > max) {
                n.lower();
            }
        }
    }

    set altitude(a) {
        a = Math.floor(Math.max(0, Math.min(MaxAltitude, a)) / 0.5) * 0.5;
        if (this._altitude != a) {
            this._altitude = a;
            if (this.map) {
                var colors = this.map.colorGroups[0];
                var x = (this.x + this.y) % 2;
                var i = Math.min(Math.floor(this._altitude * colors.length / MaxAltitude), colors.length - 1);

                this.color = this.map.colorGroups[x][i];
                this.region && this.region.damageAt(this.x, this.y);
                //this._altitude < 0.25 && (this._altitude = 0.25);
            }
        }
    }

    get altitude() {
        return this._altitude;
    }

    get neighbors() {
        if (!this._neighbors) {
            this._neighbors = [
                this.x == 0 ? MapCellZero : this.map.cells[this.y][this.x - 1],
                this.y == 0 ? MapCellZero : this.map.cells[this.y - 1][this.x],
                this.x == this.map.size.x - 1 ? MapCellZero : this.map.cells[this.y][this.x + 1],
                this.y == this.map.size.y - 1 ? MapCellZero : this.map.cells[this.y + 1][this.x]
            ];
        }
        return this._neighbors;
    }

    get neighbors8() {
        if (!this._neighbors8) {
            this._neighbors8 = [];
            for (var d of CellDirections) {
                var x = this.x + d.x, y = this.y + d.y;
                this._neighbors8.push((x >= 0 && y >= 0 && x < this.map.size.x && y < this.map.size.y) ? this.map.cells[y][x] : MapCellZero);
            }
        }
        return this._neighbors8;
    }
}

MapCellZero = new MapCell(null, -1, -1);
MapCellZero.altitude = 0;
