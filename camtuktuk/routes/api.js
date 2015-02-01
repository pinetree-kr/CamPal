var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
	res.json(404,{
		error:{
			message : 'Invalid API Request',
			type : 'invalid api exception',
			code : 100
		}
	});
});
/**/
router.use('/attraction', require('./attraction'));
router.use('/user', require('./user'));
router.use('/tuktuk', require('./tuktuk'));
router.use('/push', require('./push'));
router.use('/call', require('./call'));
router.use('/location', require('./location'));
router.all('/*', function(req, res){
	res.json(404,{
		error:{
			message : 'Invalid API Request',
			type : 'inavlid api exception',
			code : 100
		}
	});
});

/**/
module.exports = router;
