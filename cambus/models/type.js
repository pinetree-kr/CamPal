var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TypeSchema = new Schema({
	name : {
		type: String,
		required : true
	},
	updated : {
		type : Date,
		default : Date.now
	}
});
module.exports = mongoose.model('type', TypeSchema);