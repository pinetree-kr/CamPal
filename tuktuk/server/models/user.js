var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	phone_no : {
		type : String
	},
	device_id : {
		type : String
	},
	platform :{
		type : String
	},
	created : {
		type : Date,
		default : Date.now
	}
});

module.exports = mongoose.model('user', UserSchema);
