var Looper = require('./app/lib/Looper.js');
var tasksName = [
    'light.js',
    'sound.js'
];
var tasks = {};
var app = {
    looper: new Looper(),
    destroy: function () {
        looper.stop();
        var keys = Object.keys(tasks);
        for (var index in keys) {
            var taskName = keys[index];
            if (typeof tasks[taskName].destroy === 'function') {
                tasks[taskName].destroy();
                tasks[taskName] = null;
            }
        }
        console.log('App terminate');
    }
};
for (var index in tasksName) {
    var name = tasksName[index];
    tasks[name] = require('app/tasks/' + tasksName[index])(app);
    looper.add(tasks[name].loop);
}
looper.start();
