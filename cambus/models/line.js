var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LineSchema = new Schema({
	dept : {
		type : Schema.Types.ObjectId,
		ref : 'city'
	},
	dest : {
		type : Schema.Types.ObjectId,
		ref : 'city'
	},
	distnace : Number,
	updated : {
		type : Date,
		default : Date.now
	}
});
module.exports = mongoose.model('line', LineSchema);