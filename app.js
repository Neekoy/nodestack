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

mongoose.connect('mongodb://localhost/loginapp');
var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');

// Init App
var app = express();
var serv = require('http').Server(app);
var io = require('socket.io').listen(serv);

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

// Express Session
app.use(session({
    secret: 'the most secretive secret possible',
    saveUninitialized: true,
    resave: true,
    store: new MemcachedStore({
        hosts: ['127.0.0.1:11211'],
    })
}));

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
        console.log(res.locals.user[i]);
      }
    }
  }
  next();
});



app.use('/', routes);
app.use('/users', users);

// Set Port
app.set('port', (process.env.PORT || 3000));

serv.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});


io.sockets.on('connection', function(socket) {

    SOCKET_LIST = [];

    console.log('socket connection');

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



    socket.on('disconnect', function() {
        delete SOCKET_LIST[socket.id];
    });

});