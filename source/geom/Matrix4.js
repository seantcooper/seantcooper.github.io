class Matrix4 {
    constructor(_data) {
        _data && this.assign(_data);
    }

    toString(fixed) {
        var m = this;
        var e = [m.m11, m.m12, m.m13, m.m14, m.m21, m.m22, m.m23, m.m24, m.m31, m.m32, m.m33, m.m34, m.m41, m.m42, m.m43, m.m44];
        fixed && (e = e.select(function (n) { return n.toFixed(fixed) }));
        return e.join(',');
    }

    static get identity() {
        var m = new Matrix4();
        m.m11 = 1; m.m12 = 0; m.m13 = 0; m.m14 = 0;
        m.m21 = 0; m.m22 = 1; m.m23 = 0; m.m24 = 0;
        m.m31 = 0; m.m32 = 0; m.m33 = 1; m.m34 = 0;
        m.m41 = 0; m.m42 = 0; m.m43 = 0; m.m44 = 1;
        return m;
    }

    assign(_data) {
        this.m11 = _data[0]; this.m12 = _data[1]; this.m13 = _data[2]; this.m14 = _data[3];
        this.m21 = _data[4]; this.m22 = _data[5]; this.m23 = _data[6]; this.m24 = _data[7];
        this.m31 = _data[8]; this.m32 = _data[9]; this.m33 = _data[10]; this.m34 = _data[11];
        this.m41 = _data[12]; this.m42 = _data[13]; this.m43 = _data[14]; this.m44 = _data[15];
    }

    clone() {
        var m = new Matrix4();
        m.copyFrom(this);
        return m;
    }

    get fovX() { return Math.atan(1 / this.m11) * 2.0; }
    get fovY() { return Math.atan(1 / this.m22) * 2.0; }
    get aspect() { return this.m22 / this.m11; }

    static getProjection(angle, a, zMin, zMax) {
        var ang = Math.tan((angle * .5) * Math.PI / 180);
        return new Matrix4([
            0.5 / ang, 0, 0, 0,
            0, 0.5 * a / ang, 0, 0,
            0, 0, -(zMax + zMin) / (zMax - zMin), -1,
            0, 0, (-2 * zMax * zMin) / (zMax - zMin), 0
        ]);
    }

    get webGL() {
        return [
            this.m11, this.m21, this.m31, this.m41,
            this.m12, this.m22, this.m32, this.m42,
            this.m13, this.m23, this.m33, this.m43,
            this.m14, this.m24, this.m34, this.m44,
        ];
    }

    copyFrom(m) {
        this.m11 = m.m11; this.m12 = m.m12; this.m13 = m.m13; this.m14 = m.m14;
        this.m21 = m.m21; this.m22 = m.m22; this.m23 = m.m23; this.m24 = m.m24;
        this.m31 = m.m31; this.m32 = m.m32; this.m33 = m.m33; this.m34 = m.m34;
        this.m41 = m.m41; this.m42 = m.m42; this.m43 = m.m43; this.m44 = m.m44;
    }

    multiplyVertices(vertices) {
        var m11 = this.m11, m12 = this.m12, m13 = this.m13, m14 = this.m14;
        var m21 = this.m21, m22 = this.m22, m23 = this.m23, m24 = this.m24;
        var m31 = this.m31, m32 = this.m32, m33 = this.m33, m34 = this.m34;
        var m41 = this.m41, m42 = this.m42, m43 = this.m43, m44 = this.m44;
        for (var v of vertices) {
            var vx = v.x, vy = v.y, vz = v.z, vw = v.w, t = v.trans ? v.trans : v.trans = new Vector3();
            //var w = 1 / (t.w = vx * m41 + vy * m42 + vz * m43 + vw * m44);
            t.x = (vx * m11 + vy * m12 + vz * m13 + vw * m14);
            t.y = (vx * m21 + vy * m22 + vz * m23 + vw * m24);
            t.z = (vx * m31 + vy * m32 + vz * m33 + vw * m34);
            t.w = (vx * m41 + vy * m42 + vz * m43 + vw * m44);
        }
    }

    multiplyNormals(normals) {
        var m11 = this.m11, m12 = this.m12, m13 = this.m13, m14 = this.m14;
        var m21 = this.m21, m22 = this.m22, m23 = this.m23, m24 = this.m24;
        var m31 = this.m31, m32 = this.m32, m33 = this.m33, m34 = this.m34;
        var m41 = this.m41, m42 = this.m42, m43 = this.m43, m44 = this.m44;
        for (var v of normals) {
            var vx = v.x, vy = v.y, vz = v.z, t = v.trans ? v.trans : v.trans = new Vector3();
            t.x = vx * m11 + vy * m12 + vz * m13;
            t.y = vx * m21 + vy * m22 + vz * m23;
            t.z = vx * m31 + vy * m32 + vz * m33;
        }
    }

    multiplyVertex(vertex) {
        var t = new Vector3();
        var vx = vertex.x, vy = vertex.y, vz = vertex.z, vw = vertex.w;
        t.x = (vx * this.m11 + vy * this.m12 + vz * this.m13 + vw * this.m14);
        t.y = (vx * this.m21 + vy * this.m22 + vz * this.m23 + vw * this.m24);
        t.z = (vx * this.m31 + vy * this.m32 + vz * this.m33 + vw * this.m34);
        t.w = (vx * this.m41 + vy * this.m42 + vz * this.m43 + vw * this.m44);
        return t;
    }

    multiplyNormal(normal) {
        var t = new Vector3();
        var vx = normal.x, vy = normal.y, vz = normal.z;
        t.x = vx * this.m11 + vy * this.m12 + vz * this.m13;
        t.y = vx * this.m21 + vy * this.m22 + vz * this.m23;
        t.z = vx * this.m31 + vy * this.m32 + vz * this.m33;
        return t;
    }

    get position() { return new Vector3(this.m14, this.m24, this.m34, this.m44); }
    set position(a) { this.m14 = a.x; this.m24 = a.y; this.m34 = a.z; }

    static multiplyList() { for (var i = 1, m = arguments[0].clone(); i < arguments.length; m.multiply(arguments[i]), i++); return m; }

    multiplyMatrices(a, b) {

        var a11 = a.m11, b11 = b.m11, a12 = a.m12, b12 = b.m12, a13 = a.m13, b13 = b.m13, a14 = a.m14, b14 = b.m14;
        var a21 = a.m21, b21 = b.m21, a22 = a.m22, b22 = b.m22, a23 = a.m23, b23 = b.m23, a24 = a.m24, b24 = b.m24;
        var a31 = a.m31, b31 = b.m31, a32 = a.m32, b32 = b.m32, a33 = a.m33, b33 = b.m33, a34 = a.m34, b34 = b.m34;
        var a41 = a.m41, b41 = b.m41, a42 = a.m42, b42 = b.m42, a43 = a.m43, b43 = b.m43, a44 = a.m44, b44 = b.m44;

        this.m11 = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
        this.m12 = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
        this.m13 = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
        this.m14 = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

        this.m21 = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
        this.m22 = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
        this.m23 = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
        this.m24 = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

        this.m31 = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
        this.m32 = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
        this.m33 = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
        this.m34 = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

        this.m41 = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
        this.m42 = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
        this.m43 = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
        this.m44 = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
    }

    inverse() {
        var n11 = this.m11, n12 = this.m12, n13 = this.m13, n14 = this.m14;
        var n21 = this.m21, n22 = this.m22, n23 = this.m23, n24 = this.m24;
        var n31 = this.m31, n32 = this.m32, n33 = this.m33, n34 = this.m34;
        var n41 = this.m41, n42 = this.m42, n43 = this.m43, n44 = this.m44;
        // var n11 = this.m11, n12 = this.m21, n13 = this.m31, n14 = this.m41;
        // var n21 = this.m12, n22 = this.m22, n23 = this.m32, n24 = this.m42;
        // var n31 = this.m13, n32 = this.m23, n33 = this.m33, n34 = this.m43;
        // var n41 = this.m14, n42 = this.m24, n43 = this.m34, n44 = this.m44;

        var t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
            t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
            t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
            t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

        var det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

        if (det === 0) { return Matrix4.identity; }

        var detInv = 1 / det;

        var m = new Matrix4();
        m.m11 = t11 * detInv;
        m.m21 = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
        m.m31 = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
        m.m41 = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;

        m.m12 = t12 * detInv;
        m.m22 = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
        m.m32 = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
        m.m42 = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;

        m.m13 = t13 * detInv;
        m.m23 = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
        m.m33 = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
        m.m43 = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;

        m.m14 = t14 * detInv;
        m.m24 = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
        m.m34 = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
        m.m44 = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;
        return m;
    }

    // inverse2() {
    //     var m = this;
    //     var r = new Matrix4();
    //     r.m11 = (m.m22 * m.m33 * m.m44 - m.m22 * m.m34 * m.m43 - m.m32 * m.m23 * m.m44 + m.m32 * m.m24 * m.m43 + m.m42 * m.m23 * m.m34 - m.m42 * m.m24 * m.m33);
    //     r.m21 = (-m.m21 * m.m33 * m.m44 + m.m21 * m.m34 * m.m43 + m.m31 * m.m23 * m.m44 - m.m31 * m.m24 * m.m43 - m.m41 * m.m23 * m.m34 + m.m41 * m.m24 * m.m33);
    //     r.m31 = (m.m21 * m.m32 * m.m44 - m.m21 * m.m34 * m.m42 - m.m31 * m.m22 * m.m44 + m.m31 * m.m24 * m.m42 + m.m41 * m.m22 * m.m34 - m.m41 * m.m24 * m.m32);
    //     r.m41 = (-m.m21 * m.m32 * m.m43 + m.m21 * m.m33 * m.m42 + m.m31 * m.m22 * m.m43 - m.m31 * m.m23 * m.m42 - m.m41 * m.m22 * m.m33 + m.m41 * m.m23 * m.m32);
    //     r.m12 = (-m.m12 * m.m33 * m.m44 + m.m12 * m.m34 * m.m43 + m.m32 * m.m13 * m.m44 - m.m32 * m.m14 * m.m43 - m.m42 * m.m13 * m.m34 + m.m42 * m.m14 * m.m33);
    //     r.m22 = (m.m11 * m.m33 * m.m44 - m.m11 * m.m34 * m.m43 - m.m31 * m.m13 * m.m44 + m.m31 * m.m14 * m.m43 + m.m41 * m.m13 * m.m34 - m.m41 * m.m14 * m.m33);
    //     r.m32 = (-m.m11 * m.m32 * m.m44 + m.m11 * m.m34 * m.m42 + m.m31 * m.m12 * m.m44 - m.m31 * m.m14 * m.m42 - m.m41 * m.m12 * m.m34 + m.m41 * m.m14 * m.m32);
    //     r.m42 = (m.m11 * m.m32 * m.m43 - m.m11 * m.m33 * m.m42 - m.m31 * m.m12 * m.m43 + m.m31 * m.m13 * m.m42 + m.m41 * m.m12 * m.m33 - m.m41 * m.m13 * m.m32);
    //     r.m13 = (m.m12 * m.m23 * m.m44 - m.m12 * m.m24 * m.m43 - m.m22 * m.m13 * m.m44 + m.m22 * m.m14 * m.m43 + m.m42 * m.m13 * m.m24 - m.m42 * m.m14 * m.m23);
    //     r.m23 = (-m.m11 * m.m23 * m.m44 + m.m11 * m.m24 * m.m43 + m.m21 * m.m13 * m.m44 - m.m21 * m.m14 * m.m43 - m.m41 * m.m13 * m.m24 + m.m41 * m.m14 * m.m23);
    //     r.m33 = (m.m11 * m.m22 * m.m44 - m.m11 * m.m24 * m.m42 - m.m21 * m.m12 * m.m44 + m.m21 * m.m14 * m.m42 + m.m41 * m.m12 * m.m24 - m.m41 * m.m14 * m.m22);
    //     r.m43 = (-m.m11 * m.m22 * m.m43 + m.m11 * m.m23 * m.m42 + m.m21 * m.m12 * m.m43 - m.m21 * m.m13 * m.m42 - m.m41 * m.m12 * m.m23 + m.m41 * m.m13 * m.m22);
    //     r.m14 = (-m.m12 * m.m23 * m.m34 + m.m12 * m.m24 * m.m33 + m.m22 * m.m13 * m.m34 - m.m22 * m.m14 * m.m33 - m.m32 * m.m13 * m.m24 + m.m32 * m.m14 * m.m23);
    //     r.m24 = (m.m11 * m.m23 * m.m34 - m.m11 * m.m24 * m.m33 - m.m21 * m.m13 * m.m34 + m.m21 * m.m14 * m.m33 + m.m31 * m.m13 * m.m24 - m.m31 * m.m14 * m.m23);
    //     r.m34 = (-m.m11 * m.m22 * m.m34 + m.m11 * m.m24 * m.m32 + m.m21 * m.m12 * m.m34 - m.m21 * m.m14 * m.m32 - m.m31 * m.m12 * m.m24 + m.m31 * m.m14 * m.m22);
    //     r.m44 = (m.m11 * m.m22 * m.m33 - m.m11 * m.m23 * m.m32 - m.m21 * m.m12 * m.m33 + m.m21 * m.m13 * m.m32 + m.m31 * m.m12 * m.m23 - m.m31 * m.m13 * m.m22);
    //     var det = m.m11 * r.m11 + m.m12 * r.m21 + m.m13 * r.m31 + m.m14 * r.m41;
    //     if (det == 0) return false;
    //     det = 1.0 / det;
    //     r.m11 *= det; r.m12 *= det; r.m13 *= det; r.m14 *= det; r.m21 *= det; r.m22 *= det; r.m23 *= det; r.m24 *= det;
    //     r.m31 *= det; r.m32 *= det; r.m33 *= det; r.m34 *= det; r.m41 *= det; r.m42 *= det; r.m43 *= det; r.m44 *= det;
    //     return r;
    // }

    invmultiply(_matrix) {
        this.multiplyMatrices(_matrix, this);
    }

    multiply(_matrix) {
        this.multiplyMatrices(this, _matrix);
    }

    static RotationX(_radians) {
        var c = Math.cos(_radians), s = Math.sin(_radians);
        var m = new Matrix4();
        m.assign([
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1
        ]);
        return m;
    }

    static RotationY(_radians) {
        var c = Math.cos(_radians), s = Math.sin(_radians);
        var m = new Matrix4();
        m.assign([
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1
        ]);
        return m;
    }

    static RotationZ(_radians) {
        var c = Math.cos(_radians), s = Math.sin(_radians);
        var m = new Matrix4();
        m.assign([
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        return m;
    }

    rotate(_axis, _radians) {
        _axis.x && this.invmultiply(Matrix4.RotationX(_radians * _axis.x));
        _axis.y && this.invmultiply(Matrix4.RotationY(_radians * _axis.y));
        _axis.z && this.invmultiply(Matrix4.RotationZ(_radians * _axis.z));
    }

    scale(_scale) {
        var a = Matrix4.identity;
        if (isNaN(_scale)) {
            a.m11 = _scale.x; a.m22 = _scale.y; a.m33 = _scale.z;
        } else {
            a.m11 = a.m22 = a.m33 = _scale;
        }
        this.invmultiply(a);
    }

    translate(x, y, z) {
        var a = Matrix4.identity;
        a.m14 = x; a.m24 = y; a.m34 = z; this.invmultiply(a);
    }

    compareTo(m) {
        return this.m11 == m.m11 && this.m12 == m.m12 && this.m13 == m.m13 && this.m14 == m.m14 &&
            this.m21 == m.m21 && this.m22 == m.m22 && this.m23 == m.m23 && this.m24 == m.m24 &&
            this.m31 == m.m31 && this.m32 == m.m32 && this.m33 == m.m33 && this.m34 == m.m34 &&
            this.m41 == m.m41 && this.m42 == m.m42 && this.m43 == m.m43 && this.m44 == m.m44 ? 0 : -1;
    }

    setGameObject(position, rotation, scale) {
        var rads = rotation * DEG2RAD;
        var c = Math.cos(rads) * scale, s = Math.sin(rads) * scale;

        this.m11 = c; this.m12 = s; this.m13 = 0; this.m14 = position.x;
        this.m21 = -s; this.m22 = c; this.m23 = 0; this.m24 = position.y;
        this.m31 = 0; this.m32 = 0; this.m33 = scale; this.m34 = position.z;
        this.m41 = 0; this.m42 = 0; this.m43 = 0; this.m44 = 1;
    }

}

Matrix4.temp = new Matrix4();