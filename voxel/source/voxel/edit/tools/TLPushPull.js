class TLPushPull extends TLTool {
    constructor() {
        super("Push/Pull plane");
        this.name = this.constructor.name;
        this.icon = UITools.ICON_PULL;
        this.tool = new VXToolPushPull();
    }
}

class VXToolPushPull extends VXTool {
    constructor() { super(); }
    isMouseOver() { return this.tools.getTool("VXToolFaceSelection").selectedObject != null; }
    onMouseDown(e) {
        super.onMouseDown(e);
        this.object = this.tools.getTool("VXToolFaceSelection").selectedObject;
        this.vector = null;
        if (this.object) {
            Editor.self.map.edit.beginEdit();
            this.tools.makeExclusive(this);
            this.normal = this.object.normal;
            var index = this.object.index;
            (this.shape = Map3Shape.fromMap(Editor.self.map)).getPullPlane(index.x, index.y, index.z, this.normal);
            if (this.shape.points) {
                this.currentDist = 0;
                this.vector = Editor.self.map.edit.getNormalVector(this.object.position, this.normal);
            }
        }
    }
    onMouseUp(e) {
        super.onMouseUp(e);
        if (this.object) {
            this.tools.clearExclusive(this);
            Editor.self.map.edit.endEdit();
            this.object = null;
        }
    }
    onMouseMove(e) {
        super.onMouseMove(e);
        if (this.mouse.down && this.vector) {
            var dist = this.distanceAlongVector(this.mouse.delta, { x: 0, y: 0 }, this.vector);
            var move = Math.round(dist - this.currentDist);
            var moved = this.shape.movePullPlane(Editor.self.map, this.normal, move);
            this.currentDist += moved;
        }
    }

    distanceAlongVector(point, vector, delta) {
        var vx = delta.x, vy = delta.y, wx = point.x - vector.x, wy = point.y - vector.y;
        return ((vx * wx + vy * wy) / (vx * vx + vy * vy));
    }
}