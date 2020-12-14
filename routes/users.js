var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
var User = require('../models/users');
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
    res.json({success: true, token: token, status: 'You are successfully logged in!'});
  }
});

module.exports = router;