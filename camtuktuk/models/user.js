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
	// 요청한 콜 정보
	call : {
		type : Schema.Types.ObjectId,
		ref : 'call'
	},
	tuktuk : {
		type : Schema.Types.ObjectId,
		ref : 'tuktuk'
	},
	token : String,
	expires : Number,
	joined : Number
});
module.exports = mongoose.model('user', UserSchema);
