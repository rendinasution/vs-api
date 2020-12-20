var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Activity = new Schema({
    title: {
        type: String,
        required: [true,'Activity title is required']
    },
    description: {
        type: String,
        default: ''
    },
    user:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ,
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comments"
    }],
    images: [],
    status: {
        //available status : todo,done,drop
        type: String,
        default: 'todo'
    },
    progress: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: new Date()
    }
})

module.exports = mongoose.model('Activity', Activity)