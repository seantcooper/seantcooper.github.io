//----------------------------------------------------------------------------------------------------------------------------------------------------------------
class Dictionary {
    constructor() {
        this.items = {};
        this.length = 0;
    }

    [Symbol.iterator]() { return this.values; }

    get keys() { return this._keys ? this._keys : this._keys = Object.keys(this.items); }
    get values() { return this._values ? this._values : this._values = Object.values(this.items); }

    //if (this[key]) return;
    add(key, value) {
        if (arguments.length == 1) {
            value = arguments[0];
            key = value.key;
        }
        if (this.items[key] == null) {
            this.items[key] = this[key] = value;
            this.length++;
            this.invalidate();
        }
    }
    replace(key, value) {
        this.items[key] = this[key] = value;
        this.invalidate();
    }
    remove(key) {
        delete this[key];
        delete this.items[key];
        this.length--;
        this.invalidate();
    }
    clear() {
        for (var key of this.keys) delete this[key];
        this.items = {};
        this.invalidate();
    }
    containsKey(key) { return this.items[key] ? true : false; }
    invalidate() { this._values = this._keys = null; }
}
//----------------------------------------------------------------------------------------------------------------------------------------------------------------
class StaticDictionary {
    constructor() { this.values = []; }
    //[Symbol.iterator]() { return this.values; }
    get length() { return this.values.length; };
    add(key, value) {
        if (arguments.length == 1) {
            value = arguments[0];
            key = value.key;
        }
        this[key] == null && this.values.push(this[key] = value);
    }
    containsKey(key) { return this[key] ? true : false; }
}
//----------------------------------------------------------------------------------------------------------------------------------------------------------------
