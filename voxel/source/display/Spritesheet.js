class SpriteSheet {
    constructor(image, width, height) {
        this.image = image;
        this.sheetWidth = this.image.width;
        this.sheetHeight = this.image.height;
        this.width = width;
        this.height = height;
    }

    getImage(_index) {
        if (this.sheetWidth) {
            var w = Math.floor(this.sheetWidth / this.width);
            var y = Math.floor(_index / w) * this.height;
            var x = (_index % w) * this.width;
            return { image: this.image, x: x, y: y, width: this.width, height: this.height };
        }
        return null;
    }

    getPalette64(_index) {
        if (this.sheetWidth) {
            var image = this.getImage(_index);
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image.image, 0, 0, image.width, image.height, image.x, image.y, image.width, image.height);

            var colors = [], html = [];

            // 8x8 grid - center points
            for (var y = 0; y < 8; y++) {
                var iy = Math.floor(y * (image.height / 8) + image.height / 16);
                for (var x = 0; x < 8; x++) {
                    var ix = Math.floor(x * (image.width / 8) + image.width / 16);
                    var data = context.getImageData(ix, iy, 1, 1).data;
                    colors.push(new Color(data[0], data[1], data[2]));
                    html.push("new Color(" + data[0] + "," + data[1] + "," + data[2] + ")");
                }
            }
            trace(html.join(","));
            return colors;
        }
    }

    getLinearPalette() {
        if (this.sheetWidth) {
            var image = this.getImage(0);
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            canvas.width = image.width; canvas.height = image.height;
            context.drawImage(image.image, 0, 0, image.width, image.height, image.x, image.y, image.width, image.height);

            var groups = [], colors;
            for (var x = 0; x < image.width; x++) {
                var data = context.getImageData(x, 0, 1, image.height).data;
                groups.push(colors = []);
                for (var i = 0, p = 0; i < image.height; colors.push(new Color(data[p + 0], data[p + 1], data[p + 2])), i++ , p += 4);
            }
            return groups;
        }
    }
}