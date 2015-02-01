var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	device_id : {
		type : String,
		unique : true,
		required : true
	},
	phone_no : {
		type : String,
		unique : true,
		required : true,
	},
	platform : String,
	call : {
		type : Schema.Types.ObjectId,
		ref : 'call'
	},
	token : String,
	expires : Number,
	joined : Number
});
module.exports = mongoose.model('user', UserSchema);
