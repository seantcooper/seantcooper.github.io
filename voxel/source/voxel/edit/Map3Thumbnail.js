class Map3Thumbnail {
    static getImage(data, colors, camera) {

        // GET MATRIX >>>>> 
        if (!camera) {
            camera = new Camera();
            camera.rotateZ(500);
            camera.setIsoView();
        }
        var proj = Matrix4.getProjection(15, 1, 1, 400);
        var view = camera.matrix;
        var model = Matrix4.identity;
        model.translate(-data.sizex / 2, -data.sizey / 2, -data.sizez / 2);
        var matrix = Matrix4.multiplyList(proj, view, model);
        // GET MATRIX >>>>> 


        var normals = Map3Node_NORMALS;
        normals.forEach(function (n) { n.backface = matrix.multiplyNormal(n).dot(normals[VX_INZ]) <= 0; });

        var vertices = new StaticDictionary(), nodes = [];
        data.forEvery(function (p) {
            var vts = Map3Node.getCube(p.x, p.y, p.z);
            nodes.push({ color: data[p.z][p.y][p.x], index: vts[0], vertices: vts });
            for (var v of vts) vertices.add(v);
        }.bind(this));

        if (vertices.length) {

            // get canvas size and offset
            var canvas = createCanvas("transparent");
            canvas.width = canvas.height = 128;

            var GLToCanvas = function (v) { return new Vector3(((v.x / v.w) + 1) / 2 * canvas.width, ((- (v.y / v.w)) + 1) / 2 * canvas.height, v.z); }

            var vt = [], min, max, tr;
            for (var v of vertices.values) {
                vt.push(tr = v.trans = GLToCanvas(matrix.multiplyVertex(v)));

                // extents
                if (!min) { min = new Point(tr.x, tr.y); max = new Point(tr.x, tr.y); }
                if (tr.x > max.x) max.x = tr.x; else if (tr.x < min.x) min.x = tr.x;
                if (tr.y > max.y) max.y = tr.y; else if (tr.y < min.y) min.y = tr.y;
            }

            var size = Math.max(max.x - min.x, max.y - min.y);
            var offx = (max.x + min.x) / 2, offy = (max.y + min.y) / 2;
            var scale = canvas.width / size;
            for (var tr of vt) tr.assign((tr.x - offx + size / 2) * scale, (tr.y - offy + size / 2) * scale, tr.z);

            var faces = [];
            for (var node of nodes) {
                var N6 = data.getN6Flags(node.index.x, node.index.y, node.index.z);
                if (N6 != 0) {
                    for (var i = 0; i < 6; i++) {
                        if (!normals[i].backface && (N6 & (1 << i))) {
                            var indices = VX_FACES[i];
                            var face = {
                                v1: node.vertices[indices[0]].trans, v2: node.vertices[indices[1]].trans,
                                v3: node.vertices[indices[2]].trans, v4: node.vertices[indices[3]].trans,
                                fill: colors[node.color].scale(VX_SHADING[i]).html
                            };
                            face.val = node.index.trans.z;
                            faces.push(face);
                        }
                    }
                }
            }
            faces.sort(function (a, b) { return a.val == b.val ? 0 : (a.val > b.val ? -1 : 1) });
            var ctx = canvas.getContext("2d");
            for (var face of faces) {
                ctx.beginPath();
                ctx.moveTo(face.v1.x, face.v1.y); ctx.lineTo(face.v2.x, face.v2.y); ctx.lineTo(face.v3.x, face.v3.y); ctx.lineTo(face.v4.x, face.v4.y);
                ctx.fillStyle = face.fill; ctx.fill();
            }

            return { image: canvas, x: -2, y: -2, width: canvas.width + 4, height: canvas.height + 4 };
        }
    }
}
