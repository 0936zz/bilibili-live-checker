const request = require('request');
const co = require('co');
const Log = require('log');
const OSS = require('ali-oss');
const fs = require('fs');

const log = new Log('info');

function getFlvUrl (id) {
	return new Promise(function (resolved, reject) {
		let url = `https://api.live.bilibili.com/api/playurl?player=1&cid=${id}&quality=0&platform=flash&otype=json`;
		request(url, function (err, res, body) {
			if (err) return reject(err);
			resolved(JSON.parse(body));
		});
	});
}

function upload (name) {
	let client = new OSS({
		region: 'oss-cn-beijing',
		accessKeyId: config.oss.accessKeyId,
		accessKeySecret: config.oss.accessKeySecret,
		bucket: config.oss.bucket
	});
	co(function* () {
		let stream = fs.createReadStream(`${__dirname}/../runtime/download/${name}`);
		log.info(`uploading video ${name} to oss`);
		yield client.putStream('record/' + name, stream);
		log.info(`uploaded video ${name} to oss`);
	}).catch(function (err) {
		log.error(err);
	});
}

function download (url, data) {
	return new Promise(function (resolved, reject) {
		let time = data.unix;
		let name = data.roomId + '-' + time + '.flv';
		let stream = fs.createWriteStream(`${__dirname}/../runtime/download/${name}`);
		log.info(`downloading [${data.name}]'s live to runtime/download/${name}`);
		request(url).pipe(stream).on('close', function () {
			if (config.oss.enable) {
				upload(name);
			}
			resolved(name);
		});
	});
}

function record (list) {
	list.forEach(async function (val) {
		try {
			let url = (await getFlvUrl(val.roomId)).durl[0].url;
			download(url, val).then(function (name) {
				log.info(`complete downloading video [${val.name}],saved at runtime/download/${name}`);
			});
		} catch (err) {
			log.error(err);
		}
	});

}

module.exports = record;
