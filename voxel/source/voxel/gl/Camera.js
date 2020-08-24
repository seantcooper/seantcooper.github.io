class Camera {
    constructor() {
        this.invalidate();
        this._matrix = Matrix4.identity;
        this._matrix.translate(0, 0, -100);
        this.setFrontTiltView();
    }

    reset() { this._matrix = Matrix4.identity; }
    translateX(n) { this._matrix.translate(n, 0, 0); }
    translateY(n) { this._matrix.translate(0, n, 0); }
    translateZ(n) { this._matrix.translate(0, 0, n); }
    rotateX(n) {
        var p = this._matrix.position;
        this._matrix.translate(0, 0, -p.z);
        this._matrix.invmultiply(Matrix4.RotationX(-n));
        this._matrix.translate(0, 0, p.z);
    }
    rotateZ(n) {
        var p = this._matrix.position;
        this._matrix.translate(0, 0, -p.z);
        this._matrix.multiply(Matrix4.RotationZ(-n));
        this._matrix.translate(0, 0, p.z);
    }
    get matrix() { return this._matrix; }

    backup() { this._backup = this._matrix.clone(); }
    restore() { this._matrix.copyFrom(this._backup); }

    resize(w, h) { this.width = w; this.height = h; this.invalidate(); }

    clone() {
        var _camera = new Camera(this.parent);
        _camera._matrix = this._matrix.clone();
        return _camera;
    }

    invalidate() {
        // this.parent && this.parent.invalidate();
    }

    setView(rx, ry, rz) {
        var z = this._matrix.m34;
        this.reset();
        rx && this.rotateX(rx);
        rz && this.rotateZ(rz);
        this.translateZ(z);
    }

    setIsoView() { this.setView(-Math.PI / 4, 0, -Math.PI / 4); }
    setTopView() { this.setView(0, 0, 0); }
    setBottomView() { this.setView(-Math.PI, 0, 0); }
    setFrontView() { this.setView(-Math.PI / 2, 0, 0); }
    setBackView() { this.setView(0, 0, Math.PI); }
    setLeftView() { this.setView(0, 0, -Math.PI / 2); }
    setRightView() { this.setView(0, 0, Math.PI / 2); }
    setFrontTiltView() { this.setView(-Math.PI / 4, 0, 0); }
}

