module.exports = function () {
  var express     = require('express');
  var server      = express();
  var http        = require('http').Server(server);
  var io          = require('socket.io')(http);
  var bodyParser  = require('body-parser');
  var session     = require('express-session');
  var exphbs      = require('express-handlebars');

  server.engine('handlebars', exphbs({defaultLayout: 'main'}));
  server.set('view engine', 'handlebars');
  server.set('views',  __dirname + '/views');

  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({
    extended: true
  }));

  server.use(session({ secret: 'thisissecret', cookie: { maxAge: 60000 }}))
  session.users = [];

  server.use(express.static('../public'));

  server.get('/', function(req, res){
    // res.sendFile('views/index.html', { root: __dirname });
    res.render('index', {layout: false, users: session.users});
  });

  server.get('/on', function(req, res){
    io.emit('bulb-on', { for: 'everyone' });
    res.json({response: 'true'});
  });

  server.get('/off', function(req, res){
    io.emit('bulb-off', { for: 'everyone' });
    res.json({response: 'true'});
  });

  server.post('/queue', function(req, res){
    var userName = req.body.userName;
    if (session.users.indexOf(userName) === -1) {
      var user = {status: 'waiting', name: userName};
      session.users.push(user);
      io.emit('new-user', {userName: userName});
      res.json({response: 'true'});
    } else {
      res.json({response: 'false'});
    }
  });

  return {
    http: http,
    socket: io,
    session: session
  };

};