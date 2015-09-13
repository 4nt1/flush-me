module.exports = function (app) {
  var mraa = require('mraa');
  var Q = require('q');
  var screen = app.screen.getChildZone(0, 1, 5);
  var isInitialized = false;
  console.log('MRAA Version: ' + mraa.getVersion());

  var light = new mraa.Aio(0);

  var lightMaxValue = 0;
  var lightMinValue = 1023;
  var calibrationIteration = 0;
  var numberOfCalibrations = 10;

  function calibrationStep() {
     var value = light.read();
     lightMaxValue = Math.max(lightMaxValue, value);
     lightMinValue = Math.min(lightMinValue, value);
     if (++calibrationIteration < numberOfCalibrations) {
         return waitAndRead();
     } else {
         startApplication();
     }
  }

  function waitAndRead() {
      return wait(100).then(calibrationStep);
  }

  function wait(time) {
     var deferred = Q.defer();
     setTimeout(deferred.resolve, time);
     return deferred.promise;
  }

  function startApplication() {
      console.log("MAX : " + lightMaxValue);
      console.log("MIN : " + lightMinValue);
      isInitialized = true;
      console.log('Light initialized');
  }

  waitAndRead();

  function loop(frame) {
    if (!isInitialized || frame % 2) return;
    var value = light.read();
    screen.write('L:' + String(value));
    if (value > lightMaxValue * 0.9) {
      app.socket.emit('bulb-on');
    } else {
      app.socket.emit('bulb-off');
    }
  }
  screen.write('L:cal');

  return {
    loop: loop,
    destroy: null
  };
};