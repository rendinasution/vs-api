const express = require('express');
const bodyParser = require('body-parser');
var authenticate = require('../authenticate');
var ObjectId = require('mongodb').ObjectID;
const mongoose = require('mongoose');
const cors = require('./cors');

const Logs = require('../models/logs');
const { aggregate } = require('../models/logs');

const activityRouter=express.Router();
activityRouter.use(bodyParser.json());

var datetime = new Date();
var currentDate = datetime.toISOString().slice(0,10);


activityRouter.route('/checkin')
.post(authenticate.verifyUser, (req, res, next) => {
    req.body.user = req.user._id;
    req.body.check_in = true;
    Logs.aggregate([
        {
            $match:
            {
                user: req.body.user
            }
        },
        {
            $project:
            {
                user: 1,
                check_in: 1,
                condition: 1,
                workplace: 1,
                coordinate: 1,
                dateCreatedAt: { $substr: [ "$createdAt", 0, 10]},
                timeCreatedAt: { $substr: [ "$createdAt", 12, 19]},

            }
        },
        {
            $match:
            {
                dateCreatedAt: currentDate
            }
        },
        {
            $limit: 1
        }
    ])
    .then((logs) => {
        if(logs[0] && logs[0].dateCreatedAt) {
            if(logs[0].check_in == true) {
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
    Logs.aggregate([
        {
            $match:
            {
                user: req.body.user
            }
        },
        {
            $project:
            {
                user: 1,
                check_in: 1,
                condition: 1,
                workplace: 1,
                coordinate: 1,
                dateCreatedAt: { $substr: [ "$createdAt", 0, 10]},
                timeCreatedAt: { $substr: [ "$createdAt", 12, 19]},

            }
        },
        {
            $match:
            {
                dateCreatedAt: currentDate,
                check_in: false
            }
        },
        {
            $limit: 1
        }
    ])
    .then((logs) => {
        if(logs[0] && logs[0].dateCreatedAt) {
            if(logs[0].check_in == false) {
                res.statusCode = 409;
                res.json({status: res.statusCode, message: "You already checked out!!", result: logs})
            } else {
                Logs.create({user: req.body.user, check_in: req.body.check_in, condition: req.body.condition, workplace: req.body.workplace, coordinate: req.body.coordinate})
                .then((logs) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({status: res.statusCode, message: "Check-Out Successfull!", result: logs})
                }, (err) => { next(err) })
                .catch((err) => { next(err)})
            }
        } else {
            Logs.create({user: req.body.user, check_in: req.body.check_in, condition: req.body.condition, workplace: req.body.workplace, coordinate: req.body.coordinate})
            .then((logs) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({status: res.statusCode, message: "Check-out Successfull!", result: logs})
            }, (err) => { next(err) })
            .catch((err) => { next(err)})
        }
    }, (err) => {next(err)})
    .catch((err) => {next(err)})
});

module.exports=activityRouter;