var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CallSchema = new Schema({
	user :{
		type : Schema.Types.ObjectId,
		required : true,
		ref : 'user'
	},
	tuktuk : {
		type : Schema.Types.ObjectId,
		ref : 'tuktuk'
	},
	type : String,
	rentalType : {},
	status : {
		//request, response, done
		type : String,
		required : true,
		default : 'request'
	},
	done : {
		user : {
			type: Boolean,
			default : false
		},
		tuktuk : {
			type : Boolean,
			default : false
		}
	},
	/*/
	price : {
		type : Number,
		//required : true
	},
	/**/
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
	},
	limit : Number
});
module.exports = mongoose.model('call', CallSchema);
