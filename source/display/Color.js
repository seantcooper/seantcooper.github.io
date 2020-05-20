
//==============================================================================================================================================================================
class Color {
    constructor(r, g, b, a) {
        this.r = r; this.g = g; this.b = b; this.a = a == null ? 255 : a;
    }
    assign(r, g, b, a) { this.r = r; this.g = g; this.b = b; this.a = arguments.length == 3 ? 0 : a; }
    toString() { return "Color: " + this.r + "," + this.g + "," + this.b + "," + this.a; }
    toValue() { return this.a << 24 | this.r << 16 | this.g << 8 | this.b }
    equal(_value) { return this.r == _value.r && this.g == _value.g && this.b == _value.b && this.a == _value.a; }
    compareTo(_value) { var v1 = this.toValue(), v2 = _value.toValue(); return v1 > v2 ? 1 : (v1 == v2 ? 0 : -1); }
    copyFrom(c) { this.assign(c.r, c.g, c.b, c.a); }
    clone() { return new Color(this.r, this.g, this.b, this.a) }
    get html() { return "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a / 255 + ")"; }
    get key() { return this.r + "_" + this.g + "_" + this.b + (this.a == 255 ? "" : "_" + Math.floor(this.a)); }
    static randomComponent() { return Math.floor(Math.random() * 256); }
    static random() { return new Color(this.randomComponent(), this.randomComponent(), this.randomComponent()); }
    static fromHTML(_html) {
        _html.slice(0, 1) == "#" && (_html = _html.slice(1, 7));
        return new Color(parseInt(_html.slice(0, 2), 16), this.g = parseInt(_html.slice(2, 4), 16), this.b = parseInt(_html.slice(4, 6), 16), 255);
    }
    brightness(_brightness) {
        var b = Math.round(_brightness * 256);
        return new Color(Math.max(0, Math.min(255, this.r + b)), Math.max(0, Math.min(255, this.g + b)), Math.max(0, Math.min(255, this.b + b)), this.a);
    }
    scale(scale) { return new Color(Math.round(this.r * scale), Math.round(this.g * scale), Math.round(this.b * scale)); }
    static validateHTML(_html) {
        if (!(typeof _html === "string")) return false;
        _html.slice(0, 1) == "#" && (_html = _html.slice(1));
        return _html.length == 6 && !isNaN(parseInt(_html, 16));
    }
}

//==============================================================================================================================================================================
class ColorHSL {
    constructor(h, s, l) { this.assign(h, s, l); }
    assign(h, s, l) { this.hue = h; this.saturation = s; this.lightness = l; }
    toString() { return "ColorHSL: " + this.hue + "," + this.saturation + "," + this.lightness; }
    get html() { return this.rgb.html; }
    clone() { return new ColorHSL(this.hue, this.saturation, this.lightness); }
    set rgb(a) { var hsl = a.hsl; this.assign(hsl.hue, hsl.saturation, hsl.lightness); }
    get rgb() {
        var h = this.hue / 360, s = this.saturation / 100, l = this.lightness / 100;
        var r, g, b;
        if (s == 0) {
            r = g = b = l; // achromatic
        } else {
            function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            }

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return new ColorRGB(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
    }
}
//==============================================================================================================================================================================
class ColorHSV {
    constructor(h, s, v) { this.assign(h, s, v); }
    assign(h, s, v) { this.hue = h; this.saturation = s; this.value = v; }
    toString() { return "ColorHSV: " + this.hue + ", " + this.saturation + ", " + this.value; }
    get html() { return this.rgb.html; }
    clone() { return new ColorHSV(this.hue, this.saturation, this.value); }
    set rgb(a) { var hsv = a.hsv; this.assign(hsv.hue, hsv.saturation, hsv.value); }
    get rgb() {
        var h = this.hue / 360, s = this.saturation / 100, v = this.value / 100;
        var r, g, b;
        var i = Math.floor(h * 6);
        var f = h * 6 - i;
        var p = v * (1 - s);
        var q = v * (1 - f * s);
        var t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        return new ColorRGB(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
    }
}
//==============================================================================================================================================================================
class ColorRGB {
    constructor(r, g, b, o) {
        this.red = r; this.green = g; this.blue = b;
        this.opacity = o == null ? 100 : o;
    }
    assign(r, g, b, o) { this.red = r; this.green = g; this.blue = b; o != null && (this.opacity = o); }
    toString() { return "ColorRGB: " + this.red + "," + this.green + "," + this.blue + "," + this.opacity; }
    clone() { return new ColorRGB(this.red, this.green, this.blue, this.opacity); }
    static fromColor(c) { return new ColorRGB(c.r, c.g, c.b, Math.round(c.a * 100 / 255)); }
    static fromHTML(a) { var c = new ColorRGB(0, 0, 0, 0); c.html = a; return c; }
    toColor() { return new Color(this.red, this.green, this.blue, this.opacity / 100 * 255); }
    copyFrom(c) { this.red = c.red; this.green = c.green; this.blue = c.blue; this.opacity = c.opacity; }
    get html() { return "#" + Color.NUM2HEX[this.red] + Color.NUM2HEX[this.green] + Color.NUM2HEX[this.blue]; }
    set html(_html) { var n = parseInt(_html.charAt(0) == "#" ? _html.slice(1, 7) : _html.slice(0, 6), 16); this.assign((n >> 16) & 255, (n >> 8) & 255, n & 255); }
    set rgb(a) { this.assign(a.red, a.green, a.blue); }
    get rgb() { return this.clone(); }
    get hsv() {
        var r = this.red / 255, g = this.green / 255, b = this.blue / 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, v = max;
        var d = max - min;
        s = max == 0 ? 0 : d / max;
        if (max == min) {
            h = 0; // achromatic
        } else {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return new ColorHSV(Math.round(h * 360), Math.round(s * 100), Math.round(v * 100));
    }

    get hsl() {
        var r = this.red / 255, g = this.green / 255, b = this.blue / 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if (max == min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return new ColorHSL(Math.round(h * 360), Math.round(s * 100), Math.round(l * 100));
    }
}

//==============================================================================================================================================================================
Color.NUM2HEX = [
    "00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0A", "0B", "0C", "0D", "0E", "0F",
    "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1A", "1B", "1C", "1D", "1E", "1F",
    "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2A", "2B", "2C", "2D", "2E", "2F",
    "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3A", "3B", "3C", "3D", "3E", "3F",
    "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4A", "4B", "4C", "4D", "4E", "4F",
    "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5A", "5B", "5C", "5D", "5E", "5F",
    "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6A", "6B", "6C", "6D", "6E", "6F",
    "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7A", "7B", "7C", "7D", "7E", "7F",
    "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8A", "8B", "8C", "8D", "8E", "8F",
    "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9A", "9B", "9C", "9D", "9E", "9F",
    "A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "AA", "AB", "AC", "AD", "AE", "AF",
    "B0", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "BA", "BB", "BC", "BD", "BE", "BF",
    "C0", "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "CA", "CB", "CC", "CD", "CE", "CF",
    "D0", "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "DA", "DB", "DC", "DD", "DE", "DF",
    "E0", "E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "EA", "EB", "EC", "ED", "EE", "EF",
    "F0", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "FA", "FB", "FC", "FD", "FE", "FF"];

//==============================================================================================================================================================================
Color.amber = Color.fromHTML("#ffc107");
Color.aqua = Color.fromHTML("#00ffff");
Color.black = Color.fromHTML("#000000");
Color.blue = Color.fromHTML("#2196F3");
Color.blueGrey = Color.fromHTML("#607d8b");
Color.brown = Color.fromHTML("#795548");
Color.cyan = Color.fromHTML("#00bcd4");
Color.darkGrey = Color.fromHTML("#616161");
Color.deepOrange = Color.fromHTML("#ff5722");
Color.deepPurple = Color.fromHTML("#673ab7");
Color.green = Color.fromHTML("#4CAF50");
Color.grey = Color.fromHTML("#bbbbbb");
Color.indigo = Color.fromHTML("#3f51b5");
Color.khaki = Color.fromHTML("#f0e68c");
Color.lightBlue = Color.fromHTML("#87CEEB");
Color.lightGreen = Color.fromHTML("#8bc34a");
Color.lightGrey = Color.fromHTML("#f1f1f1");
Color.lime = Color.fromHTML("#cddc39");
Color.orange = Color.fromHTML("#ff9800");
Color.paleBlue = Color.fromHTML("#ddffff");
Color.paleGreen = Color.fromHTML("#ddffdd");
Color.paleRed = Color.fromHTML("#ffdddd");
Color.paleYellow = Color.fromHTML("#ffffcc");
Color.pink = Color.fromHTML("#e91e63");
Color.purple = Color.fromHTML("#9c27b0");
Color.red = Color.fromHTML("#f44336");
Color.sand = Color.fromHTML("#fdf5e6");
Color.teal = Color.fromHTML("#009688");
Color.turquoise = Color.fromHTML("#1abc9c");
Color.white = Color.fromHTML("#ffffff");
Color.yellow = Color.fromHTML("#ffeb3b");
//==============================================================================================================================================================================

function HSV2RGB(h, s, v) {
    h /= 360; s /= 100; v /= 100;
    var r, g, b;
    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function RGB2HSV(r, g, b) {
    r /= 255, g /= 255, b /= 255;

    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if (max == min) {
        h = 0; // achromatic
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
}

function RGB2HSL(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function HSL2RGB(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    var r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}
