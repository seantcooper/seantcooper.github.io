class GLRender {
    constructor() {
        document.body.appendChild(this.canvas = createCanvas("#aaaaaa"));
        var gl = this.gl = this.canvas.getContext('webgl');

        this.containers = new Dictionary();

        var vertShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertShader, this.vertCode);
        gl.compileShader(vertShader);

        var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragShader, this.fragCode);
        gl.compileShader(fragShader);

        this.shaderProgram = gl.createProgram();
        gl.attachShader(this.shaderProgram, vertShader);
        gl.attachShader(this.shaderProgram, fragShader);
        gl.linkProgram(this.shaderProgram);

        /* ====== Associating attributes to vertex shader =====*/
        this.Pmatrix = gl.getUniformLocation(this.shaderProgram, "Pmatrix");
        this.Vmatrix = gl.getUniformLocation(this.shaderProgram, "Vmatrix");
        this.Mmatrix = gl.getUniformLocation(this.shaderProgram, "Mmatrix");
        gl.useProgram(this.shaderProgram);

        this.near = 1;
        this.far = 400;
        this.angle = 15;
    }

    addContainer(container) {
        this.containers.add(container.key, container);
        container.renderer = this;
    }
    removeContainer(container) {
        this.containers.remove(container.key);
        container.dispose();
    }

    getRaycast(point, modelMatrix) {
        var width = this.canvas.width, height = this.canvas.height;

        var iproj = this.projection.inverse();
        var d = iproj.multiplyVertex(new Vector3(((point.x * 2 / width) - 1) * 2, (1 - (point.y * 2 / height)) * 2, 1));

        var iview = this.view.inverse();
        var v1 = iview.multiplyVertex(new Vector3(d.x * this.near, d.y * this.near, -this.near));
        var v2 = iview.multiplyVertex(new Vector3(d.x * this.far, d.y * this.far, -this.far));

        var imodel = modelMatrix.inverse();
        return { v1: imodel.multiplyVertex(v1), v2: imodel.multiplyVertex(v2) };
    }

    resize(x, y, w, h) {
        this.canvas.style.left = x + "px";
        this.canvas.style.top = y + "px";
        this.canvas.width = w;
        this.canvas.height = h;
        this.projection = Matrix4.getProjection(this.angle, this.canvas.width / this.canvas.height, this.near, this.far);
    }

    render(cameraMatrix) {
        if (this.containers.values.length == 0) return;
        var gl = this.gl = this.canvas.getContext('webgl');

        gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
        gl.clearColor(0.5, 0.5, 0.5, 0.9); gl.clearDepth(1.0);
        gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK);
        // gl.enable(gl.BLEND);
        // gl.blendFunc(gl.ONE, gl.SRC_ALPHA);

        gl.viewport(0.0, 0.0, this.canvas.width, this.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.view = cameraMatrix.clone();
        this.projection = Matrix4.getProjection(this.angle, this.canvas.width / this.canvas.height, this.near, this.far);
        this.concatenatedMatrix = Matrix4.multiplyList(this.projection, this.view, this.containers.values[0].matrix); //Matrix4.identity);

        gl.uniformMatrix4fv(this.Pmatrix, false, this.projection.webGL);
        gl.uniformMatrix4fv(this.Vmatrix, false, this.view.webGL);
        gl.uniformMatrix4fv(this.Mmatrix, false, this.containers.values[0].matrix.webGL);

        for (var container of this.containers.values) {
            container.update && container.update();
            container.draw(gl, this.shaderProgram);
        }

        this.ready = true;
        // var pixels = new Uint8Array(4);
        // gl.readPixels(Math.floor(this.canvas.width / 2), Math.floor(this.canvas.height / 2), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        // console.log(pixels); // Uint8Array
    }

    invalidate() { }

    get vertCode() {
        var vertCode =
            'attribute vec3 position;' +
            'uniform mat4 Pmatrix;' +
            'uniform mat4 Vmatrix;' +
            'uniform mat4 Mmatrix;' +
            'attribute vec3 color;' +//the color of the point
            'varying vec3 vColor;' +

            'void main(void) {' +//pre-built function
            'gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);' +
            'vColor = color;' +
            '}';
        //        'vColor = color;' +
        return vertCode;
    }
    get fragCode() {
        var fragCode =
            'precision mediump float;' +
            'varying vec3 vColor;' +
            'void main(void) {' +
            'gl_FragColor = vec4(vColor, 1);' +
            '}';
        return fragCode;
    }

    canvasToGL(point) {
        return new Point(((point.x / this.canvas.width) * 2 - 1), ((1 - (point.y / this.canvas.height)) * 2 - 1));
    }
    GLToCanvas(vertex) {
        return new Vector3(((vertex.x / vertex.w) + 1) / 2 * this.canvas.width, ((- (vertex.y / vertex.w)) + 1) / 2 * this.canvas.height, vertex.z);
    }
}

