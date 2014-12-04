var express = require('express');

var router = express.Router();

router.get('/', function(req, res){
	res.send('this is api');
});

router.use('/city', require('./city'));
router.use('/company', require('./company'));
router.use('/type', require('./type'));
router.use('/line', require('./line'));
router.use('/bus', require('./bus'));
router.use('/time', require('./time'));
router.use('/terminal', require('./terminal'));
router.use('/user', require('./user'));

module.exports = router;
