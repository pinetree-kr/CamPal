var express = require('express');
var router = express.Router();

var Error = require('../models/error');
var e = new Error({
	message : 'Invalid API Request',
	type : 'invalid api exception',
	code : '100'
});

router.get('/', function(req, res){
	res.json(404,e);
});
/**/
router.use('/attraction', require('./attraction'));
router.use('/user', require('./user'));
router.use('/tuktuk', require('./tuktuk'));
router.use('/push', require('./push'));
router.use('/call', require('./call'));
router.all('/*', function(req, res){
	res.json(404,e);
});

/**/
module.exports = router;
