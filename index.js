var Looper = require('./app/lib/Looper.js');
var Screen = require('./app/Screen.js')();
var server = require('./app/server.js')();
var tasksName = [
    'light.js',
    'sound.js'
];
var tasks = {};
var app = {
    screen: new Screen(0),
    looper: new Looper(),
    socket: server.socket,
    session:  server.session,
    destroy: function () {
        console.log('App is terminating');
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
        process.exit(0);
    }
};
for (var index in tasksName) {
    var name = tasksName[index];
    console.log('load task ' + name);
    tasks[name] = require('./app/tasks/' + tasksName[index])(app);
    app.looper.add(tasks[name].loop);
}
app.looper.add(app.screen.commit, app.screen);

console.log('start server');
server.http.listen(3000, function () {
    console.log('server started, start looper');
    app.session.users = [];
    app.looper.start();
});

