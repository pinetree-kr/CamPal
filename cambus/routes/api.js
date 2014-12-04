var express = require('express');

var router = express.Router();

router.get('/', function(req, res){
	res.send('this is api');
});

router.use('city', require('./city'));
/*/
app.use('company', require('./company'));
app.use('type', require('./type'));
app.use('line', require('./line'));
app.use('bus', require('./bus'));
app.use('time', require('./time'));
app.use('terminal', require('./terminal'));
app.use('user', require('./user'));
/**/

//var router = express.Router();

//var Cambus = require('../models/cambus');


/*/
router.get('/', function(req, res){
	res.send('test');
});

router.get('/city', function(req, res){
	var City = require('../models/city');
	Cambus.City.find(function(err, cities){
		if(err)
			res.send(err);
		res.send(cities);
	});	
});
router.get('/city/:_id', function(req, res){
	var _id = req.params._id
	Cambus.City.findOne({_id:_id}, function(err, city){
		if(!err){
			res.send(city);
		}
	});
});
/**/
/*/
router.get('/:_id', function(req, res){
	var _id = req.params._id;
	Memo.findOne({_id:_id}, function(err, memo){
		if(err)
			res.send(err);
		res.send(memo);
	});
});

router.put('/', function(req, res){
	Memo.update(
		// cond
		{
			_id : req.body._id
		},
		// update
		{
			$set:{
				author : req.body.author,
				contents : req.body.contents
			}
		},
		// callback
		function(err){
			if(err)
				res.send(err);
			res.send();
		});
});

router.post('/', function(req, res){
	var memoModel = new Memo(req.body);
	memoModel.save(function(err){
		if(err)
			res.send(err);
		res.send();
	});
});

router.delete('/:_id', function(req, res){
	var _id = req.params._id;
	Memo.remove({_id:_id}, function(err){
		if(err)
			res.send(err);
		res.send();
	});
});
/**/
module.exports = router;
