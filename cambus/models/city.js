var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CitySchema = new Schema({
	name : {
		type : String,
		required : true
	},
	pref : Boolean,
	index : Number,
	updated : {
		type : Date,
		default : Date.now
	}
});
module.exports = mongoose.model('city', CitySchema);
