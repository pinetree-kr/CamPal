var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TukTukSchema = new Schema({
	name : String,
	user : {
		type : Schema.Types.ObjectId,
		required : true,
		ref : 'user'
	},
	latlng : {},
	/*/
	// 수락한 콜 정보
	call : {
		type : Schema.Types.ObjectId,
		ref : 'call'
	},
	/**/
	// 가입 요청시 대기중
	valid : {
		type : Boolean,
		required : true,
		default : false,
	},
	joined : Number,
});
module.exports = mongoose.model('tuktuk', TukTukSchema);
