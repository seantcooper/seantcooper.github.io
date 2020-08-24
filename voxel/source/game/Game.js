class Game {
    constructor() {
        if (Game.self) return;
        Game.self = this;

        this.tick = 0;
        this.renderer = new GLRender();
        this.scratch = new VXScratch(true);
        this.landscape = new Landscape(512, 512);
        this.camera = new GameCamera();

        this.gameMouse = new GameMouse(this.scratch.canvas, this.camera);
        this.keyboard = new Keyboard(this.scratch.canvas);

        this.renderer.addContainer(this.landscape.mesh.container);

        this.gameObjects = [];
        for (var i = 250; i; --i)
            this.gameObjects.push(new GameObject());

        this.fps = new FPS();
    }

    closing() {
    }

    update() {
        this.camera.update();
        for (var object of this.gameObjects) {
            object.update();
        }
    }

    render() {
        Profiler.clear();
        this.update();
        this.fps.update();
        this.landscape.update();
        this.renderer.render(this.camera.matrix);
        this.fps.paint();
        this.tick++;
    }

    resize(w, h) {
        this.fps.resize(0, 0, w, h);
        this.renderer.resize(0, 0, w, h);
        this.scratch.resize(0, 0, w, h);
    }
}

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

class GameMouse extends MouseStub {
    constructor(canvas, camera) {
        super(canvas);
        this.camera = camera;
        this.mouseButton = Mouse.RIGHT;
    }
    // onMouseDown(e) {
    //     super.onMouseDown(e);
    //     this.move = (e.keys & Mouse.ALT) > 0;
    //     this.camera.backup();
    // }
    // onMouseMove(e) {
    //     super.onMouseMove(e);
    //     if (this.mouse.down) {
    //         this.camera.restore();
    //         if (this.move) {
    //             this.camera.translateX(this.mouse.delta.x / 10);
    //             this.camera.translateY(-this.mouse.delta.y / 10);
    //         } else {
    //             this.camera.rotateZ(this.mouse.delta.x / 200);
    //             this.camera.rotateX(this.mouse.delta.y / 200);
    //         }
    //     }
    // }
    // onMouseWheel(e) { super.onMouseWheel(e); this.camera.translateZ(-e.position.y / 30); }
}

class GameCamera {
    constructor() {
        this._matrix = Matrix4.identity;
        this.position = new Vector3(-Game.self.landscape.size.x / 2, -Game.self.landscape.size.y / 2 + 100, -100);
    }
    get matrix() {
        this._matrix = Matrix4.identity;
        this._matrix.position = this.position;
        this._matrix.invmultiply(Matrix4.RotationX(Math.PI / 4));
        return this._matrix;
    }

    update() {
        var speed = 2;
        if (Game.self.keyboard.keys["ArrowUp"]) { this.move(0, -speed); }
        if (Game.self.keyboard.keys["ArrowDown"]) { this.move(0, speed); }
        if (Game.self.keyboard.keys["ArrowLeft"]) { this.move(speed, 0); }
        if (Game.self.keyboard.keys["ArrowRight"]) { this.move(-speed, 0); }
        if (Game.self.keyboard.keys["-"]) { this.move(0, 0, -1); }
        if (Game.self.keyboard.keys["="]) { this.move(0, 0, +1); }
    }
    // rotateX(n) {
    //     var p = this._matrix.position;
    //     this._matrix.translate(0, 0, -p.z);
    //     this._matrix.invmultiply(Matrix4.RotationX(-n));
    //     this._matrix.translate(0, 0, p.z);
    // }
    // rotateZ(n) {
    //     var p = this._matrix.position;
    //     this._matrix.translate(0, 0, -p.z);
    //     this._matrix.multiply(Matrix4.RotationZ(-n));
    //     this._matrix.translate(0, 0, p.z);
    // }
    move(x, y, z) {
        x && (this.position.x += x);
        y && (this.position.y += y);
        z && (this.position.z += z);
        // this._matrix.position = this.position;
        trace(this.position);
    }

    // translateX(n) { this._matrix.translate(n, 0, 0); }
    // translateY(n) { this._matrix.translate(0, n, 0); }
    // translateZ(n) { this.move(0, 0, n); }

    backup() { this._backup = this._matrix.clone(); }
    restore() { this._matrix.copyFrom(this._backup); }
}