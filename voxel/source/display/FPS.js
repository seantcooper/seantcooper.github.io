var FPS_tooks = {};
class FPS {
    constructor(_canvas) {
        document.body.appendChild(this.canvas = createCanvas("#ff0000"));
        this.time = Date.now();
        this.frame = 0;
        this.frameTimes = [];
        for (var i = 60; i; this.frameTimes.push(18), --i);
        this.scratch = document.createElement('canvas');
        this.size = { width: 100, height: 70 };
        this.scratch.width = this.size.width;
        this.scratch.height = this.size.height - 20;
    }

    update() {
        var _time = Date.now();
        this.frameTimes[this.frame % this.frameTimes.length] = this.frameTime = _time - this.time;
        this.time = _time;
        this.fps = Math.round(1000 / (this.frameTimes.sum(function (t) { return t }) / this.frameTimes.length));
        this.frame++;
    }

    paint() {
        this.taken = Date.now() - this.time;
        var vw = 1;
        var _ctx = this.scratch.getContext('2d');

        _ctx.drawImage(this.scratch, vw, 0, this.scratch.width - vw, this.scratch.height, 0, 0, this.scratch.width - vw, this.scratch.height);

        _ctx.fillStyle = "black";
        _ctx.fillRect(this.scratch.width - vw, 0, vw, this.scratch.height);

        var v1 = this.frameTime / 33;
        var v2 = this.taken / 33;
        var h1 = Math.round(v1 * this.scratch.height);
        var h2 = Math.round(v2 * this.scratch.height);

        _ctx.fillStyle = "cyan";
        _ctx.fillRect(this.scratch.width - vw, this.scratch.height - h1, vw, h1);

        _ctx.fillStyle = "red";
        _ctx.fillRect(this.scratch.width - vw, this.scratch.height - h2, vw, h2);

        var ctx = this.canvas.getContext("2d");
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.size.width, this.size.height);
        ctx.drawImage(this.scratch, 0, 0, this.scratch.width, this.scratch.height, 0, this.size.height - this.scratch.height, this.scratch.width, this.scratch.height);

        ctx.textBaseline = "top";
        ctx.textAlign = "left";
        ctx.font = uicss.fontTiny;
        ctx.fillStyle = "cyan";
        ctx.fillText("FPS:" + this.fps + " (" + this.frameTime + ")", 4, 4);
        ctx.textAlign = "left";
        ctx.fillStyle = "cyan";
        ctx.fillText("[" + this.taken + "]", 4 + this.size.width * 0.6, 4);
    }

    resize(x, y, w, h) {
        this.canvas.style.left = x + "px";
        this.canvas.width = this.size.width; //w;
        this.canvas.height = this.size.height; //h;
    }
}

class Profiler {
    static clear() { Profiler.timers = {}; Profiler.variables = {}; }
    static toString() {
        var lines = [];
        lines.push("PROFILER [START] >>>>>>>>>>");
        lines.push("> Timers:");
        for (var name in Profiler.timers) {
            lines.push(">>>> " + name + " took " + Profiler.timers[name] + "ms");
        }
        lines.push("> " + "Variables:");
        for (var name in Profiler.variables) {
            lines.push(">>>> " + name + " = '" + Profiler.variables[name] + "'");
        }
        lines.push("PROFILER [END] >>>>>>>>>>");
        return lines.join("\n");
    }

    static startTimer(name) { Profiler.timers[name] = Date.now(); }
    static stopTimer(name) { Profiler.timers[name] = Date.now() - Profiler.timers[name]; }
    static getTimer(name) { return Profiler.timers[name]; }
    static addVariable(name, value) { Profiler.variables[name] = value; }
    static incVariable(name) { Profiler.variables[name]++; }
    static decVariable(name) { Profiler.variables[name]--; }
}


