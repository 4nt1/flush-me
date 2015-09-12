var Looper = require('./app/lib/Looper.js');
var server = require('./app/server.js')();
var tasksName = [
    'light.js',
    'sound.js'
];
var tasks = {};
var app = {
    looper: new Looper(),
    socket: server.socket,
    destroy: function () {
        console.log('destroy call');
        app.looper.stop();
        var keys = Object.keys(tasks);
        for (var index in keys) {
            var taskName = keys[index];
            if (typeof tasks[taskName].destroy === 'function') {
                tasks[taskName].destroy();
                tasks[taskName] = null;
            }
        }
        app.looper.destroy();
        console.log('App terminate');
        process.exit(0);
    }
};
for (var index in tasksName) {
    var name = tasksName[index];
    console.log('load task ' + name);
    tasks[name] = require('./app/tasks/' + tasksName[index])(app);
    app.looper.add(tasks[name].loop);
}

console.log('start server');
server.http.listen(3000, function () {
    console.log('server started, start looper');
    app.looper.start();
});
