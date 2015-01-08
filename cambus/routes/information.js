var express = require('express');

var router = express.Router();

var Information = require('../models/information');

router.get('/', function(req, res){
	Information.findOne(
		null,
		function(err, info){
		if(err) send.status(500).send();
		res.send(info);
	});
});

module.exports = router;
