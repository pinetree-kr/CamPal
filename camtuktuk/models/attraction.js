var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AttractionSchema = new Schema({
	name : String,
	location : {
		lat : Number,
		lng : Number
	},
	created : Number
});
module.exports = mongoose.model('attraction', AttractionSchema);
