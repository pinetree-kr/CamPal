var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TerminalSchema = new Schema({
	terminal_no : {
		type : Number,
		required : true
	},
	city_id : {
		type : Schema.Types.ObjectId,
		required : true,
		ref : 'city'
	},
	company_id : {
		type : Schema.Types.ObjectId,
		required : true,
		ref : 'company'
	},
	name : {
		type :String,
		required : true
	},
	phones : [String],
	purchase : Boolean,
	in : Boolean,
	off : Boolean,
	address : String,
	miscs : [],
	latlng : {
		lat : Number,
		lng : Number
	},
	updated : {
		type : Date,
		default : Date.now
	}
});
module.exports = mongoose.model('terminal', TerminalSchema);
