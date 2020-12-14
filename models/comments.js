var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Comment = new Schema({
    activity_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity",
        required: [true,'Activity ID is required']
    },
    description: {
        type: String,
        required: [true,'Comment description is required']
    },
    user:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    createdAt: {
        type: Date,
        default: new Date()
    }
})

module.exports = mongoose.model('Comments', Comment);