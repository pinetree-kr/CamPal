var express = require('express');

var router = express.Router();

var Company = require('../models/company');

router.get('/', function(req, res){
	Company.find(function(err, companies){
		if(!err){
			res.send(companies);
		}
	});	
});
router.get('/:_id', function(req, res){
	var _id = req.params._id
	Company.findOne({_id:_id}, function(err, company){
		if(!err){
			res.send(company);
		}
	});
});

module.exports = router;
