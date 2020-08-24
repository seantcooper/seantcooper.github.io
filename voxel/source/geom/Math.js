function isPointInPoly(_point, _poly) {
    for (var c = false, i = -1, n = _poly.length, j = n - 1; ++i < n; j = i)
        ((_poly[i].y <= _point.y && _point.y < _poly[j].y) || (_poly[j].y <= _point.y && _point.y < _poly[i].y))
            && (_point.x < (_poly[j].x - _poly[i].x) * (_point.y - _poly[i].y) / (_poly[j].y - _poly[i].y) + _poly[i].x)
            && (c = !c);
    return c;
}

function getDecimalPlaces(_number) {
    return (_number.toString().split('.')[1] || []).length;
}

function toHEX(num, digits) {
    return num.toString(16).padStart(2, "0");
}

var DEG2RAD = Math.PI / 180;
var RAD2DEG = 180 / Math.PI;

Math.floorOrNear = function (num, tolerance) {
    !tolerance && (tolerance = 0.0000001);
    return Math.floor(num + tolerance);
}

Math.rndInt = function (size) { return Math.floor(Math.random() * size); }

Math.step = function (integer, step) { return integer - (integer % step); }
Math.minmax = function () {
    var min = arguments[0];
    var max = arguments[0];
    for (var i = arguments.length - 1; i > 0; --i) {
        var n = arguments[i];
        if (n > min)
            min = n
        else if (n < max)
            max = n;
    }
    return { min: n, max: n };
}

class Point {
    constructor(_x, _y) {
        switch (arguments.length) {
            default: this.assign(0, 0);
            case 1: this.assign(_x, 0);
            case 2: this.assign(_x, _y);
        }
    }
    toString() { return "Point: " + this.x + "," + this.y; }
    assign(_x, _y) { this.x = _x; this.y = _y; }
    offset(_x, _y) { this.x += _x; this.y += _y; }
    clone() { return new Point(this.x, this.y); }
    get length() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    static distance(p1, p2) { (new Point(p2.x - p1.x, p2.y - p1.y)).length; }
    toVector3() { return new Vector3(this.x, this.y, 0); }
}

class Size {
    constructor(_width, _height) {
        this.width = _width;
        this.height = _height;
    }
    clone() { return new Size(this.width, this.height); }
    assign(w, h) { this.width = w; this.height = h; }
    toString() { return "Size: " + this.width + "," + this.height; }
}