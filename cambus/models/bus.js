var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BusSchema = new Schema({
	line_id : {
		type : Schema.Types.ObjectId,
		required : true,
		ref : 'line'
	},
	company_id : {
		type : Schema.Types.ObjectId,
		required : true,
		ref : 'company'
	},
	type_id : {
		type : Schema.Types.ObjectId,
		required : true,
		ref : 'type'
	},
	mids : [String],
	price : Number,
	transfer : Boolean,
	interational : String,
	// add for reserve
	seat : Number,
	rest_area : Number,
	updated : {
		type : Date,
		default : Date.now
	}	
});
module.exports = mongoose.model('bus', BusSchema);