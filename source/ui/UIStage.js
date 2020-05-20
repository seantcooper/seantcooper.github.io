class UIStage extends UIContainer {
    constructor(bgcolor) {
        super();
        bgcolor && (this.bgcolor = bgcolor);
        this.margin = this.corners = 0;
        this.canvas = new HCanvas(this.bgcolor.html);
        this.resizedRect = new Rect(0, 0, uicss.width, this.canvas.height);
        new Mouse(this.canvas.canvas, this.onMouse.bind(this));
        this.tick = 0;
    }

    get screenX() { return this.canvas.canvas.offsetLeft; }
    get screenY() { return this.canvas.canvas.offsetTop; }

    onPaint() {
        this.initialize();
        UITooltip.update();
        if (this.validated) return;
        this.tick++;
        UIStage.context = this.canvas.context2d;
        this.performLayout(this.resizedRect.clone());
        super.onPaint();
        if (this.tick > 5)[this].concat(this.descendants).forEach(function (c) { c.validate(); })
    }
    resize(w, h) {
        this.resizedRect.assign(0, 0, w, h);
        this.performLayout(this.resizedRect.clone());
    }
    performLayout(rect) {
        super.performLayout(rect);
        this.invalidate();
    }
    onMouse(e) { super.onMouse(e); }
}

var _font = "Calibri"; //`"Open Sans"`;
var _ratio = 1 / 6;
var _width = 200;

uicss = {
    bgcolor: Color.fromHTML("#333333"),
    bgcolorDark: Color.fromHTML("#222222"),
    bgcolorLight: Color.fromHTML("#444444"),
    fgcolor: Color.fromHTML("#FFFFFF"),
    buttonColor: Color.fromHTML("444444"),
    sliderColor: Color.fromHTML("fcb415"),
    selectedColor: Color.fromHTML("#0066FF"),
    hover: 0.1,
    margin: 1,
    textMargin: 4,
    width: _width,
    ratio: _ratio,
    height: Math.round(_width * _ratio),
    border: 2,
    font: "16px " + _font,
    fontMedium: "14px " + _font,
    fontSmall: "12px " + _font,
    fontTiny: "10px " + _font,
}

// uicss.bgcolor = Color.fromHTML("#333333");
// uicss.bgcolorDark = Color.fromHTML("#222222");
// uicss.bgcolorLight = Color.fromHTML("#444444");
// uicss.fgcolor = Color.fromHTML("#FFFFFF");
// uicss.buttonColor = Color.fromHTML("444444"); //"#0066FF");
// uicss.sliderColor = Color.fromHTML("fcb415"); //"#0066FF");
// uicss.selectedColor = Color.fromHTML("#0066FF"); //"#009A00");
// uicss.hover = 0.1;

// uicss.margin = 1;
// uicss.textMargin = 4;
// uicss.width = 200;//200;
// uicss.ratio = 1 / 6;
// uicss.height = Math.round(uicss.width * uicss.ratio);
// uicss.border = 2;

// //UIStage._FONT = "Verdana, Geneva, sans-serif"; // 'Abel', san-serif";
// UIStage._FONT = "'Open Sans'";
// //UIStage._FONT = "'Abel'"; // 'Abel', san-serif";
// uicss.font = "15px " + UIStage._FONT;
// uicss.fontMedium = "12px " + UIStage._FONT;
// uicss.fontSmall = "10px " + UIStage._FONT; // 'Abel', san-serif

