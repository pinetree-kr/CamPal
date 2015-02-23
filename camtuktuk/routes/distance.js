var distanceArgumentCheck = function(lat1, lng1, lat2, lng2) {
	for (var i = 0; i < arguments.length; i++){
		if (typeof arguments[i] !== 'number'
				|| parseFloat(arguments[i]) === NaN) {
			console.log('Invalid Parameter(s)');
		}
	}
}
var toRad = function(deg) {
	return deg * Math.PI / 180;
}
var distance = function(lat1, lng1, lat2, lng2){
	if (lat1.latitude && lng1.latitude) {
		lat2 = lng1.latitude
		lng2 = lng1.longitude
		lng1 = lat1.longitude
		lat1 = lat1.latitude
	}
	distanceArgumentCheck(lat1, lng1, lat2, lng2);
	var R = 6371, // km
			dLat = toRad(lat2-lat1),
			dLng = toRad(lng2-lng1),
			lat1 = toRad(lat1),
			lat2 = toRad(lat2);
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
					Math.sin(dLng/2) * Math.sin(dLng/2) *
					Math.cos(lat1) * Math.cos(lat2),
			c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)),
			d = R * c; // Distance in k
	return d;
}
module.exports.distance = distance;
