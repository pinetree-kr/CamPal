var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TukTukSchema = new Schema({
	user : {
		type : Schema.Types.ObjectId,
		required : true,
		ref : 'user'
	},
	latlng : {
		lat : Number,
		lng : Number
	},
	call : {
		type : Schema.Types.ObjectId,
		ref : 'call'
	},
	name : String,
	valid : {
		type : Boolean,
		required : true,
		default : false,
	},
	joined : Number,
	/*/
	id : Number,
	email : String,
	gender : String,
	/**/
});
module.exports = mongoose.model('tuktuk', TukTukSchema);
