var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schema = new Schema({
    email:{type: String, required: true},
    store:[{
        name: {type: String, required: true},
	    phoneNumber: {type: String, required: true},
	    address: {type: String, required: true}
    }]
});

module.exports = mongoose.model('Users', schema,'users');
