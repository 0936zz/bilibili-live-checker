const program = require('commander');
const request = require('request');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const {table} = require('table');

const user = require('./common/user');

const pkgPath = `${__dirname}/package.json`;
const upPath = `${__dirname}/json/following.json`;
const configPath = `${__dirname}/json/config.json`;

const pkg = fs.readJsonSync(pkgPath);

program
	.version(pkg['cli-version'])
	.usage('[options] [arguments]')
	.option('-a, --add <roomId|roomUrl>', 'add a new following', url2Id)
	.option('-d, --delete <roomId|roomUrl>', 'delete a following', url2Id)
	.option('-l, --list', 'list all followings')
	.option('--init', 'create necessary files')
	// .option('-c, --config <roomId|roomUrl>', 'modify the config of a following')
	// .option('-r, --refresh <roomId|roomUrl>', 'refresh room master\'s user info', getId)
	// .option('-s, --status <roomId|roomUrl>', 'get status of the room', getId)
	// .option('--delete-all', 'delete all followings')
	// .option('--check-update', 'check for update')
	.parse(process.argv);

if (program.init) {
	(function () {
		let runtime = `${__dirname}/runtime`;
		let download = `${__dirname}/runtime/download`;
		let config = `${__dirname}/json/config.json`;
		let example = `${__dirname}/json/config.example.json`;
		let following = `${__dirname}/json/following.json`;
		if (!fs.existsSync(runtime)) {
			fs.mkdirSync(runtime);
			console.log('create directory runtime successfully');
		}
		if (!fs.existsSync(download)) {
			fs.mkdirSync(download);
			console.log('create directory runtime/download successfully');
		}
		if (!fs.existsSync(config)) {
			fs.copySync(example, config);
			console.log('create file json/config.json successfully');
			console.error('please edit json/config.json file to config the app');
		}
		if (!fs.existsSync(following)) {
			fs.writeJsonSync(following, {});
			console.log('create file json/following.json successfully');
		}
		console.log('initalize app successfully');
		process.exit();
	})();
}

const ups = fs.readJsonSync(upPath);
const config = fs.readJsonSync(configPath);


function promiseRequest (url) {
	return new Promise(function (resolved, reject) {
		request(url, function (err, res, data) {
			if (err) return reject(err);
			resolved(data);
		});
	});
}

function url2Id (url) {
	let id = getId(url);
	return promiseRequest(`https://api.live.bilibili.com/room/v1/Room/room_init?id=${id}`).then(function (data) {
		data = JSON.parse(data);
		return ([data.data.room_id, data.data.short_id ? data.data.short_id : data.data.room_id]);
	});
}

function getId (url) {
	if (!isNaN(parseInt(url))) {
		return parseInt(url);
	}
	let regex = /(http|https):\/\/live.bilibili.com\/(\d+)/;
	let result = regex.exec(url);
	return parseInt(result[2]);
}

let funs = {
	add: function (id) {
		let idArr, roomInfo, jsonInfo;
		id.then(function (data) {
			idArr = data;
			if (ups[idArr[0]]) {
				console.log('you can\'t follow this live because you have followed it before');
				process.exit(1);
			}
			return user(idArr[0]);
		}).then(function (data) {
			roomInfo = data;
			let question = {
				type: 'confirm',
				name: 'sure',
				message: `this will add [${roomInfo.info.uname}] to you following list, are you sure? (y)`,
				default: true
			};
			return inquirer.prompt(question);
		}).then(function (answers) {
			if (answers.sure) {
				jsonInfo = {
					name: roomInfo.info.uname,
					roomId: idArr[0],
					urlId: idArr[1]
				};
				let question = {
					type: 'confirm',
					name: 'public',
					message: `do you want to use public notification method (${config.system.publicNotification})? (y)`,
					default: true
				};
				return inquirer.prompt(question);
			} else {
				process.exit();
			}
		}).then(function (answers) {
			if (answers.public) {
				jsonInfo.notification = 'public';
			} else {
				let question = {
					type: 'checkbox',
					name: 'method',
					message: 'please select the notification method? (public)',
					choices: ['email', 'message'],
					default: false
				};
				return inquirer.prompt(question);
			}
		}).then(function (answers) {
			if (answers && typeof answers.method !== 'undefined') {
				jsonInfo.notification = answers.method;
			}
			let question = {
				type: 'confirm',
				name: 'record',
				message: 'do you want to record the live automatically when the it start? (n)',
				default: false
			};
			return inquirer.prompt(question);
		}).then(function (answers) {
			jsonInfo.record = answers.record;
			ups[idArr[0]] = jsonInfo;
			fs.writeJsonSync(upPath, ups);
			console.log(`add [${jsonInfo.name}] to following successfully!`);
		}).catch(function (err) {
			console.log(err);
		});
	},
	delete: function (id) {
		let idArr, name;
		id.then(function (data) {
			idArr = data;
			if (ups[idArr[0]]) {
				name = ups[idArr[0]].name;
				return inquirer.prompt({
					type: 'confirm',
					name: 'sure',
					message: `do you really want to delete [${name}] from following list? (y)`
				});
			} else {
				console.log(`you haven't followed the room ${idArr[0]} yet!`);
				process.exit();
			}
		}).then(function (answers) {
			if (answers.sure) {
				delete ups[idArr[0]];
				fs.writeJsonSync(upPath, ups);
				console.log(`delete [${name}] from following list successfully!`);
			}
		});
	},
	list: function () {
		let data = [['RoomId', 'URLId', 'Username', 'Notification', 'Record']];
		for (let key in ups) {
			if (ups.hasOwnProperty(key)) {
				let up = ups[key];
				data.push(
					[up.roomId, up.urlId, up.name, up.notification.toString(), up.record]
				);
			}
		}
		console.log(table(data, config));
	}
};

if (process.argv.slice(2).length === 0) {
	program.help();
}
if (program.add) {
	funs.add(program.add);
} else if (program.delete) {
	funs.delete(program.delete);
} else if (program.list) {
	funs.list();
} else {
	program.help();
}
