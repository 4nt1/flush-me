module.exports = function (app) {
  var mraa = require('mraa');
  var Q = require('q');
  var screen = app.screen.getChildZone(0, 1, 5);
  var isInitialized = false;

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
    if (!isInitialized || frame % 10) return;
    var value = light.read();
    screen.write('L:' + String(value));
    if (value > lightMaxValue * 0.9) {

      if (app.session.users) {
        var user = app.session.users.filter(function(o) {
          return o.status === 'notified'
        })[0];
        if (user) {
          app.session.users.splice(app.session.users.indexOf(user), 1);
          console.log('remove user ' + user.name);
          app.socket.emit('remove-user-from-queue', {userName: user.name});
        }
      }
      app.socket.emit('bulb-on');

    } else {
      if (app.session.users) {

        var notifiedUsers = app.session.users.filter(function(o) {
          return o.status === 'notified'
        });

        if (notifiedUsers.length === 0) {
          var user = app.session.users.filter(function(o) {
            return o.status === 'waiting'
          })[0];
          if (user) {
            user.status = 'notified';
            console.log('notify user ' + user.name);
            app.socket.emit('notify-next-user', {userName: user.name});
          }

        }

      }
      app.socket.emit('bulb-off');
    }
  }
  screen.write('L:cal');

  return {
    loop: loop,
    destroy: null
  };
};