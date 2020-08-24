class GameObject {
    constructor() {
        Game.self.renderer.addContainer(this.instance = createInstance(peep1));
        this.scale = 1 / 4;
        this.position = new Vector3(Game.self.landscape.size.x / 2, Game.self.landscape.size.y / 2, 0);
        this.rotation = Math.random() * 360;
    }

    update() {
        this.rotation += ((Math.random() < 0.5 ? -1 : +1) * 4);
        var d = this.instance.matrix.multiplyNormal(new Vector3(0, -0.1, 0));
        this.position.x += d.x;
        this.position.y += d.y;
        this.position.z = Game.self.landscape.map.getAltitudeAt(this.position.x, this.position.y);
        this.instance.matrix.setGameObject(this.position, this.rotation, this.scale);
    }
}

class Peep extends GameObject {
    constructor() {
        super();
    }
}