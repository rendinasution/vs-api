var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')
var FileStore = require('session-file-store')(session)
var passport = require('passport')
var authenticate = require('./authenticate')
let config = require('./config')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var activitiesRouter = require('./routes/activityRouter');
const flash = require('connect-flash');

const mongoose = require('mongoose');
const { networkInterfaces } = require('os');

const url = config.mongoUrl

//added useNewUrlParser:true to prevent warning on newer mongoDB version
const connect = mongoose.connect(url,{useNewUrlParser:true})

connect.then((db) => {
  console.log('Connected correctly to server')
}, (err) => { console.log(err) })

var app = express();

app.all('*', (req, res, next) => {
  if (req.secure) {
    return next()
  } else {
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url)
  }
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize())
app.use( session({ secret: 'secret', resave: true, saveUninitialized: true }) );

app.use(flash());
app.use('/api', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/activities', activitiesRouter);

app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;