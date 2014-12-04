var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MemoSchema = new Schema({
	contents : {
		type : String
	},
	author : {
		type : String
	},
	created: {
		type : Date,
		default : Date.now
	}
});

module.exports = mongoose.model('memo', MemoSchema);
