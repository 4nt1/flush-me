module.exports = function (app) {
  var mraa = require('mraa');
  var Q = require('q');
  var isInitialized = false;
  console.log('MRAA Version: ' + mraa.getVersion());

  var light = new mraa.Aio(0);

  var lightMaxValue = 0;
  var lightMinValue = 1023;
  var calibrationIteration = 0;
  var numberOfCalibrations = 10;

  function calibrationStep() {
     var value = light.read();
     var points = [ '.', '.', '.' ].slice(0, calibrationIteration % 4).join('');
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
      console.log('done calibrating');
      console.log("MAX : " + lightMaxValue);
      console.log("MIN : " + lightMinValue);
      isInitialized = true;
      console.log('Light initialized');
  }

  waitAndRead();

  function loop(frame) {
    if (!isInitialized || frame % 10) return;
    var value = light.read();
    if (value > lightMaxValue * 0.9) {

      if (app.session.users) {
        var user = app.session.users.filter(function(o) {
          return o.status === 'notified'
        })[0];
        if (user) {
          app.session.users.splice(app.session.users.indexOf(user), 1);
          app.socket.emit('remove-user-from-queue', {userName: user.name});
        }
      }
      app.socket.emit('bulb-on');
    } else {
      if (app.session.users) {
        var user = app.session.users.filter(function(o) {
          return o.status === 'waiting'
        })[0];
        if (user) {
          user.status = 'notified';
          app.socket.emit('notify-next-user', {userName: user.name});
        }

      }
      app.socket.emit('bulb-off');
    }
  }


  return {
    loop: loop,
    destroy: null
  };
};