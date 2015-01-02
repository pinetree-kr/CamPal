var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LineSchema = new Schema({
	//_id : String,
	dept : {
		type : Schema.Types.ObjectId,
		required : true,
		ref : 'city'
	},
	dest : {
		type : Schema.Types.ObjectId,
		required : true,
		ref : 'city'
	},
	distance : Number,
	updated : {
		type : Date,
		default : Date.now
	}
});
module.exports = mongoose.model('line', LineSchema);