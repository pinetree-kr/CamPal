var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CitySchema = new Schema({
	name : String,
	pref : Boolean,
	index : Number
});
module.exports = mongoose.model('city', CitySchema);