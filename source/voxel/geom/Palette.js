class Palette {
    constructor(colors) {
        this.events = new EventDispatcher(this);
        this.colors = colors.slice();
        if (this.colors.length >= 256) this.colors.length = 256;
        while (this.colors.length < 256) { this.colors.push(new Color(0, 0, 0)); }
    }

    getColor(index) { return this.colors[index].clone(); }
    setColor(index, color) {
        this.colors[index].copyFrom(color);
        this.events.raise("colorchanged", { index: index });
    }
    setColors(a) {
        for (var i = 0, n = Math.min(a.length, 256); i < n; i++)
            this.colors[i].copyFrom(a[i]);
        this.events.raise("colorschanged");
    }
    toArray() { return this.colors.selectMany(function (c) { return [c.r, c.g, c.b] }); }
    toData() {
        var output = [this.colors.length];
        for (var color of this.colors) output.push(color.r, color.g, color.b);
        return output.join(",");
    }
    static fromData(data) {
        !Array.isArray(data) && (data = data.split(",").select(function (s) { return Number(s) }));
        for (var colors = [], n = data.shift(), i = 0; i < n; i++)
            colors.push(new Color(data.shift(), data.shift(), data.shift()));
        return new Palette(colors);
    }
}

// var paletteSheet = new SpriteSheet(GetImage("images/palettes.png"), 32, 32);
// Palette.PALETTE1 = new Palette(paletteSheet.getPalette64(0));
// Palette.PALETTE2 = new Palette(paletteSheet.getPalette64(1));

var PALETTE1 = new Palette([
    new Color(0, 1, 0), new Color(255, 255, 255), new Color(0, 0, 0), new Color(0, 64, 88), new Color(0, 88, 0), new Color(0, 104, 0), new Color(0, 120, 0), new Color(80, 48, 0), new Color(252, 13, 27), new Color(255, 253, 56), new Color(51, 51, 51), new Color(0, 136, 136), new Color(0, 168, 68), new Color(0, 168, 0), new Color(0, 184, 0), new Color(172, 124, 0), new Color(41, 253, 47), new Color(45, 255, 254), new Color(120, 120, 120), new Color(0, 232, 216), new Color(88, 248, 152), new Color(88, 216, 84), new Color(184, 248, 24), new Color(248, 184, 0), new Color(11, 36, 251), new Color(252, 40, 252), new Color(248, 216, 248), new Color(0, 252, 252), new Color(184, 248, 216), new Color(184, 248, 184), new Color(216, 248, 120), new Color(248, 216, 120), new Color(124, 124, 124), new Color(0, 0, 252), new Color(0, 0, 188), new Color(68, 40, 188), new Color(148, 0, 132), new Color(168, 0, 32), new Color(168, 16, 0), new Color(136, 20, 0), new Color(188, 188, 188), new Color(0, 120, 248), new Color(0, 88, 248), new Color(104, 68, 252), new Color(216, 0, 204), new Color(228, 0, 88), new Color(248, 56, 0), new Color(228, 92, 16), new Color(248, 248, 248), new Color(60, 188, 252), new Color(104, 136, 252), new Color(152, 120, 248), new Color(248, 120, 248), new Color(248, 88, 152), new Color(248, 120, 88), new Color(252, 160, 68), new Color(252, 252, 252), new Color(164, 228, 252), new Color(184, 184, 248), new Color(216, 184, 248), new Color(248, 184, 248), new Color(248, 164, 192), new Color(240, 208, 176), new Color(252, 224, 168)
]);