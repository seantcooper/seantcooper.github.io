class EventDispatcher {
    constructor(_object) {
        this.object = _object;
        this.listeners = {};
    }

    add(name, funct) {
        if (Array.isArray(name)) {
            name.forEach(function (n) { this.add(n, funct) }.bind(this));
        }
        else {
            name = name.toLowerCase();
            !this.listeners[name] && (this.listeners[name] = []);
            this.listeners[name].push(funct);
        }
    }

    remove(_name, _function) {
        _name = _name.toLowerCase();
        for (var i = this.listeners - 1; i >= 0; --i)
            this.listeners[_name][i] = _function && this.listeners.splice(i, 1);
    }

    raise(_name, _event) {
        _name = _name.toLowerCase();
        if (this.listeners[_name]) {
            !_event && (_event = {});
            _event.target = this.object;
            _event.name = _name;
            for (var _func of this.listeners[_name]) _func(_event);
        }
    }
}