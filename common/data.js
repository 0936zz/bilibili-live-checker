const request = require('request');
const Log = require('log');

const log = new Log('info');

function data (id) {
	return new Promise(function (resolved, reject) {
		let api = `https://api.live.bilibili.com/room/v1/Room/getRoomInfoMain?roomid=${id}`;
		request(api, function (err, response, body) {
			if (err) return reject(err);
			try {
				data = JSON.parse(body).data;
			} catch(err) {
				log.error('error in parsing json: %s', JSON.stringify(err));
				return reject(err);
			}
			resolved(data);
		});
	}).catch(function (err) {
		log.error('error in requesting json data: %s', JSON.stringify(err));
	});
}

module.exports = data;
