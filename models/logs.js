var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Log = new Schema({
    user:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    check_in:   {
        type: Boolean,
        default: false
    }, 
},  {
        timestamps: true
    });

Log.plugin(passportLocalMongoose);

module.exports = mongoose.model('Log', Log);