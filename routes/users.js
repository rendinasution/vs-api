var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const proxy = require("http-proxy-middleware")
var User = require('../models/users');
var authenticate = require('../authenticate');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
var passport = require('passport');
const cors = require('./cors');
const cors2 = require('cors')

router.use(cors2())

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
  User.find({ $or: [{username: new RegExp(input, 'i')}, {firstname: new RegExp(input, 'i')}, {lastname: new RegExp(input, 'i')}, {nik: new RegExp(input, 'i')} ]}).then((users) => {
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
  res.json({status: res.statusCode, message: "You are successfully logged in!", result: {token: token, username: req.body.username,user_id: req.user._id }});
});

router.get('/getUser',cors.corsWithOptions, authenticate.verifyUser, function(req, res, next) {
  var token = authenticate.getToken({_id: req.user._id})
  
  User.findOne({'username':req.body.username}).then((user) => {
    if(!user) {
      res.statusCode = 500
      msg = 'user not found'
      success = false
    } else {
      res.StatusCode = 200
      msg = 'ok'
      success = true
      if(token._id !== user._id) authenticate.verifyAdmin
    }

    res.setHeader('Content-Type', 'application/json')
    res.json({success: success, token: token, msg: msg, userData: user})
  }).catch((err) => next(err))
})

router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
  if (req.user) {
    var token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({status: res.statusCode, message: "You are successfully logged in!", result: token});
  }
});

module.exports = router