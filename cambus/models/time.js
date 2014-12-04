var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TimeSchema = new Schema({
	bus_id : {
		type : Schema.Types.ObjectId,
		ref : 'bus'
	},
	dept_t : String,
	dest_t : String
});
module.exports = mongoose.model('time', TimeSchema);