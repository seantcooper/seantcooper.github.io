//------------------------------------------------------------------------------------------------------------------------------------------------------
class GLBuffer {
    constructor(gl) { this.gl = gl; }
    dispose() { this.gl.deleteBuffer(this.buffer); }
}

//------------------------------------------------------------------------------------------------------------------------------------------------------
class GLBufferFloat extends GLBuffer {
    constructor(gl, data, attribute) {
        super(gl);
        this.buffer = gl.createBuffer();
        this.attribute = attribute;
        this.upload(gl, data);
    }

    upload(gl, data) {
        this.data = data;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.data), gl.DYNAMIC_DRAW);
    }

    select(gl, shader) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        var index = gl.getAttribLocation(shader, this.attribute);
        gl.vertexAttribPointer(index, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(index);
    }
}

//------------------------------------------------------------------------------------------------------------------------------------------------------
class GLBufferInd extends GLBuffer {
    constructor(gl, data) {
        super(gl);
        this.buffer = gl.createBuffer();
        this.upload(gl, data);
    }

    upload(gl, data) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.data = data), gl.DYNAMIC_DRAW);
    }

    select(gl) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
        //trace("draw")
        //        gl.drawElements(gl.TRIANGLES, this.data.length, gl.UNSIGNED_SHORT, 0);
        gl.drawElements(gl.TRIANGLES, this.data.length, gl.UNSIGNED_SHORT, 0);
    }
}

//------------------------------------------------------------------------------------------------------------------------------------------------------
