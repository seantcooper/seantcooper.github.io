//---------------------------------------------------------------------------------------------------------------------------------------------------------------------
class UISpacer extends UIControl {
    constructor(size) {
        super();
        this.size = size ? size : new Size(1, 0.1);
        this.margin = 0
        this.corners = 0;
        //this.bgcolor = Color.red; //uicss.bgcolorLight;
    }
}
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------
class UILabel extends UIControl {
    constructor(text) {
        super();
        this.text = text;
        //this.size = new Size(1, );
    }
}

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------
class UIButton extends UIControl {
    constructor(text) {
        super();
        this.text = text;
        this.buttonMode = new ButtonMode();
        this.bgcolor = uicss.buttonColor;
    }
}

class UIImageButton extends UIButton {
    constructor(image) {
        super("");
        this.image = image;
    }
}

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------
class UIListButton extends UIControl {
    constructor(text, group) {
        super();
        this.text = text;
        this.buttonMode = new ButtonModeList(group);
        this.bgcolor = uicss.buttonColor;
    }
}
class UIImageListButton extends UIListButton {
    constructor(image, group) {
        super("", group);
        this.image = image;
    }
}

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------
class UIToggleButton extends UIControl {
    constructor(text) {
        super();
        this.text = text;
        this.buttonMode = new ButtonModeToggle();
        this.bgcolor = uicss.buttonColor;
    }
}
class UIImageToggleButton extends UIToggleButton {
    constructor(image) {
        super("");
        this.image = image;
    }
}
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------
class UIContainer extends UIControl {
    constructor(layout) {
        super();
        this.margin = 0;
        this.layout = layout ? layout : new UIVerticalLayout();
    }
}

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------
class UIFlowContainer extends UIControl {
    constructor() {
        super();
        this.margin = 0;
        this.layout = new UIFlowLayout();
    }
    set square(a) { this.layout.square = a; this.invalidate(); }
    get square() { return this.layout.square; }
}

class UIToolContainer extends UIControl {
    constructor() {
        super();
        this.margin = 0;
        this.layout = new UIToolLayout();
    }
    set square(a) { this.layout.square = a; this.invalidate(); }
    get square() { return this.layout.square; }
}

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------
