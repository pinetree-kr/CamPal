var express = require('express');

var router = express.Router();

router.get('/', function(req, res){
	res.send('this is api');
});
/**/
router.use('/user', require('./user'));
router.use('/push', require('./push'));
/**/
module.exports = router;
