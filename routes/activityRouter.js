var express = require('express')
var router = express.Router()
var mongoose = require('mongoose');
const bodyParser = require('body-parser')
var Activity = require('../models/activities')
var Comment = require('../models/comments')
var User = require('../models/users');
var authenticate = require('../authenticate')
router.use(bodyParser.json())
const cors = require('./cors')

//Add New Activity
router.post('/add', cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
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
router.get('/:username?', cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    var token = authenticate.getToken({_id: req.user._id})
    res.setHeader('Content-Type', 'application/json')

    //find from all users if no username param sent
    if(!req.params.username) find_user = {} 
    else find_user = {username: req.params.username}

    User.findOne(find_user).then((user)=>{
        if(!user){
            res.json({success: false, token: token, status: 'Username not found' })
        } else {
            Activity.find({user: user._id}).populate('user').then((activities)=>{
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
router.post('/addComment', cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
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

module.exports = router