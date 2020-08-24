class Vertex {
    constructor(x, y, z) {
        this.key = Vertex.getKey(this.x = x, this.y = y, this.z = z); this.w = 1;
    }
    equals(vertex) { return this.x == vertex.x && this.y == vertex.y && this.z == vertex.z; }
    toString(fixed) {
        var e = [this.x, this.y, this.z];
        fixed != null && (e = e.select(function (n) { return n.toFixed(fixed) }));
        return "Vertex: " + e.join(',');
    }
    toVector3() { return new Vector3(this.x, this.y, this.z); }
    clone() { return new Vertex(this.x, this.y, this.z); }
    static getKey(x, y, z) { return x + "_" + y + "_" + z; }
}

class Normal {
    constructor(id, x, y, z) { this.id = id; this.x = x, this.y = y, this.z = z; }
    toString(fixed) {
        var e = [this.x, this.y, this.z];
        fixed && (e = e.select(function (n) { return n.toFixed(fixed) }));
        return "Normal: " + e.join(',');
    }
    toVector3() { return new Vector3(this.x, this.y, this.z, 0); }
    clone() { return new Normal(this.id, this.x, this.y, this.z); }
}