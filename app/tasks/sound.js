/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */

// TODO: Créer une classe Screen qui se trouve dans app
module.exports = function (app) {
    var lcd = require('../lib/lcd.js');
    var mraa = require('mraa');
    var Q = require('q');
    var display = new lcd.LCD(0);
    var SCREEN_COLUMNS = 16;
    var sound;
    var soundMaxValue = 0;
    var soundMinValue = 1023;
    var calibrationIteration = 0;
    var numberOfCalibrations = 100;
    var isInitialized = false;

    clearScreen();

    sound = new mraa.Aio(0);

    function fillText(text) {
      for (var index = text.length; index < SCREEN_COLUMNS; index++) {
        text += ' ';
      }
      return text.slice(0, SCREEN_COLUMNS);
    }

    function writeStepName(message, line) {
        display.setCursor(line || 0, 0);
        display.write(fillText(message));
    }

    function clearScreen() {
        var line = fillText('');
        display.setCursor(0,0);
        display.write(line);
        display.setCursor(1,0);
        display.write(line);
    }

    function calibrationStep() {
        var value = sound.read();
        var points = [ '.', '.', '.' ].slice(0, calibrationIteration % 4).join('');
        writeStepName("Calibrating" + points);
        writeStepName("Value: " + String(value), 1);
        soundMaxValue = Math.max(soundMaxValue, value);
        soundMinValue = Math.min(soundMinValue, value);
        if (++calibrationIteration < numberOfCalibrations) {
            return waitAndRead();
        } else {
            startApplication();
        }

    }

    function wait(time) {
        var deferred = Q.defer();
        setTimeout(deferred.resolve, time);
        return deferred.promise;
    }

    function waitAndRead() {
        return wait(20).then(calibrationStep);
    }

    function startApplication() {
        clearScreen();
        display.setCursor(0, 0);
        display.write(fillText('MAX : ' + String(soundMaxValue)));
        display.setCursor(1, 0);
        display.write(fillText('MIN : ' + String(soundMinValue)));
        wait(2000).then(writeStepName.bind(null, "Listening")).then(function () {
            isInitialized = true;
            console.log('start listening');
        });
    }

    function loop(frame) {
        if (!isInitialized) return;
        var value = sound.read();
        if (frame % 20 === 0) {
            writeStepName(String(value), 1);
        }
        if (value > 700) {
            console.log(value);
            app.destroy();
        }

    }

    function onTerminate() {
        clearScreen();
        display.setColor(0, 0, 0);
        display = null;
    }

    process.on('exit', function () {
        console.log('App terminated.');
    });
    display.setColor(255, 255, 255);
    writeStepName("Calibrating");
    waitAndRead();

    return {
        loop: loop,
        destroy: onTerminate
    };
};