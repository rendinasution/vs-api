const express = require('express');
const bodyParser = require('body-parser');
var authenticate = require('../authenticate');
var ObjectId = require('mongodb').ObjectID;
const mongoose = require('mongoose');
const cors = require('./cors');

const Logs = require('../models/logs');

const activityRouter=express.Router();
activityRouter.use(bodyParser.json());

var datetime = new Date();
var currentDate = datetime.getDate();


activityRouter.route('/checkin')
.post(authenticate.verifyUser, (req, res, next) => {
    req.body.user = req.user._id;
    req.body.check_in = true;
    Logs.findOne({user: req.body.user})
    .then((logs) => {
        createdDate = logs.createdAt.getDate();
        if(logs) {
            if(logs.check_in == true && createdDate == currentDate) {
                res.statusCode = 409;
                res.json({status: res.statusCode, message: "You already checked in!!", result: logs})
            } else {
                Logs.create({user: req.body.user, check_in: req.body.check_in, condition: req.body.condition, workplace: req.body.workplace, coordinate: req.body.coordinate})
                .then((logs) => {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json({status: res.statusCode, message: "Check-in Successfull!", result: logs})
                }, (err) => { next(err) })
                .catch((err) => { next(err)})
            }
        } else {
            Logs.create({user: req.body.user, check_in: req.body.check_in, condition: req.body.condition, workplace: req.body.workplace, coordinate: req.body.coordinate})
            .then((logs) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json({status: res.statusCode, message: "Check-in Successfull!", result: logs})
            }, (err) => { next(err) })
            .catch((err) => { next(err)})
        }
    }, (err) => {next(err)})
    .catch((err) => {next(err)})
});

activityRouter.route('/checkout')
.post(authenticate.verifyUser, (req, res, next) => {
    req.body.user = req.user._id;
    req.body.check_in = false;
    Logs.findOne({user: req.body.user, createdAt: currentDate})
    .then((logs) => {
        createdDate = logs.createdAt.getDate();
        if(logs){
            console.log(logs.check_in);
            if(logs.check_in == false) {
                res.statusCode = 409;
                res.json({status: res.statusCode, message: "You already checked out!", result: []});
            } else if(logs.check_in == true && createdDate == currentDate){
                console.log("1");
                Logs.create({user: req.body.user, check_in: req.body.check_in, condition: req.body.condition, workplace: req.body.workplace, coordinate: req.body.coordinate})
                .then((logs) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({status: res.statusCode, message: "Check Out Successfull!", result: logs})
                }, (err) => { next(err) })
                .catch((err) => { next(err)})
            }
        }
        else {
            res.statusCode = 404;
            res.json({status: res.statusCode, message: "You are never checked in!", result: []});
            }
    }, (err) => {next(err)})
    .catch((err) => {next(err)})
});

module.exports=activityRouter;