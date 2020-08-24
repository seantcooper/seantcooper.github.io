class File { constructor() { } }

File.downloadText = function (filename, text) {
    var type = "text/plain";
    var a = document.createElement("a");
    var file = new Blob([text], { type: type });
    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();
}

