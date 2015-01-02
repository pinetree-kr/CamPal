var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CityRouteSchema = new Schema({
	city_id : {
		type : Schema.Types.ObjectId,
		required : true,
		ref : 'city'
	},
	line_no : {
		type : Number,
		required : true
	},
	line_order : {
		type : Number,
		required : true
	},
	names : [],
	latlng : {
		lat : Number,
		lng : Number
	},
	updated : {
		type : Date,
		default : Date.now
	}
});
module.exports = mongoose.model('cityroute', CityRouteSchema);
