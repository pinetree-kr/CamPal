var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	device_id : {
		type : String,
		required : true
	},
	phone_no : {
		type : String,
		required : true,
	},
	platform :{
		type : String,
		required:true,
	},
	facebook : {},
	tuktuk : {
		type : Boolean,
		default : false
	},
	joined : {
		type : Date,
		//default : Date.now
	}
});
module.exports = mongoose.model('user', UserSchema);
