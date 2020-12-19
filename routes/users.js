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
    res.json({ status: res.statusCode, message: "Successfully to Get All User!", result: users })
}).catch((err) => next(err));
});

router.get('/search', cors.corsWithOptions, authenticate.verifyUser, function(req, res, next) {
  input = req.body.input;
  User.find({ $or: [{username: new RegExp(input, 'i')}, {firstname: new RegExp(input, 'i')}, {lastname: new RegExp(input, 'i')}  ]}).then((users) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({ status: res.statusCode, message: "Successfully to Find Users!", result: users })
    }).catch((err) => next(err));
});

router.post('/signup', cors.corsWithOptions, (req, res) => {
  User.register(new User({firstname: req.body.firstname, lastname: req.body.lastname, username: req.body.username, nik: req.body.nik, coordinate: req.body.coordinate}),
  req.body.password,(err,user)=>{
    if(err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({status: res.statusCode, message: err.message, result: [] });
    }
    else {
      user.save((err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({status: res.statusCode, message: err.message, result: [] });
        return ;
      }
      passport.authenticate('local')(req, res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({status: res.statusCode, message: "Registration Successful!", result: user });
        });
      });
    }
  });
});

router.post('/login', cors.corsWithOptions, passport.authenticate('local', { failureFlash: 'Invalid username or password.' }), (req, res) => {
    var token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({status: res.statusCode, message: "You are successfully logged in!", result: token});
});

router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
  if (req.user) {
    var token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({status: res.statusCode, message: "You are successfully logged in!", result: token});
  }
});

module.exports = router;