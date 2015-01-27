var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CallSchema = new Schema({
	caller : {
		type : Schema.Types.ObjectId,
		required : true,
		ref : 'user'
	},
	callee : {
		type : Schema.Types.ObjectId,
		ref : 'user'
	},
	type : {},
	rentalType : String,
	status : {
		type : String,
		required : true,
		default : 'request'
	},
	price : {
		type : Number,
		//required : true
	},
	dept : {
		name : String,
		latlng : {}
	},
	dest : {
		name : String,
		latlng : {}
	},	
	created : {
		type : Number,
		required : true
	}
});
module.exports = mongoose.model('call', CallSchema);
