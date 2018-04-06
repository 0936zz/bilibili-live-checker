const moment = require('moment-timezone');

const _data = require('./data');
const _user = require('./user');

/**
 * 检测是否在直播
 * @param id
 * @return {Promise}
 */
async function check (id) {
	let data = await _data(id);
	let user = await _user(id);

	let info = {
		id: data.room_id,
		status: data.live_status === 1
	};
	if (info.status) {
		info.time = data.live_time;
		info.name = user.info.uname;
		info.unix = parseInt(new Date(data.live_time).getTime() / 1000);
	}
	return info;
}

function changeTime (time) {
	let date = moment.tz(time * 1000, 'Asia/Shanghai');
	return date.format('YYYY-MM-DD HH:mm:ss');
}


module.exports = check;
