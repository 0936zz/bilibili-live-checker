const ejs = require('ejs');

function sendEmail (transporter, options) {
	return new Promise(function (resolved, reject) {
		transporter.sendMail(options, function (err, info) {
			if (err) return reject(err);
			resolved(info);
		});
	});
}

function renderTemplate (list) {
	return new Promise(function (resolved, reject) {
		ejs.renderFile(`${__dirname}/../resource/email.html`, {list}, function (err, str) {
			if (err) return reject(err);
			resolved(str);
		});
	});
}

module.exports = { sendEmail, renderTemplate };
