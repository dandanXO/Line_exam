var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schema = new Schema({
    name:{type: String, required: true},
    password:{type: String, required: true},
    admin:{type:Boolean,required: true}
});

module.exports = mongoose.model('Admin', schema,'admin');
