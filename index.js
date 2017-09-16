const fs = require('fs-extra');
const schedule = require('node-schedule');
const Log = require('log');

const check = require('./common/check');
const message = require('./common/message');
const email = require('./common/email');
const record = require('./common/record');
const config = require('./json/config');
global.config = config;

const log = new Log('info');
const jsonPath = './runtime/last.json';

// 检测下载目录
if (!fs.existsSync(`${__dirname}/runtime/download`)) {
	fs.mkdirSync(`${__dirname}/runtime/download`);
}
// 清空检测列表
fs.writeJsonSync(jsonPath, []);

schedule.scheduleJob(config.system.interval, checkLiving);

async function checkLiving () {
	try {
		log.info('checking live...');
		let ups = fs.readJsonSync('./json/following.json');
		let upId = Object.keys(ups);

		let promiseArr = upId.map(ele => check(ele));
		let data = await Promise.all(promiseArr);
		// 获取上次检测结果
		let lastResult = fs.readJsonSync(jsonPath);
		// 获取正在直播的up
		let living = data.filter(function (value) {
			return value.status;
		});
		// 获取本次检测结果
		let newResult = living.map(function (value) {
			return value.id;
		});
		// 写入本次结果
		fs.writeJsonSync(jsonPath, newResult);

		// 获取本次新开播up
		let newLiving = living.filter(function (value) {
			return lastResult.indexOf(value.id) === -1;
		});
		if (newLiving.length === 0) return false;

		// 发送邮件和短信
		let list = {
			email: [],
			wechat: [],
			message: [],
			chrome: [],
			record: []
		};

		newLiving.forEach(function (val) {
			let up = ups[val.id];
			Object.assign(up, val);
			delete up.id; // 强迫症专用
			let noticeMethod = up.notification;
			if (noticeMethod === 'public') {
				noticeMethod = config.system.publicNotification;
			}
			if (noticeMethod.indexOf('email') !== -1) list.email.push(up);
			if (noticeMethod.indexOf('message') !== -1) list.message.push(up);
			if (noticeMethod.indexOf('wechat') !== -1) list.wechat.push(up);
			if (noticeMethod.indexOf('chrome') !== -1) list.chrome.push(up);
			if (up.record) list.record.push(up);
		});

		if (list.email.length) email(list.email);
		if (list.message.length) message(list.message);
		// if (list.wechat.length) wechat(list.wechat);
		if (list.record.length) record(list.record);

		// 日志
		log.info('checked finished, new live: [%s]', newResult.toString());
	} catch (error) {
		log.error(error);
	}
}

checkLiving();
