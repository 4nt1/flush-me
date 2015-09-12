function Looper() {
  this.isRunning = false;
  this.run = _.bind(Looper.prototype.run, this);
  this.frame = -1;
  this.timeoutId = null;
  this.callbacks = [];
}
module.exports = Looper;

Looper.prototype.destroy = function () {
  this.stop();
  this.callbacks.length = 0;
  this.run = this.callbacks = null;
};

Looper.prototype.start = function () {
  if (!this.isRunning && this.timeoutId === null) this.loop();
  this.isRunning = true;
};

Looper.prototype.stop = function () {
  this.isRunning = false;
  if (typeof this.timeoutId === 'number') {
    clearTimeout(this.timeoutId);
    this.timeoutId = null;
  }
};

Looper.prototype.add = function (callback, context, options) {
  options = options || {};
  if (typeof callback === 'function') {
    this.callbacks.push({
      'callback': callback,
      'context': context,
      'once': options.once || false
    });
  }
};

Looper.prototype.addOnce = function (callback, context) {
  this.add(callback, context, { 'once': true });
};

Looper.prototype.stackSize = function () {
  return this.callbacks.length;
};

Looper.prototype.remove = function (callback, context) {
  var
    finder = _.identity,
    countRemoved = 0,
    valuesToRemove = [];
  if (callback && context) {
    finder = function (item) {
      return callback === item.callback && context === item.context;
    };
  } else if (callback) {
    finder = function (item) {
      return callback === item.callback;
    }
  } else {
    finder = function (item) {
      return context === item.context;
    }
  }
  valuesToRemove = _.filter(this.callbacks, finder);
  for (var index in valuesToRemove) {
    countRemoved += this.callbacks.splice(this.callbacks.indexOf(valuesToRemove[index]), 1).length;
  }
  return countRemoved;
};

Looper.prototype.loop = function () {
  this.timeoutId = setTimeout(this.run, 10);
};

Looper.prototype.run = function (totaltime) {
  this.frame++;
  var callbacks = this.callbacks;
  for (var index in callbacks) {
    callbacks[index].callback.call(callbacks[index].context, this.frame);
  }
  if (this.isRunning) this.loop();
};