class GLRegion {
    constructor(key) {
        this.key = key;
        this.visible = true;
    }

    set data(data) { this._updateData = this._data = data; }
    get data() { return this._data; }

    dispose() {
        if (this.vertices) {
            this.vertices.dispose();
            this.colors.dispose();
            this.indices.dispose();
        }
    }

    draw(gl, shader) {
        if (this.visible) {
            if (this._updateData) {
                this.vertices ? this.uploadData(gl, this._updateData) : this.initializeBuffers(gl, this._updateData);
                this._updateData = null;
            }
            this.vertices.select(gl, shader);
            this.colors.select(gl, shader);
            gl.useProgram(shader);
            this.indices.select(gl);
        }
    }

    uploadData(gl, data) {
        data.vertices && this.vertices.upload(gl, data.vertices);
        data.colors && this.colors.upload(gl, data.colors);
        data.indices && this.indices.upload(gl, data.indices);
    }

    initializeBuffers(gl, data) {
        this.vertices = new GLBufferFloat(gl, data.vertices, "position");
        this.colors = new GLBufferFloat(gl, data.colors, "color");
        this.indices = new GLBufferInd(gl, data.indices);
    }
}
