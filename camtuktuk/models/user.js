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
	platform :{
		type : String,
		required:true,
	},
	joined : {
		type : Date,
		//default : Date.now
	}
});
module.exports = mongoose.model('user', UserSchema);
