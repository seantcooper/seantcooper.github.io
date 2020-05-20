class UIVerticalLayout {
    constructor() { }
    perform(parent, displayRect) {
        var y = 0, r = parent.getClientRect(displayRect);
        for (var _control of parent._controls.where(function (t) { return t.visible })) {
            _control.performLayout(new Rect(r.x, r.y + y, _control._size.width * r.width, _control._size.height * uicss.height));
            y += _control.displayRect.height;
        }
        y > r.height && (displayRect.height += (y - r.height));
    }
}

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------
class UIHorizontalLayout {
    constructor() { }
    perform(parent, displayRect) {
        var x = 0, r = parent.getClientRect(displayRect);
        for (var _control of parent._controls.where(function (t) { return t.visible })) {
            _control.performLayout(new Rect(r.x + x, r.y, _control._size.width * uicss.width, _control._size.height * r.height));
            x += _control.displayRect.width;
        }
        x > r.width && (displayRect.width += (x - r.width));
    }
}
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------
class UIToolLayout {
    constructor() { }
    perform(parent, displayRect) {
        var x = 0, r = parent.getClientRect(displayRect);
        for (var _control of parent._controls.where(function (t) { return t.visible })) {
            var h = _control._size.height * r.height, w = this.square ? h : _control._size.width * uicss.width;
            _control.setDisplayRect(new Rect(r.x + x, r.y, w, h));
            x += w;
        }
        x > r.width && (displayRect.width += (x - r.width));
    }
}
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------
class UIFlowLayout {
    constructor() { }
    perform(parent, displayRect) {
        var x = 0, y = 0, _lineHeight = 0, r = parent.getClientRect(displayRect);
        for (var _control of parent._controls.where(function (t) { return t.visible })) {
            var _size = _control._size;
            var nr = { x: x, y: y, w: _control._size.width * r.width, h: parent._size.height * r.width * uicss.ratio };
            this.square && (nr.w = nr.h);
            if (x > 0 && x + nr.w > r.width) {
                nr.y = (y += (_lineHeight ? _lineHeight : nr.h));
                nr.x = x = _lineHeight = 0;
            }
            _control.setDisplayRect(new Rect(r.x + nr.x, r.y + nr.y, nr.w, nr.h));
            x += nr.w;
            nr.h > _lineHeight && (_lineHeight = nr.h);
        }
        _lineHeight && (y += _lineHeight);
        y > r.height && (displayRect.height += (y - r.height));
    }
}

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------
