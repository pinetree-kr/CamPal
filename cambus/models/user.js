var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	email : {
		type : String,
		required : true
	},
	passwd : {
		type : String,
		required : true
	},
	phone_no : String,
	created : {
		type : Date,
		default : Date.now
	}
});
module.exports = mongoose.model('user', UserSchema);