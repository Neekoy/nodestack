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
var Schema = mongoose.Schema;
var async = require("async");

mongoose.connect('mongodb://localhost/test');
global.db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');
var navigation = require('./routes/navigation')

// Init App
var app = express();
var serv = require('http').Server(app);
var io = require('socket.io').listen(serv);

var roomControl = require('./logic/roomcontrol');
var cardGet = require('./logic/cardget');
var registerCardModel = require('./models/cards');
global.gameUser = require('./models/gameuser');

var gameUserModel = db.model("gameUser");
var cardsGetModel = db.model("Cards");

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

    gameUserModel.find( { "username": username }, function(err, data) {
      if (err) throw err;
      socket.emit('userData', data);
    });

    if ( LOOKING_FOR_GAME.hasOwnProperty(username) ) {
      console.log("This user is ALREADY looking for a game " + username);
      LOOKING_FOR_GAME[username] = socket.id;
    };

    if ( ACTIVE_GAMES.hasOwnProperty(username) ) {
      console.log("This user is aleady in active game.");
      socket.join(ACTIVE_GAMES[username]);
      io.to(ACTIVE_GAMES[username]).emit('alert', "You have joined room" + roomName);
    };

    console.log("New socket connection from " + username + " Session ID: " + socket.id);

    socket.on('searchGame', function (data) {
      username = socket.request.session.username;
      console.log('A new game request has been submitted by ' + username);
      LOOKING_FOR_GAME[username] = socket.id;
    });

    socket.on('joinRoom', function(data) {
      roomName = data[0];

      socket.join(roomName);
      io.sockets.in(roomName).emit('alert', "You have joined room" + roomName);
    });

    socket.on('getOwnedCards', function(data) {
      var gameUserModel = db.model("gameUser");
      var cardsGetModel = db.model("Cards");
      console.log("User " + username + " wants to check their collection.");
      toSubmit = [];

      gameUserModel.find({ "username": username }, function (err, data) {
        if (err) throw err;
        toSubmit.push(data[0].ownedCards);

        cardsGetModel.find({}, function (err, data) {
          if (err) throw err;
          toSubmit.push(data);
            
          socket.emit("collectionData", toSubmit);
        });

      });
    });

    socket.on('buyCard', function(data) {
      cardInfo = [];
      userInfo = [];
      exists = false;
      toSubmit = [];
      cardsGetModel.find( { "name": data.name }, function (err, data) {
        if (err) throw err;
        cardInfo = data;
        gameUserModel.find( { "username": username }, function (err, data)  {
          if (err) throw err;
          userInfo = data;

          if ( userInfo[0].dust >= cardInfo[0].buyPrice) {
            userInfo[0].dust -= cardInfo[0].buyPrice;
            ownedCards = userInfo[0].ownedCards[0];

            async.forEach(Object.keys(ownedCards), function(item, callback) {
              if ( item === cardInfo[0].uid ) {
                userInfo[0].ownedCards[0][item] += 1;
                userInfo[0].markModified('ownedCards');
                userInfo[0].save(function (err) {
                  if (err) throw err;
                  toSubmit.push(userInfo, cardInfo);
                  console.log(toSubmit);
                  socket.emit("updateOwned", toSubmit);
                });
                exists = true;
              }
              callback();
            }, function(err) {
              if (exists === false) {
                userInfo[0].ownedCards[0][cardInfo[0].uid] = 1;
                userInfo[0].markModified('ownedCards');
                userInfo[0].save(function (err) {
                  if (err) throw err;
                  toSubmit.push(userInfo, cardInfo);
                  socket.emit("updateOwned", toSubmit);
                });                
              }
            }
            );

          } else {
            console.log("You don't have enough dust to purchase this card.");
          };
        });
      }); 
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
    socket1 = PLAYER_SOCKETS[user1];
    user2 = Object.keys(LOOKING_FOR_GAME)[1];
    socket2 = PLAYER_SOCKETS[user2];

    ACTIVE_GAMES[user1] = [roomId];
    ACTIVE_GAMES[user2] = [roomId];

    delete LOOKING_FOR_GAME[user1];
    delete LOOKING_FOR_GAME[user2];

    roomControl.newRoom(io, roomId, user1, user2);

  } else {
//    console.log("There are less than 2 people looking for a game.");
  }

},1000/1);