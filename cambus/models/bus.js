var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BusSchema = new Schema({
	line_id : {
		type : Schema.Types.ObjectId,
		ref : 'line'
	},
	company_id : {
		type : Schema.Types.ObjectId,
		ref : 'company'
	},
	type_id : {
		type : Schema.Types.ObjectId,
		ref : 'type'
	},
	mid_id : {
		type : Schema.Types.ObjectId,
		ref : 'city'
	},
	duration : Number,
	native : Number,
	foreign : Number,
	visa : Number,
	abroad : Boolean,
	// add for reserve
	seat : Number,
	updated : {
		type : Date,
		default : Date.now
	}	
});
module.exports = mongoose.model('bus', BusSchema);