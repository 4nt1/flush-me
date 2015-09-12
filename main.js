var mraa = require('mraa');
var Q = require('q');
var http = require('http');
console.log('MRAA Version: ' + mraa.getVersion());

var light = new mraa.Aio(0);

var lightMaxValue = 0;
var lightMinValue = 1023;
var calibrationIteration = 0;
var numberOfCalibrations = 10;

function calibrationStep() {
   var value = light.read();
   var points = [calibrationIteration % 3 ? '.' : ' ', calibrationIteration % 2 ? '.' : ' ', calibrationIteration % 1 ? '.' : ' '];
   console.log("Calibrating" + points.join(''));
   lightMaxValue = Math.max(lightMaxValue, value);
   lightMinValue = Math.min(lightMinValue, value);
   if (++calibrationIteration < numberOfCalibrations) {
       return waitAndRead();
   } else {
       startApplication();
   }
   
}

function waitAndRead() {
    return wait(1000).then(calibrationStep);
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
    
    setInterval(function(){
        var value = light.read();
        if (value > lightMaxValue * 0.9) {
            http.get("http://lavatory.antoinemary.me/on");
            
        } else {
            http.get("http://lavatory.antoinemary.me/off");
        }
    }, 1000);
}

waitAndRead();
