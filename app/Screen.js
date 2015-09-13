var LCD = require('./lib/lcd.js').LCD;

module.exports = function () {
    function Screen(id) {
        var zone = zone || { x: 0, y: 0, width: 16, height: 2 };
        this.lcd = Screen.isLCD(id) ? id : new LCD(id);
        this.x = zone.x;
        this.y = zone.y;
        this.width = zone.width;
        this.height = zone.height;
        this.isRoot = true;
        this.screenState = [this.fillText('').split(''), this.fillText('').split('')];
    }

    Screen.isScreen = function isScreen(screen) {
        return screen && screen instanceof Screen;
    };

    Screen.isLCD = function isLCD(lcd) {
        return lcd && lcd instanceof LCD;
    };

    var proto = Screen.prototype;

    proto.clear = function clear() {
        for (var y = this.y; y < this.height; y++) {
            var line = '';
            for (var x = this.x; x < this.width; x++) {
                line += ' ';
            }
            this.write(line);
        }
    };

    proto.fillText = function fillText(text) {
        for (var x = text.length; x < this.width; x++) {
            text += ' ';
        }
        return text.slice(0, this.width);
    };

    proto.setCursor = function setCursor(x, y) {
        if (!this.contains(x, y)) {
            throw new Error('OutOfScreenBoundsException');
        }
        console.log('move cursor to %s, %s', x, y);
        return this.lcd.setCursor(x, y);
    };

    proto.write = function write(text) {
        return this.lcd.write(this.fillText(text));
    };

    proto.commit = function commit() {
        this.lcd.setCursor(0,0);
        this.lcd.write(this.screenState[0].join(''));
        this.lcd.setCursor(1,0);
        this.lcd.write(this.screenState[1].join(''));
    };

    proto.getChildZone = function getChildZone(x, y, cols) {
        if (!this.contains(x, y) || !this.contains(cols, 1)) {
            console.log('try to create child with { x: %s, y: %s, width: %s, height: %s } on screen { x: %s, y: %s, width: %s, height: %s }', x, y, cols, 1, this.x, this.y, this.width, this.height);
            throw new Error('OutOfScreenBoundsException');
        }
        return new ScreenChild(this.lcd, { x: x, y: y, width: cols, height: 1 }, this);
    };

    proto.contains = function contains(x, y) {
        return x >= this.x && x <= this.width && y >= this.y && y <= this.height;
    };

    function ScreenChild(id, zone, parent) {
        this.x = zone.x;
        this.y = zone.y;
        this.width = zone.width;
        this.height = zone.height;
        if (!Screen.isScreen(parent)) {
            throw new Error('ScreenChild must have a parent')
        }
        this.parent = parent;
    }

    ScreenChild.prototype = Object.create(Screen.prototype);

    delete ScreenChild.prototype.setCursor;
    delete ScreenChild.prototype.getChildZone;

    ScreenChild.prototype.write = function write(text) {
        var line = this.parent.screenState[this.y];
        var args = [this.x, this.width];
        args.push.apply(args, this.fillText(text).split(''));
        line.splice.apply(line, args);
    };

    return Screen;
};

