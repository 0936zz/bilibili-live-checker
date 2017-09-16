const moment = require('moment-timezone');

const _data = require('./data');

/**
 * 检测是否在直播
 * @param id
 * @return {Promise}
 */
async function check (id) {
	let data = await _data(id);

	let info = {
		id: data.ROOMID,
		status: data.LIVE_STATUS === 'LIVE'
	};
	if (info.status) {
		info.time = changeTime(data.LIVE_TIMELINE);
		info.name = data.ANCHOR_NICK_NAME;
		info.unix = data.LIVE_TIMELINE;
	}
	return info;
}

function changeTime (time) {
	let date = moment.tz(time * 1000, 'Asia/Shanghai');
	return date.format('YYYY-MM-DD HH:mm:ss');
}


module.exports = check;
