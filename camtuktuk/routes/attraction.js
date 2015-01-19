var express = require('express');
var router = express.Router();
var Attraction = require('../models/attraction');
var async = require('async');
var moment = require('moment');

// 500번대
router.get('/', function(req, res){
	Attraction.find(function(err, items){
		if(err){
			return res.json(500,{
				error : {
					message : err.message,
					type : err.type,
					code : 501
				}
			});
		}else{
			return res.json(items);
		}
	});
});
router.get('/:_id', function(req, res){
	var id = req.params._id;
	Attraction.findOne({_id:id}, function(err, item){
		if(err){
			return res.json(500,{
				error : {
					message : err.message,
					type : err.type,
					code : 511
				}
			});
		}else{
			if(item){
				return res.json(item);
			}else{
				return res.json(404,{
					error : {
						message : 'Not found Attraction',
						type : 'not found exception',
						code : 512
					}
				});
			}
		}
	});
});

router.post('/add', function(req, res){
	var params = req.body;
	if(params.name === undefined || params.name === ''
		|| params.location === undefined || params.location === {}){
		return res.json(400,{
			error : {
				message : 'Need name, location to insert new attraction',
				type : 'request exception',
				code : 521
			}
		});
	}

	var attracion = new Attraction(params);
	attraction.created = moment();
	attraction.save(function(err, item){
		if(err){
			return res.json(500,{
				error : {
					message : err.message,
					type : err.type,
					code : 522
				}
			});
		}else{
			return res.json(item);
		}
	});
});

module.exports = router;
