var express = require('express');

var router = express.Router();

var CityRoute = require('../models/cityroute');

router.get('/', function(req, res){
	CityRoute.find(
		null,
		function(err, items){
		if(err) send.status(500).send();
		res.send(items);
	});
});

module.exports = router;
