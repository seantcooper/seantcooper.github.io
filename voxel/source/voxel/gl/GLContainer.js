class GLContainer {
    constructor(key) {
        this.key = key;
        this.regions = new Dictionary();
        this.matrix = Matrix4.identity;
        this.visible = true;
    }

    dispose() { for (var region of this.regions.values) region.dispose(); }
    addRegion(region) { this.regions.add(region.key, region); }
    removeRegion(region) { this.regions.remove(region.key); region.dispose(); }

    draw(gl, shader, matrix) {
        if (!matrix) matrix = this.matrix;
        this.concatenatedMatrix = Matrix4.multiplyList(this.renderer.projection, this.renderer.view, matrix);
        if (this.visible) {
            gl.uniformMatrix4fv(this.renderer.Mmatrix, false, matrix.webGL);
            for (var region of this.regions.values) {
                region.draw(gl, shader);
            }
        }
    }

    toCode(size, exclude) {
        if (!exclude) { exclude = []; }
        // model = {
        //     size:{x:10,y:10,z:10},
        //     regions: [
        //         {
        //             key: "HELLO",
        //             indices: [1, 2, 3, 4, 5],
        //             vertices: [1, 2, 3, 4, 5],
        //             colors: [1, 2, 3, 4, 5]
        //         },
        //     ],
        // };

        var lines = [];
        lines.push("model={")
        lines.push("size:{" + "x:" + size.x + ",y:" + size.y + ",z:" + size.z + "},");
        lines.push("regions:[")
        lines.push("{")
        for (var region of this.regions.values) {
            if (exclude.indexOf(region.key) == -1) {
                lines.push("key:" + region.key + ",");
                lines.push("faceCount:" + region.data.indices.length / 3 + ",");
                lines.push("indices:[" + region.data.indices.join(",") + "],");
                lines.push("vertices:[" + region.data.vertices.join(",") + "],");
                lines.push("colors:[" + region.data.colors.select(function (c) { return Math.round(c * 255); }).join(",") + "],");
            }
        }
        lines.push("},")
        lines.push("],")
        lines.push("};")
        return lines.join("\n");
    }
}

GLInstanceID = 0;
class GLInstance {
    constructor(container) {
        this.key = "instance" + (++GLInstanceID);
        this.matrix = Matrix4.identity;
        this.container = container;
    }

    draw(gl, shader) {
        this.container.renderer = this.renderer;
        this.container.draw(gl, shader, this.matrix);
    }
}