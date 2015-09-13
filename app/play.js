var exec = require('child_process').exec;
var child = null;
function playSound() {
  if (child) return;
  child = exec('gst-launch-1.0 filesrc location= /home/root/music.wav ! wavparse ! pulsesink', function () {
    console.log('sound over');
  });
}

function stopSound() {
  if (child) {
    child.kill();
    child = null;
  }
}

function isPlaying() {
  return !!child;
}

module.exports = {
  play: playSound,
  stop: stopSound,
  isPlaying: isPlaying
};