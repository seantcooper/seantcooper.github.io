class Rect {
    constructor(_x, _y, _width, _height) {
        switch (arguments.length) {
            default: this.assign(0, 0, 0, 0);
            case 1: this.assign(_x, 0, 0, 0);
            case 2: this.assign(_x, _y, 0, 0);
            case 3: this.assign(_x, _y, _width, 0);
            case 4: this.assign(_x, _y, _width, _height);
        }
    }
    equals(r) { return this.x == r.x && this.y == r.y && this.width == r.width && this.height == r.height; }
    toString() { return "Rect: " + this.x + "," + this.y + "," + this.width + "," + this.height; }
    copyFrom(r) { this.assign(r.x, r.y, r.width, r.height); }
    assign(_x, _y, _width, _height) { this.x = _x; this.y = _y; this.width = _width; this.height = _height; }
    inflate(_x, _y) { if (arguments.length == 1) _y = _x; this.x -= _x; this.y -= _y; this.width += _x * 2; this.height += _y * 2; }
    deflate(_x, _y) { if (arguments.length == 1) _y = _x; this.x += _x; this.y += _y; this.width -= _x * 2; this.height -= _y * 2; }
    offset(_x, _y) { this.x += _x; this.y += _y; }
    containsXY(_x, _y) { return _x >= this.x && _y >= this.y && _x < this.right && _y < this.bottom; }
    containsPoint(_point) { return _point.x >= this.x && _point.y >= this.y && _point.x < this.right && _point.y < this.bottom; }
    containsRect(_rect) { return _rect.x < this.right && _rect.right > this.x && _rect.y < this.bottom && _rect.bottom > this.y; }
    get location() { return new Point(this.x, this.y); }
    set location(a) { this.x = a.x; this.y = a.y; }
    get size() { return new EMSize(this.width, this.height); }
    set size(a) { this.width = a.width; this.height = a.height; }
    get randomPoint() { return new Point(this.x + Math.random() * this.width, this.y + Math.random() * this.height); }
    get center() { return new Point(this.x + this.width / 2, this.y + this.height / 2); }
    get top() { return this.y; }
    get bottom() { return this.y + this.height; }
    get left() { return this.x; }
    get right() { return this.x + this.width; }
    get topRight() { return new Point(this.right, this.y) }
    get topLeft() { return new Point(this.x, this.y) }
    get bottomRight() { return new Point(this.right, this.bottom) }
    get bottomLeft() { return new Point(this.x, this.bottom) }
    clone() { return new Rect(this.x, this.y, this.width, this.height); }
}
class Rect3 {
    constructor(x, y, z, sizex, sizey, sizez) {
        this.x = x; this.y = y; this.z = z;
        this.sizex = sizex; this.sizey = sizey; this.sizez = sizez;
    }
}