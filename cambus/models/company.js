var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CompanySchema = new Schema({
	name : String
});
module.exports = mongoose.model('company', CompanySchema);