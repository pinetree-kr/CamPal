var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(express.static(path.join(__dirname, './www')));
app.get('/', function(req, res){
	res.sendfile('index.html');
});
/*/
app.use('/memo', require('./routes/memo'));
app.use('/user', require('./routes/user'));
app.use('/push', require('./routes/push'));
/**/
app.use('/cambus', require('./routes/cambus'));


var server = app.listen(8080, function(){
	var uri = 'mongodb://10.240.112.154:27017/cambus';
	var opts ={
		user:'campalAdmin',
		pass:'campaldev'
	}
	mongoose.connect(uri, opts);
	console.log('listening on port %d', server.address().port);
});
