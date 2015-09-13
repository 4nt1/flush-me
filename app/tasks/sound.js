/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */

module.exports = function (app) {
    var lcd = require('../lib/lcd.js');
    var mraa = require('mraa');
    var music = require('../play.js');
    var Q = require('q');
    var screen = app.screen.getChildZone(0, 0, 5);
    var sound;
    var soundMaxValue = 0;
    var soundMinValue = 1023;
    var calibrationIteration = 0;
    var numberOfCalibrations = 100;
    var isInitialized = false;

    sound = new mraa.Aio(1);

    function calibrationStep() {
        var value = sound.read();
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
        screen.write('S:cal');
        return wait(20).then(calibrationStep);
    }

    function startApplication() {
        wait(2000).then(function () {
            isInitialized = true;
            console.log('Sound initialized');
        });
    }

    function loop(frame) {
        if (!isInitialized) return;
        var value = sound.read();
        screen.write('S:' + String(value));
        if (value > 700 && !music.isPlaying()) {
            console.log(value);
            music.play();
            wait(10000).then(music.stop);
        }

    }

    function onTerminate() {
        screen = null;
    }

    screen.write('S:cal');
    waitAndRead();

    return {
        loop: loop,
        destroy: onTerminate
    };
};