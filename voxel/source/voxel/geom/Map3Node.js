class Map3Node {
    constructor(map, x, y, z, color) {
        this.map = map;
        this.region = map.regions.getAt(x, y, z);
        this.vertices = Map3Node.getCube(x, y, z);
        this.index = this.vertices[0];
        this.key = this.index.key;
        this.normals = Map3Node_NORMALS;
        this.faceByID = [];
        this.color = color;
        this.resize();
    }
    resize() {
        var p = this.index;
        this.edge = p.x >= 0 || p.y >= 0 || p.z == 0 || p.x == map.size.x - 1 || p.y == map.size.y - 1 || p.z == map.size.z - 1;
    }
    toObject() {
        return {
            vertices: this.vertices,
            index: this.index,
            key: this.key = this.index.key,
            normals: this.normals,
            faces: this.faces.slice(),
            color: this.color
        };
    }
    dispose() {
        this.disposed = true;
        this.faces = null;
    }
    update(N6) {
        if (N6 != this.lastN6) {
            this.lastN6 = N6;
            this.faces = [];
            for (var i = 0; i < 6; i++) {
                if (N6 & (1 << i)) {
                    if (!this.faceByID[i]) this.faceByID[i] = new Map3Face(i, this.vertices[0], this.vertices, VX_FACES[i], this.normals[i], this);
                    this.faces.push(this.faceByID[i]);
                }
                else if (this.faceByID[i]) {
                    this.faceByID[i] = null;
                }
            }
            return true;
        }
        return false;
    }

    prettify() {
        var neighbor = function (offset) {
            var x = this.index.x + offset.x, y = this.index.y + offset.y, z = this.index.z + offset.z;
            return (!this.edge || this.map.inBounds(x, y, z)) && this.map.nodes[z][y][x] ? 1 : 0;
        }.bind(this);
        var shade = function (_face, i) {
            var offsets = VX_SHADE_NEIGHBORS[_face.id][i];
            var n = neighbor(offsets[0]) + neighbor(offsets[1]) + neighbor(offsets[2]);
            return (1 - (n * 0.1)) * _face.shade;
        }.bind(this);
        for (var face of this.faces) { if (face) face.shading = [shade(face, 0), shade(face, 1), shade(face, 2), shade(face, 3)]; }
    }
    static getCube(x, y, z) {
        var vertices = [];
        for (var v of VX_CUBE) {
            var ix = x + v.x, iy = y + v.y, iz = z + v.z;
            !Map3Node_VERTICES[iz][iy][ix] && (Map3Node_VERTICES[iz][iy][ix] = new Vertex(ix, iy, iz));
            vertices.push(Map3Node_VERTICES[iz][iy][ix]);
        }
        return vertices;
    }
}

Map3Node_NORMALS = VX_NORMALS.slice();
Map3Node_VERTICES = new Array3(128 + 1, 128 + 1, 128 + 1);

//==============================================================================================================================================================================
class Map3Face {
    constructor(id, index, vertices, indices, normal, node) {
        this.id = id;
        this.index = index;
        this.normal = normal;
        this.node = node;
        this.shade = VX_SHADING[id] / 255;
        this.key = id + ":" + this.index.key;
        this.v1 = vertices[indices[0]];
        this.v2 = vertices[indices[1]];
        this.v3 = vertices[indices[2]];
        this.v4 = vertices[indices[3]];
        this.shading = [this.shade, this.shade, this.shade, this.shade];
    }
    dispose() { }
    static rayToPlane(ray, delta, min, max, normal) {
        if (delta.dot(normal) > 0) return null;

        if (normal.x) {
            var scale = (min.x - ray.x) / delta.x;
            var x = ray.x + delta.x * scale, y = ray.y + delta.y * scale, z = ray.z + delta.z * scale;
            if (y >= min.y && y < max.y && z >= min.z && z < max.z) return new Vector3(x, y, z);
        }
        else if (normal.y) {
            var scale = (min.y - ray.y) / delta.y;
            var x = ray.x + delta.x * scale, y = ray.y + delta.y * scale, z = ray.z + delta.z * scale;
            if (x >= min.x && x < max.x && z >= min.z && z < max.z) return new Vector3(x, y, z);
        }
        else if (normal.z) {
            var scale = (min.z - ray.z) / delta.z;
            var x = ray.x + delta.x * scale, y = ray.y + delta.y * scale, z = ray.z + delta.z * scale;
            if (x >= min.x && x < max.x && y >= min.y && y < max.y) return new Vector3(x, y, z);
        }
    }
}





