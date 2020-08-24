class Vector3 {
    constructor(_x, _y, _z, _w) {
        switch (arguments.length) {
            case 0: this.x = this.y = this.z = 0; break;
            case 1: this.x = _x; this.y = this.z = 0; break;
            case 2: this.x = _x; this.y = _y; this.z = 0; break;
            case 3: this.x = _x; this.y = _y; this.z = _z; break;
            case 4: this.x = _x; this.y = _y; this.z = _z; this.w = _w; break;
        }
        this.w == null && (this.w = 1);
    }
    assign(_x, _y, _z) { this.x = _x; this.y = _y; _z != null && (this.z = _z); }
    toString(fixed) {
        var e = [this.x, this.y, this.z, this.w];
        fixed && (e = e.select(function (n) { return n.toFixed(fixed) }));
        return "Vector3: " + e.join(',');
    }
    add(_vector) { this.x += _vector.x; this.y += _vector.y; this.z += _vector.z; }
    sub(_vector) { this.x -= _vector.x; this.y -= _vector.y; this.z -= _vector.z; }
    div(_vector) { this.x /= _vector.x; this.y /= _vector.y; this.z /= _vector.z; }
    mul(_vector) { this.x *= _vector.x; this.y *= _vector.y; this.z *= _vector.z; }
    scale(_scale) { this.x *= _scale; this.y *= _scale; this.z *= _scale; }
    dot(_vector) { return this.x * _vector.x + this.y * _vector.y + this.z * _vector.z; }

    //cross(A, B) =[a2 * b3 - this.z * b2, this.z * b1 - this.x * b3, this.x * b2 - a2 * b1]
    normalize() { var s = 1 / this.length; this.x *= s; this.y *= s; this.z *= s; }
    copyFrom(_vector) { this.assign(_vector.x, _vector.y, _vector.z); }
    inRange(_min, _max) {
        if (arguments.length == 1) { _max = _min; _min = Vector3.ZERO; }
        return this.x >= _min.x && this.x < _max.x && this.y >= _min.y && this.y < _max.y && this.z >= _min.z && this.z < _max.z;
    }

    get length() { return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z); }
    clone() { return new Vector3(this.x, this.y, this.z); }

    get key() { return this._key ? this._key : this.x + "_" + this.y + "_" + this.z; }
    static getKey(_x, _y, _z) { return _x + "_" + _y + "_" + _z; }

    static distance(_vector1, _vector2) { return Vector3.subVectors(_vector1, _vector2).length; }
    static subVectors(vector1, vector2) { return new Vector3(vector1.x - vector2.x, vector1.y - vector2.y, vector1.z - vector2.z); }
    static addVectors(vector1, vector2) { return new Vector3(vector1.x + vector2.x, vector1.y + vector2.y, vector1.z + vector2.z); }
    static tweenDelta(v1, v2, f) { return new Vector3((v2.x - v1.x) * f, (v2.y - v1.y) * f, (v2.z - v1.z) * f); }
    static tween(v1, v2, f) { return new Vector3((v2.x - v1.x) * f + v1.x, (v2.y - v1.y) * f + v1.y, (v2.z - v1.z) * f + v1.z); }

    distanceToSegment(segment1, segment2) {
        var v = Vector3.subVectors(segment2, segment1); //S.P1 - S.P0;
        var w = Vector3.subVectors(this, segment1); //P - S.P0;
        var c1 = w.dot(v);
        if (c1 <= 0) return Vector3.distance(this, segment1);
        var c2 = v.dot(v);
        if (c2 <= c1) return Vector3.distance(this, segment2);
        v.scale(c1 / c2);
        return Vector3.distance(this, Vector3.addVectors(segment1, v));
    }

    distanceSQRToLine(v1, v2) {
        var v = Vector3.subVectors(v2, v1);
        var w = Vector3.subVectors(this, v1);
        var s = w.dot(v) / v.dot(v);
        var dx = this.x - (v1.x + v.x * s);
        var dy = this.y - (v1.y + v.y * s);
        var dz = this.z - (v1.z + v.z * s);
        return dx * dx + dy * dy + dz * dz;
    }

    distanceAlongLine(v1, v2) {
        var v, w, c;
        v = v2 ? Vector3.subVectors(v2, v1) : v1.clone();
        w = v2 ? Vector3.subVectors(this, v1) : this;
        v.scale((c = w.dot(v)) / v.dot(v));
        return c < 0 ? -v.length : v.length;
    }
}

Vector3.ZERO = new Vector3();
Vector3.AXIS_X = new Vector3(1, 0, 0);
Vector3.AXIS_Y = new Vector3(0, 1, 0);
Vector3.AXIS_Z = new Vector3(0, 0, 1);

// Vector3.NORMAL_NX = new Vector3(-1, 0, 0);
// Vector3.NORMAL_PX = new Vector3(+1, 0, 0);
// Vector3.NORMAL_NY = new Vector3(0, -1, 0);
// Vector3.NORMAL_PY = new Vector3(0, +1, 0);
// Vector3.NORMAL_NZ = new Vector3(0, 0, -1);
// Vector3.NORMAL_PZ = new Vector3(0, 0, +1);
// Vector3.NORMALS = [Vector3.NORMAL_NX, Vector3.NORMAL_PX, Vector3.NORMAL_NY, Vector3.NORMAL_PY, Vector3.NORMAL_NZ, Vector3.NORMAL_PZ];
// Vector3.INVNORMALS = [Vector3.NORMAL_PX, Vector3.NORMAL_NX, Vector3.NORMAL_PY, Vector3.NORMAL_NY, Vector3.NORMAL_PZ, Vector3.NORMAL_NZ];
// Vector3.PNORMALS = { x: Vector3.NORMAL_PX, y: Vector3.NORMAL_PY, z: Vector3.NORMAL_PZ };
// Vector3.NNORMALS = { x: Vector3.NORMAL_NX, y: Vector3.NORMAL_NY, z: Vector3.NORMAL_NZ };
