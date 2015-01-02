var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TimeSchema = new Schema({
	bus_id : {
		type : Schema.Types.ObjectId,
		required : true,
		ref : 'bus'
	},
	dept_t : {
		type : String,
		required : true
	},
	updated : {
		type : Date,
		default : Date.now
	}
	//dest_t : String
});
module.exports = mongoose.model('time', TimeSchema);