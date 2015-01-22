var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TukTukSchema = new Schema({
	user : {
		type : Schema.Types.ObjectId,
		required : true,
		ref : 'user'
	},
	id : Number,
	name : String,
	email : String,
	gender : String,
	valid : {
		type : Boolean,
		required : true,
		default : false,
	},
	joined : Number
});
module.exports = mongoose.model('tuktuk', TukTukSchema);
