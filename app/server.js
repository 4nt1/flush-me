module.exports = function () {
  var express     = require('express');
  var server      = express();
  var http        = require('http').Server(server);
  var io          = require('socket.io')(http);
  var bodyParser  = require('body-parser');
  var session     = require('express-session');

  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({
    extended: true
  }));

  server.use(session({ secret: 'thisissecret', cookie: { maxAge: 60000 }}))
  server.use(express.static('public'));

  server.get('/', function(req, res){
    res.sendFile('index.html', { root: __dirname });
  });

  server.get('/demo', function(req, res){
    res.sendFile('demo.html', { root: __dirname });
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
    if (session.users) {

    } else {
      session.users = [];
      session.users.push(userName);
    }
    io.emit('new-user', {userName: userName});
    res.json({response: userName});
  })

  io.on('connection', function(socket){

  });

  return {
    http: http,
    socket: io
  };

};