var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
var MemcachedStore = require('connect-memcached')(session);
var uuid = require('node-uuid');


mongoose.connect('mongodb://localhost/loginapp');
var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');
var navigation = require('./routes/navigation')

// Init App
var app = express();
var serv = require('http').Server(app);
var io = require('socket.io').listen(serv);

var roomControl = require('./logic/roomcontrol');

// Declare the Express session
var sessionMiddleware = session({
    secret: 'the most secretive secret possible',
    saveUninitialized: true,
    resave: true,
    store: new MemcachedStore({
        hosts: ['127.0.0.1:11211'],
    })
});

// Express session middleware for Socket.io
io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

// Initialise the Express Session
app.use(sessionMiddleware);

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  if (res.locals.user) {
    for (var i in res.locals.user) {
      if (i === 'username') {
        req.session.username = res.locals.user[i];
      }
    }
  }
  next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/', navigation);

// Set Port
app.set('port', (process.env.PORT || 3001));

// Start the Server
serv.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});

SOCKET_LIST = {};
global.ACTIVE_GAMES = {};
global.PLAYER_SOCKETS = {};
LOOKING_FOR_GAME = {};

io.sockets.on('connection', function(socket) {

    username = socket.request.session.username;
    sessionid = socket.request.sessionID;

    PLAYER_SOCKETS[username] = socket.id;

    if ( LOOKING_FOR_GAME.hasOwnProperty(username) ) {
      console.log("This user is looking for a game " + username);
      LOOKING_FOR_GAME[username] = socket.id;
    };

    if ( ACTIVE_GAMES.hasOwnProperty(username) ) {
      socket.join(ACTIVE_GAMES[username]);
    };

    console.log("New socket connection from " + username + "\n Socket Session ID: " + socket.id);

    findCard = function(cardName) {
        db.cards.find({ name : cardName }).toArray(function(err, result) {
            if (err) {
                console.log(err);
            } else if (result.length) {
                socket.emit('serverMsg', result);
            } else
                console.log("No results found.");
        });
    };

    socket.on('searchGame', function (data) {
      username = socket.request.session.username;
      console.log('A new game request has been submitted by ' + username);
      LOOKING_FOR_GAME[username] = socket.id;
      console.log(Object.keys(LOOKING_FOR_GAME));
    });

    socket.on('joinRoom', function(data) {
      roomName = data[0];

      socket.join(roomName);
      io.sockets.in(roomName).emit('alert', "You have joined room" + roomName);
    });

    socket.on('chatMessage', function(data) {
      messageContent = [];
      console.log(username);
      console.log(data);
      messageContent.push(username);
      messageContent.push(data);
      io.sockets.emit('newChatMessage', messageContent);
    });


    socket.on('disconnect', function() {
        delete SOCKET_LIST[socket.id];
    });

});

// Looking for Game check loop
setInterval(function() {
  if ( Object.keys(LOOKING_FOR_GAME).length > 1 ) {
    console.log("There are at least 2 players looking for a game");

    roomId = uuid.v4();

    user1 = Object.keys(LOOKING_FOR_GAME)[0];
    socket1 = LOOKING_FOR_GAME[user1];
    user2 = Object.keys(LOOKING_FOR_GAME)[1];
    socket2 = LOOKING_FOR_GAME[user2];

    gameFoundInfo = [];
    gameFoundInfo.push(roomId, user1, user2);

    console.log("Socket that the message will be submitted to " + socket1 + " " + socket2);
    io.to(socket1).emit("gameFound", gameFoundInfo);
    io.to(socket2).emit("gameFound", gameFoundInfo);

    ACTIVE_GAMES[user1] = [roomId];
    ACTIVE_GAMES[user2] = [roomId];

    roomControl.newRoom(io, roomId, user1, user2);

    delete LOOKING_FOR_GAME[user1];
    delete LOOKING_FOR_GAME[user2];
  } else {
//    console.log("There are less than 2 people looking for a game.");
  }

},1000/1);


