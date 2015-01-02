var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var InformationSchema = new Schema({
	cities : {
		size : Number,
		updated : {
			type : Date,
			default : Date.now
		}
	},
	companies : {
		size : Number,
		updated : {
			type : Date,
			default : Date.now
		}
	},
	types : {
		size : Number,
		updated : {
			type : Date,
			default : Date.now
		}
	},
	lines : {
		size : Number,
		updated : {
			type : Date,
			default : Date.now
		}
	},
	buses : {
		size : Number,
		updated : {
			type : Date,
			default : Date.now
		}
	},
	times : {
		size : Number,
		updated : {
			type : Date,
			default : Date.now
		}
	},
	terminals : {
		size : Number,
		updated : {
			type : Date,
			default : Date.now
		}
	},
	cityroutes : {
		size : Number,
		updated : {
			type : Date,
			default : Date.now
		}
	},
});
module.exports = mongoose.model('information', InformationSchema);
