window.requestAnimationFrame = window.requestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.msRequestAnimationFrame
    || function (f) { return setTimeout(f, 1000 / 60) } // simulate calling code 60 

function Start(mode) {
    mode && mode.toLowerCase() == "game" ? StartGame() : StartEditor();
}

var StartEditor = function () {
    var editor = new Editor();

    var _resize = function () {
        Editor.self && Editor.self.resize(window.innerWidth, window.innerHeight);
        window.focus();
    }
    var _run = function () {
        Editor.self && Editor.self.render();
        window.requestAnimationFrame(_run);
    }

    window.addEventListener('resize', _resize, false);
    //window.requestAnimationFrame(_run);
    window.onunload = function (e) { Editor.self.closing(); };
    _resize();
    _run();
}

var StartGame = function () {
    var game = new Game();

    var _resize = function () {
        Game.self && Game.self.resize(window.innerWidth, window.innerHeight);
        window.focus();
    }
    var _run = function () {
        Game.self && Game.self.render();
        window.requestAnimationFrame(_run);
    }

    window.addEventListener('resize', _resize, false);
    window.onunload = function (e) { Game.self.closing(); };
    _resize();
    _run();
}


