//==============================================================================================================================================================================
class History {
    constructor() {
        this.states = [];
        this.stateIndex = 0;
    }
    addState(type, object) {
        var state = null;
        switch (type) {
            case "map": state = new VXStateMap(object); break;
            case "palette": state = new VXStatePalette(object); break;
        }
        if (state) {
            this.states.length >= this.stateIndex && (this.states.length = this.stateIndex);
            this.states.push(state);
            this.stateIndex = this.states.length;
        }
    }
    undo() {
        if (this.stateIndex) {
            --this.stateIndex;
            this.states[this.stateIndex].undo();
        }
    }
    redo() {
        if (this.stateIndex < this.states.length) {
            this.states[this.stateIndex].redo();
            this.stateIndex++;
        }
    }
}

//==============================================================================================================================================================================
class VXState {
    constructor(object) {
        this.object = object;
        this.undoState = this.getState();
    }
    undo() {
        !this.redoState && (this.redoState = this.getState());
        this.setState(this.undoState)
    }
    redo() { this.setState(this.redoState); }
    setState(state) { }
}

//==============================================================================================================================================================================
class VXStateMap extends VXState {
    constructor(map) { super(map); }
    getState() {
        return Map3Shape.fromMap(this.object);
    }
    setState(currentState) {
        this.object.resize(currentState.size.x, currentState.size.y, currentState.size.z);
        currentState.drawToMap(this.object);
    }
}

//==============================================================================================================================================================================
class VXStatePalette extends VXState {
    constructor(palette) { super(palette) }
    getState() {
        var state = this.object.colors.select(function (color) { return color.clone() });
        trace(state);
        return state;
    }
    setState(currentState) {
        trace("setState", currentState);
        this.object.setColors(currentState);
    }
}

//==============================================================================================================================================================================
