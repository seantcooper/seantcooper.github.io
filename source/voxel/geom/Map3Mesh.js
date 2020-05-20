class Map3Mesh {
    constructor(map) {
        this.map = map;
        this.container = new GLContainer("map3");
        this.grid = new Map3Grid(map.size);
        this.container.addRegion(this.grid.region);
    }

    resize() {
        this.grid.update(this.map.size);
        this.container.matrix = Matrix4.identity;
        this.container.matrix.translate(-this.map.size.x / 2, -this.map.size.y / 2, -this.map.size.z / 2);
    }

    updateRegion(region) {
        if (region.faces.length) {
            !region.glregion && this.container.addRegion(region.glregion = new GLRegion(region.id));
            this.updateGLData(region);
        }
        else {
            this.disposeGLRegion(region);
        }
        region.damage = false;
    }

    disposeGLRegion(region) {
        if (region.glregion) {
            this.container.removeRegion(region.glregion);
            region.glregion.dispose();
            region.glregion = null;
        }
    }

    updateGLData(region) {
        var vertices = [], colors = [];
        for (var face of region.faces) {
            var v1 = face.v1, v2 = face.v2, v3 = face.v3, v4 = face.v4;

            // 5 vertices
            var v5x = (v1.x + v3.x) / 2, v5y = (v1.y + v3.y) / 2, v5z = (v1.z + v3.z) / 2;
            vertices.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v3.x, v3.y, v3.z, v4.x, v4.y, v4.z, v5x, v5y, v5z);

            var c = this.map.palette.colors[face.node.color];
            var cr = c.r, cg = c.g, cb = c.b;
            if (face.node.selected) { cr = (255 - cr); cg = (255 - cg); cb = (255 - cb); }
            var s = face.shading;
            var s1 = s[0], s2 = s[1], s3 = s[2], s4 = s[3];
            var c1r = cr * s1, c1g = cg * s1, c1b = cb * s1;
            var c2r = cr * s2, c2g = cg * s2, c2b = cb * s2;
            var c3r = cr * s3, c3g = cg * s3, c3b = cb * s3;
            var c4r = cr * s4, c4g = cg * s4, c4b = cb * s4;
            colors.push(c1r, c1g, c1b, c2r, c2g, c2b, c3r, c3g, c3b, c4r, c4g, c4b);
            colors.push((c1r + c2r + c3r + c4r) / 4, (c1g + c2g + c3g + c4g) / 4, (c1b + c2b + c3b + c4b) / 4);
        }
        region.glregion.data = { vertices: vertices, indices: GetIndices(region.faces.length), colors: colors };
    }

    getFaceAt(point) {
        var renderer = Editor.self.renderer;
        if (!renderer.ready) return;
        var ray = renderer.getRaycast(point, this.map.mesh.container.matrix);
        var selectedFace, delta = Vector3.subVectors(ray.v2, ray.v1);
        var gridFace = this.grid.getIntersection(ray.v1, delta);

        var addNode = function (node) {
            if (selectedFace) return;
            for (var face of node.faces) {
                var v = Map3Face.rayToPlane(ray.v1, delta, face.v1, face.v3, face.normal);
                if (v) {
                    selectedFace = {
                        id: face.id, index: face.index.clone(), vertices: [face.v1, face.v2, face.v3, face.v4],
                        normal: face.normal.clone(), position: v, block: face.block
                    };
                }
            }
        }
        Map3Raycast.line(this.clickNodes ? this.clickNodes : this.map.nodes, ray.v1, ray.v2, addNode);
        return selectedFace ? selectedFace : gridFace;
    }

    createClickMesh() {
        if (!this.clickNodes) {
            this.clickNodes = new Array3(this.map.size.x, this.map.size.y, this.map.size.z);
            this.map.data.forEach(function (x, y, z) {
                this.map.data[z][y][x] && this.map.nodes[z][y][x] && (this.clickNodes[z][y][x] = this.map.nodes[z][y][x].toObject());
            }.bind(this));
        }
    }
    releaseClickMesh() { this.clickNodes && (this.clickNodes = null); }
    hasClickMesh() { return this.clickNodes; }
}

//------------------------------------------------------------------------------------------------------------------------------------------------------
M3MIndices = [];
var GetIndices = function (length) {
    length *= 12;
    for (var i = M3MIndices.length * 5 / 12; M3MIndices.length < length; i += 5)
        M3MIndices.push(i + 0, i + 1, i + 4, i + 1, i + 2, i + 4, i + 2, i + 3, i + 4, i + 3, i + 0, i + 4);
    return M3MIndices.slice(0, length);
}

//------------------------------------------------------------------------------------------------------------------------------------------------------
class Map3Raycast {
    static line(nodes, v1, v2, func) {
        var size = nodes.size;
        var delta = Vector3.subVectors(v2, v1);
        var step = delta.clone();
        step.normalize();

        var dx, dy, dz;
        var component, major = Math.max(dx = Math.abs(step.x), dy = Math.abs(step.y), dz = Math.abs(step.z));

        if (major == dx) { component = "x"; }
        else if (major == dy) { component = "y"; }
        else if (major == dz) { component = "z"; }

        step.scale(1 / Math.abs(step[component]));

        var sStart = Math.abs(0 - v1[component]);
        var sEnd = Math.abs(size[component] - v1[component]);

        var start = new Vector3(v1.x + step.x * sStart, v1.y + step.y * sStart, v1.z + step.z * sStart);
        var end = new Vector3(v1.x + step.x * sEnd, v1.y + step.y * sEnd, v1.z + step.z * sEnd);

        if (Vector3.subVectors(end, start).dot(step) < 0) { var s = start; start = end; end = s; }

        var n = Math.abs(end[component] - start[component]);
        var node, key;
        var vx = start.x, vy = start.y, vz = start.z;
        var sx = step.x, sy = step.y, sz = step.z;
        var nx, ny, nz;
        var ix = Math.floor(vx), iy = Math.floor(vy), iz = Math.floor(vz);

        var addBlock = function (x, y, z) {
            x >= 0 && y >= 0 && z >= 0 && x < size.x && y < size.y && z < size.z && (node = nodes[z][y][x]) && func(node);
        }
        addBlock(ix, iy, iz);
        for (var i = 0; i <= n; i++) {
            var flag = 0;
            vx += sx; vy += sy; vz += sz;
            nx = Math.floor(vx); ny = Math.floor(vy); nz = Math.floor(vz);
            if (nx != ix) { addBlock(nx, iy, iz); flag |= VXRayX; } // x
            if (ny != iy) { addBlock(ix, ny, iz); flag |= VXRayY; } // y
            if (nz != iz) { addBlock(ix, iy, nz); flag |= VXRayZ; } // z
            (flag & VXRayXY) == VXRayXY && addBlock(nx, ny, iz); //xy
            (flag & VXRayXZ) == VXRayXZ && addBlock(nx, iy, nz); //xz
            (flag & VXRayYZ) == VXRayYZ && addBlock(ix, ny, nz); //yz
            flag == VXRayXYZ && addBlock(nx, ny, nz); //xyz
            ix = nx; iy = ny; iz = nz;
        }
    }
}

var VXRayX = 1 << 0, VXRayY = 1 << 1, VXRayZ = 1 << 2;
var VXRayXY = VXRayX | VXRayY;
var VXRayXZ = VXRayX | VXRayZ;
var VXRayYZ = VXRayY | VXRayZ;
var VXRayXYZ = VXRayX | VXRayY | VXRayZ;
