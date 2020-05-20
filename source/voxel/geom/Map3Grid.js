class Map3Grid {
    constructor(size) {
        this.region = new GLRegion("grid");
        this.update(size);
    }

    update(size) {
        this.faces = [];
        this.vertices = new Dictionary();
        this.planes = [];

        var ids = [], vts = [], cts = [];
        var drawLine = function (v1, v2, d, c) {
            var p1 = Vector3.subVectors(v1, d), p2 = Vector3.addVectors(v1, d), p3 = Vector3.addVectors(v2, d), p4 = Vector3.subVectors(v2, d);
            var i = vts.length / 3;
            ids.push(i + 0, i + 1, i + 2, i + 0, i + 2, i + 3);
            vts.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z, p3.x, p3.y, p3.z, p4.x, p4.y, p4.z);
            cts.push.apply(cts, c);
        }

        var g = 0.7, m = 0.25, w = 0.2 / 2;
        var colorpz = [g, 0, 0, g, 0, 0, g, 0, 0, g, 0, 0]; // normal positive
        var colorpy = [0, g, 0, 0, g, 0, 0, g, 0, 0, g, 0];
        var colorpx = [0, 0, g, 0, 0, g, 0, 0, g, 0, 0, g];
        var colornz = [g, m, m, g, m, m, g, m, m, g, m, m];
        var colorny = [m, g, m, m, g, m, m, g, m, m, g, m];
        var colornx = [m, m, g, m, m, g, m, m, g, m, m, g];

        var sx = size.x, sy = size.y, sz = size.z;
        var stepx = Math.max(1, Math.round(sx / 20)), stepy = Math.max(1, Math.round(sy / 20)), stepz = Math.max(1, Math.round(sz / 20));

        var steps = function (_size, _step) {
            for (var i = 0, _numbers = []; i <= _size; _numbers.push(i), i += VX_REGION_SIZE);
            i != _size && _numbers.push(_size);
            return _numbers;
        }

        for (var x of steps(sx, stepx)) {
            drawLine(new Vector3(x, 0, sz), new Vector3(x, sy, sz), new Vector3(-w, 0, 0), colorpz); //z
            drawLine(new Vector3(x, 0, 0), new Vector3(x, sy, 0), new Vector3(w, 0, 0), colornz);; //z
            drawLine(new Vector3(x, sy, 0), new Vector3(x, sy, sz), new Vector3(w, 0, 0), colorpy); //y;
            drawLine(new Vector3(x, 0, 0), new Vector3(x, 0, sz), new Vector3(-w, 0, 0), colorny); // y
        }
        for (var y of steps(sy, stepy)) {
            drawLine(new Vector3(0, y, sz), new Vector3(sx, y, sz), new Vector3(0, w, 0), colorpz); //z
            drawLine(new Vector3(0, y, 0), new Vector3(sx, y, 0), new Vector3(0, -w, 0), colornz); //z
            drawLine(new Vector3(sx, y, 0), new Vector3(sx, y, sz), new Vector3(0, -w, 0), colorpx); //x
            drawLine(new Vector3(0, y, 0), new Vector3(0, y, sz), new Vector3(0, w, 0), colornx); //x
        }
        for (var z of steps(sz, stepz)) {
            drawLine(new Vector3(sx, 0, z), new Vector3(sx, sy, z), new Vector3(0, 0, w), colorpx); //x
            drawLine(new Vector3(0, 0, z), new Vector3(0, sy, z), new Vector3(0, 0, -w), colornx); //x
            drawLine(new Vector3(0, sy, z), new Vector3(sx, sy, z), new Vector3(0, 0, -w), colorpy); //y
            drawLine(new Vector3(0, 0, z), new Vector3(sx, 0, z), new Vector3(0, 0, w), colorny); // y
        }

        this.region.data = { vertices: vts, colors: cts, indices: ids }

        // add mouse faces
        var addv = (function (x, y, z) {
            var v = new Vertex(x, y, z);
            !this.vertices[v.key] && this.vertices.add(v.key, v);
            return this.vertices[v.key];
        }).bind(this);

        var normals = Map3Node_NORMALS; //this.model.mesh.normals;
        var pids = [0, 1, 2, 3], nids = [0, 3, 2, 1], index;
        for (var y = 0; y < sy; y++) {
            for (var x = 0; x < sx; x++) {
                index = addv(x, y, -1);
                vts = [addv(x, y, 0), addv(x + 1, y, 0), addv(x + 1, y + 1, 0), addv(x, y + 1, 0)];
                this.faces.push(new Map3Face(VX_INZ, index, vts, pids, normals[VX_IPZ]));
                vts = [index = addv(x, y, sz), addv(x + 1, y, sz), addv(x + 1, y + 1, sz), addv(x, y + 1, sz)];
                this.faces.push(new Map3Face(VX_IPZ, index, vts, nids, normals[VX_INZ]));
            }
        }
        for (var z = 0; z < sz; z++) {
            for (var x = 0; x < sx; x++) {
                index = addv(x, -1, z);
                vts = [addv(x, 0, z), addv(x + 1, 0, z), addv(x + 1, 0, z + 1), addv(x, 0, z + 1)];
                this.faces.push(new Map3Face(VX_IPY, index, vts, nids, normals[VX_IPY]));
                vts = [index = addv(x, sy, z), addv(x + 1, sy, z), addv(x + 1, sy, z + 1), addv(x, sy, z + 1)];
                this.faces.push(new Map3Face(VX_INY, index, vts, pids, normals[VX_INY]));
            }
        }
        for (var z = 0; z < sz; z++) {
            for (var y = 0; y < sy; y++) {
                index = addv(-1, y, z);
                vts = [addv(0, y, z), addv(0, y + 1, z), addv(0, y + 1, z + 1), addv(0, y, z + 1)];
                this.faces.push(new Map3Face(VX_IPX, index, vts, pids, normals[VX_IPX]));
                vts = [index = addv(sx, y, z), addv(sx, y + 1, z), addv(sx, y + 1, z + 1), addv(sx, y, z + 1)];
                this.faces.push(new Map3Face(VX_INX, index, vts, nids, normals[VX_INX]));
            }
        }
        this.vertices = this.vertices.values;

        // create planes
        var cube = VX_CUBE.select(function (p) { return new Vector3(p.x * size.x, p.y * size.y, p.z * size.z); });
        for (var i = 0; i < 6; this.planes.push(VX_FACES[i].select(function (t) { return cube[t]; })), i++);
    }

    set visible(a) { this._visible = this.region.visible = a; }
    get visible() { return this._visible; }

    getIntersection(ray, delta) {
        for (var i = 0; i < 6; i++) {
            var p = Map3Face.rayToPlane(ray, delta, this.planes[i][0], this.planes[i][2], VX_INV_NORMALS[i]);
            if (p) {
                var index = new Vertex(Math.floorOrNear(p.x), Math.floorOrNear(p.y), Math.floorOrNear(p.z));
                var n = VX_INV_NORMALS[i];
                if (n.x + n.y + n.z > 0) { index.x -= n.x; index.y -= n.y; index.z -= n.z; }
                i = VX_INV_INORMALS[i];
                var vertices = VX_FACES[i].select(function (t) { return new Vertex(index.x + VX_CUBE[t].x, index.y + VX_CUBE[t].y, index.z + VX_CUBE[t].z); });
                return { id: i, index: index, vertices: vertices, normal: n, position: p, grid: true };
            }
        }
    }
}
