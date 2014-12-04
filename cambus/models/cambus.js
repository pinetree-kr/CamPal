var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CitySchema = new Schema({
	name : String,
	pref : Boolean,
	index : Number
});
var CompanySchema = new Schema({
	name : String
});
var TypeSchema = new Schema({
	name : String
});

/*
 *	Bus Info
 */
var LineSchema = new Schema({
	dept : {
		type : Schema.Types.ObjectId,
		ref : 'City'
	},
	dest : {
		type : Schema.Types.ObjectId,
		ref : 'City'
	},
	distnace : Number,
	updated : {
		type : Date,
		default : Date.now
	}
});
var BusSchema = new Schema({
	line_id : {
		type : Schema.Types.ObjectId,
		ref : 'Line'
	},
	company_id : {
		type : Schema.Types.ObjectId,
		ref : 'Company'
	},
	type_id : {
		type : Schema.Types.ObjectId,
		ref : 'Type'
	},
	mid_id : {
		type : Schema.Types.ObjectId,
		ref : 'City'
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
var TimeSchema = new Schema({
	bus_id : {
		type : Schema.Types.ObjectId,
		ref : 'Bus'
	},
	dept_t : String,
	dest_t : String
});
var TerminalSchema = new Schema({
	city_id : {
		type : Schema.Types.ObjectId,
		ref : 'City'
	},
	company_id : {
		type : Schema.Types.ObjectId,
		ref : 'Company'
	},
	name : String,
	phone : [String],
	purchase : String,
	in : String,
	off : String,
	address : String,
	misc : {
		kor : String,
		eng : String,
		khm : String
	},
	latlng : {
		lat : Number,
		lng : Number
	}
});
var UserSchema = new Schema({
	email : String,
	passwd : String,
	phone_no : String,
	created : {
		type : Date,
		default : Date.now
	}
});
module.exports = {
	City : mongoose.model('City', CitySchema),
	Company : mongoose.model('Company', CompanySchema),
	Type : mongoose.model('Type', TypeSchema),
	Line : mongoose.model('Line', LineSchema),
	Bus : mongoose.model('Bus', BusSchema),
	Time : mongoose.model('Time', TimeSchema),
	Terminal : mongoose.model('Terminal', TerminalSchema),
	User : mongoose.model('User', UserSchema)
};
