var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
var User = require('../models/users');
var Logs = require('../models/logs');
var authenticate = require('../authenticate');
router.use(bodyParser.json());
var passport = require('passport');
const cors = require('./cors');

/* GET users listing. */
router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function(req, res, next) {
  User.find({}).then((users) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({ users: users })
}).catch((err) => next(err));
});

router.post('/signup', cors.corsWithOptions, (req, res, next) => {
  process.on('uncaughtException', function (err) {
    console.log(err);
  }); 
  User.register(new User({username: req.body.username}),
  req.body.password,(err,user)=>{
    if(err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }
    else {
      if (req.body.firstname)
        user.firstname = req.body.firstname;
      if (req.body.lastname)
        user.lastname = req.body.lastname;
      if (req.body.nik)
        user.nik = req.body.nik;
      user.save((err, user) => {
      if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});
          return ;
        }
      passport.authenticate('local')(req, res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: 'Registration Successful!'});
      });
    });
  }
  });
});

router.post('/login', cors.corsWithOptions, passport.authenticate('local'), (req, res) => {

  var token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token: token, status: 'You are successfully logged in!'});
});

router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
  if (req.user) {
    var token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'You are successfully logged in!'});
  }
});

router.post('/checkin', cors.corsWithOptions, authenticate.verifyUser, authenticate.normalUser, (req, res, next) => {

  req.body.user = req.user._id
  req.body.check_in = true
  Logs.findOne({user: req.body.user})
  .then((logs) => {
      console.log(logs)
      if(logs) {
          if(logs.check_in == true) {
              res.statusCode = 409
              res.end('You already checked in!')
          } else {
              Logs.create({user: req.body.user, check_in: req.body.check_in})
              .then((logs) => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(logs)
              }, (err) => { next(err) })
              .catch((err) => { next(err)})
          }
      } else {
          Logs.create({user: req.body.user, check_in: req.body.check_in})
          .then((logs) => {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.json(logs)
          }, (err) => { next(err) })
          .catch((err) => { next(err)})
      }
  }, (err) => {next(err)})
  .catch((err) => {next(err)})
})

router.post('/checkout', cors.corsWithOptions, authenticate.verifyUser, authenticate.normalUser, (req, res, next) => {

  req.body.user = req.user._id
  req.body.check_in = false
  Logs.findOne({user: req.body.user})
  .then((logs) => {
      console.log(logs)
      if(logs) {
          if(logs.check_in == false) {
              res.statusCode = 409
              res.end('You already checked in!')
          } else {
              Logs.create({user: req.body.user, check_in: req.body.check_in})
              .then((logs) => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(logs)
              }, (err) => { next(err) })
              .catch((err) => { next(err)})
          }
      } else {
          Logs.create({user: req.body.user, check_in: req.body.check_in})
          .then((logs) => {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.json(logs)
          }, (err) => { next(err) })
          .catch((err) => { next(err)})
      }
  }, (err) => {next(err)})
  .catch((err) => {next(err)})
})

module.exports = router;