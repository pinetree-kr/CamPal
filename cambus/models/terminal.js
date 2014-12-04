var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TerminalSchema = new Schema({
	city_id : {
		type : Schema.Types.ObjectId,
		ref : 'city'
	},
	company_id : {
		type : Schema.Types.ObjectId,
		ref : 'company'
	},
	name : String,
	phone : [String],
	purchase : String,
	in : String,
	off : String,
	address : String,
	misc : {
		kor : String,
		eng : String,
		khm : String
	},
	latlng : {
		lat : Number,
		lng : Number
	}
});
module.exports = mongoose.model('terminal', TerminalSchema);