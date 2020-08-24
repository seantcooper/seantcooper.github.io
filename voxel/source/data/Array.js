
Array.prototype.first = function () { return this.length > 0 ? this[0] : null; }
Array.prototype.last = function () { return this.length > 0 ? this[this.length - 1] : null; }

Array.prototype.select = function (_func) {
    var _ret = []; for (var _element of this) _ret.push(_func(_element)); return _ret;
}

Array.prototype.selectMany = function (_func) {
    var _ret = []; for (var _element of this) _ret.push.apply(_ret, _func(_element)); return _ret;
}

Array.prototype.where = function (_func) {
    var _ret = []; for (var _element of this) _func(_element) && _ret.push(_element); return _ret;
}

Array.prototype.sum = function (_func) {
    var _total = 0; for (var _element of this) _total += _func(_element); return _total;
}

Array.prototype.any = function (_func) {
    for (var _element of this) if (_func(_element)) return true; return false;
}
Array.prototype.all = function (_func) {
    for (var _element of this) if (!_func(_element)) return false; return true;
}

Array.prototype.compare = function (array) {
    if (this.length == array.length) {
        var diff = [];
        for (var i = 0; i < this.length; i++) {
            if (this[i] != array[i])
                diff.push(i);
        }
        return diff;
    }
}

Array.prototype.RLEncode = function () {
    var data = [];
    for (var i = 0, n = this.length; i < n; i++) {
        for (var j = i, v = this[i]; i < n && v == this[i]; i++);
        data.push(i - j, v);
        --i;
    }
    return data;
}

Array.prototype.RLDecode = function () {
    var data = new Array();
    for (var i = 0, n = this.length; i < n; i += 2)
        for (var j = this[i + 0], v = this[i + 1]; j; data.push(v), --j);
    return data;
}