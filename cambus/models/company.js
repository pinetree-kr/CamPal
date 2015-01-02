var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CompanySchema = new Schema({
	name : {
		type : String,
		required : true
	},
	updated : {
		type : Date,
		default : Date.now
	}
});
module.exports = mongoose.model('company', CompanySchema);