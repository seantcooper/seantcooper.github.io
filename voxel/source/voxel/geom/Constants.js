
//                x                  pz  / nz                nx / px             py / ny
//          4-----------5          4-----------5          4           5          4-----------5  
//         /|          /|         /        pz /          /|          /|          |        ny |  
//      y / |         / |        /           /       nx / |         / |          |           |  
//       /  |        /  | z     /           /          /  |        /  |          |           |  
//      7---+-------6   |      7-----------6          7   |       6   |      7---+-------6   |  
//      |   0-------+---1          0-----------1      |   0       |   1      |   0-------+---1  
//      |  /        |  /          /           /       |  /        |  /       |           |      
//      | /         | /          /           /        | /      px | /        |           |      
//      |/          |/          /  nz       /         |/          |/         |  py       |      
//      3-----------2          3-----------2          3           2          3-----------2      

VX_MODEL_MAX_SIZE = 128;

VX_REGION_SIZE = 16;
VX_REGION_SCALE = 1 / 16;
VX_REGION_SHIFT = 4;
VX_REGION_MASK = 0xfffffff0;

VX_FACES = [
    [0, 4, 7, 3], // 0
    [1, 2, 6, 5], // 1
    [0, 1, 5, 4], // 2
    [3, 7, 6, 2], // 3
    [0, 3, 2, 1], // 4
    [4, 5, 6, 7]  // 5
];

VX_SHARED_INDICES = [];
//    [[2, 4], [2, 5], [3, 5], [3, 4]]
for (var iface = 0; iface < 6; iface++) {
    var indices = [];
    for (var idx of VX_FACES[iface]) {
        for (var jface = 0, faces = []; jface < 6; jface++) { jface != iface && VX_FACES[jface].indexOf(idx) > -1 && faces.push(jface); }
        indices.push(faces);
    }
    VX_SHARED_INDICES.push(indices);
}

VX_VERTEX_TO_FACES = [];
for (var idx = 0; idx < 8; idx++) {
    var faces = [];
    for (var iface = 0; iface < 6; iface++) {
        if (VX_FACES[iface].indexOf(idx) > -1) {
            faces.push(iface);
        }
    }
    VX_VERTEX_TO_FACES.push(faces);
}

VX_CUBE = [
    new Vertex(0, 0, 0), new Vertex(1, 0, 0), new Vertex(1, 1, 0), new Vertex(0, 1, 0),
    new Vertex(0, 0, 1), new Vertex(1, 0, 1), new Vertex(1, 1, 1), new Vertex(0, 1, 1)
];

VX_INX = 0;
VX_IPX = 1;
VX_INY = 2;
VX_IPY = 3;
VX_INZ = 4;
VX_IPZ = 5;

VX_PERP_INORMALS = [
    [VX_INY, VX_IPY, VX_INZ, VX_IPZ],
    [VX_INY, VX_IPY, VX_INZ, VX_IPZ],
    [VX_INX, VX_IPX, VX_INZ, VX_IPZ],
    [VX_INX, VX_IPX, VX_INZ, VX_IPZ],
    [VX_INX, VX_IPX, VX_INY, VX_IPY],
    [VX_INX, VX_IPX, VX_INY, VX_IPY]
];

VX_NORMAL_NX = new Normal(0, -1, 0, 0);
VX_NORMAL_PX = new Normal(1, +1, 0, 0);
VX_NORMAL_NY = new Normal(2, 0, -1, 0);
VX_NORMAL_PY = new Normal(3, 0, +1, 0);
VX_NORMAL_NZ = new Normal(4, 0, 0, -1);
VX_NORMAL_PZ = new Normal(5, 0, 0, +1);
VX_NORMALS = [VX_NORMAL_NX, VX_NORMAL_PX, VX_NORMAL_NY, VX_NORMAL_PY, VX_NORMAL_NZ, VX_NORMAL_PZ];
VX_INV_NORMALS = [VX_NORMAL_PX, VX_NORMAL_NX, VX_NORMAL_PY, VX_NORMAL_NY, VX_NORMAL_PZ, VX_NORMAL_NZ];
VX_INV_INORMALS = [VX_IPX, VX_INX, VX_IPY, VX_INY, VX_IPZ, VX_INZ];
VX_NORMAL_MAJOR = ["x", "x", "y", "y", "z", "z"];

VX_INDICES = [
    [0, 4, 7, 0, 7, 3],
    [1, 2, 6, 1, 6, 5],
    [0, 1, 5, 0, 5, 4],
    [7, 6, 3, 7, 2, 3],
    [0, 3, 2, 0, 2, 1],
    [4, 5, 6, 4, 6, 7]
];

VX_DELTAS = [
    new Vertex(-1, 1, 1),
    new Vertex(0, 1, 1),
    new Vertex(1, -1, 1),
    new Vertex(1, 0, 1),
    new Vertex(1, 1, -1),
    new Vertex(1, 1, 0)
];

VX_SHADING = [
    0.5,
    0.80,
    0.6,
    0.90,
    0.7,
    1.00];

VX_SHADING_DEC = 0.12;

VX_SHADE_NEIGHBORS = [];
for (var iface = 0; iface < 6; iface++) {
    var n0 = VX_NORMALS[iface];
    var faces = [];
    for (var ivertex = 0; ivertex < 4; ivertex++) {
        var ifaces = VX_SHARED_INDICES[iface][ivertex];
        var n1 = VX_NORMALS[ifaces[0]];
        var n2 = VX_NORMALS[ifaces[1]];
        var offsets = [
            { x: n0.x + n1.x, y: n0.y + n1.y, z: n0.z + n1.z },
            { x: n0.x + n2.x, y: n0.y + n2.y, z: n0.z + n2.z },
            { x: n0.x + n1.x + n2.x, y: n0.y + n1.y + n2.y, z: n0.z + n1.z + n2.z }
        ];
        faces.push(offsets);
    }
    VX_SHADE_NEIGHBORS.push(faces);
}

VX_ALL_NEIGHBORS = []
for (var z = -1; z <= 1; z++) {
    for (var y = -1; y <= 1; y++) {
        for (var x = -1; x <= 1; x++) {
            VX_ALL_NEIGHBORS.push(new Vertex(x, y, z));
        }
    }
}