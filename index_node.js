var express     = require('express');
var app         = express();
var http        = require('http').Server(app);
var io          = require('socket.io')(http);
var bodyParser  = require('body-parser');
var session     = require('express-session');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({ secret: 'thisissecret', cookie: { maxAge: 60000 }}))
app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendFile('index.html', { root: __dirname });
});

app.get('/demo', function(req, res){
  res.sendFile('demo.html', { root: __dirname });
});

app.get('/on', function(req, res){
  io.emit('bulb-on', { for: 'everyone' });
  res.json({response: 'true'});
});

app.get('/off', function(req, res){
  io.emit('bulb-off', { for: 'everyone' });
  res.json({response: 'true'});
});

app.post('/queue', function(req, res){
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

http.listen(3000, function(){
  console.log('listening on *:3000');
});