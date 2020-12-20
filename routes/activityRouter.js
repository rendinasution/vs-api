const express = require('express');
const bodyParser = require('body-parser');
var authenticate = require('../authenticate');
var ObjectId = require('mongodb').ObjectID;
const mongoose = require('mongoose');
const cors = require('./cors');

const Logs = require('../models/logs');
const { aggregate } = require('../models/logs');

const Activity = require('../models/activities')
const Comment = require('../models/comments')
const User = require('../models/users');

const activityRouter=express.Router();
activityRouter.use(bodyParser.json());

var datetime = new Date();
var currentDate = datetime.toISOString().slice(0,10);

/* var express = require('express')
var router = express.Router()
var mongoose = require('mongoose');
const bodyParser = require('body-parser')
var authenticate = require('../authenticate')
router.use(bodyParser.json())
const cors = require('./cors') */

activityRouter.route('/checkin/:check?')
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
        just_check = false
        if(req.params.check==1) just_check = true
        responseStatus = false

        if(logs[0] && logs[0].dateCreatedAt) {
            if(logs[0].check_in == true) {
                res.statusCode = responseStatus = 409;
                res.json({status: res.statusCode, message: "You already checked in!!", result: logs})
            } else {
                if(just_check) responseStatus = 200
                else
                Logs.create({user: req.body.user, check_in: req.body.check_in, condition: req.body.condition, workplace: req.body.workplace, coordinate: req.body.coordinate})
                .then((logs) => {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json({status: res.statusCode, message: "Check-in Successfull!", result: logs})
                }, (err) => { next(err) })
                .catch((err) => { next(err)})
            }
        } else {
            if(just_check) responseStatus = 200
            else
            Logs.create({user: req.body.user, check_in: req.body.check_in, condition: req.body.condition, workplace: req.body.workplace, coordinate: req.body.coordinate})
            .then((logs) => {
              res.statusCode = responseStatus = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json({status: res.statusCode, message: "Check-in Successfull!", result: logs})
            }, (err) => { next(err) })
            .catch((err) => { next(err)})
        }
        if(just_check){
            res.statusCode = responseStatus;
            res.setHeader('Content-Type', 'application/json');
            res.json({status: responseStatus, message: "isCheckin", result: logs})
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

//Add New Activity
activityRouter.post('/add', cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    var token = authenticate.getToken({_id: req.user._id})
    res.setHeader('Content-Type', 'application/json')
    
    var new_activity = new Activity({   title: req.body.title,
                                        description: req.body.description,
                                        user: req.user._id,
                                     })

    // Save the new model instance, passing a callback
    new_activity.save(function (err) {
        if (err){
            //return handleError(err);
            res.statusCode = 500
            res.json({success: false, token: token, status: err.errors})
        } else {
            res.statusCode = 200
            res.json({success: true, token: token, status: 'New Activity Added'})
        }
    })
})

//GET All Activities
activityRouter.get('/:username?', cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    var token = authenticate.getToken({_id: req.user._id})
    res.setHeader('Content-Type', 'application/json')

    //find from all users if no username param sent
    if(!req.params.username) find_user = {} 
    else find_user = {username: req.params.username}

    User.findOne(find_user).then((user)=>{
        if(!user){
            res.json({success: false, token: token, status: 'Username not found' })
        } else {
            Activity.find({user: user._id}).sort('-createdAt').populate('user').then((activities)=>{
                if(activities){
                    res.json({success: true, token: token, status: 'ok', activities: activities })
                } else {
                    res.json({success: success, token: token, status: msg, activities: activities })
                }
            })
        }
    })
})

//Add New Comment
activityRouter.post('/addComment', cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    var token = authenticate.getToken({_id: req.user._id})
    res.setHeader('Content-Type', 'application/json')

    //check if activity id exists
    try{
        var new_comment = new Comment({     activity_id: req.body.activity_id,
                                            description: req.body.description,
                                            user: req.user._id,
                                            })

        // Save the new model instance, passing a callback
        new_comment.save(function (err,comment) {
            if (err){
                //return handleError(err);
                res.statusCode = 500
                res.json({success: false, token: token, status: err, comment: comment})
            } else {
                //push comment id to Activity collection
                activity_id = req.body.activity_id
                Activity.findByIdAndUpdate( activity_id ,{$push: { comments: comment._id }},function(err,result){
                    if(err){
                        res.statusCode = 500
                        res.json({success: false, token: token, status: err, result: result})
                    } else {
                        res.statusCode = 200
                        res.json({success: true, token: token, status: 'New Comment Added'})
                    }
                })
            }
        })        
    } catch(err) {
        res.statusCode = 500
        res.json({success: false, token: token, status: err, catched: true})
    }    
})

module.exports = activityRouter