var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Log = new Schema({
    user:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    check_in:   {
        type: Boolean,
        default: false,
        required: true
    },
    condition: {
        type: String,
        default: null,
        required: true
    },
    workplace: {
        type: String,
        default: null,
        required: true
    },
    coordinate: {
        type: String,
        default: null
    }
},  {
        timestamps: true
    });

Log.plugin(passportLocalMongoose);

module.exports = mongoose.model('Log', Log);
