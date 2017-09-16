const nodemailer = require('nodemailer');
const Log = require('log');
const minify = require('html-minifier').minify;

const pub = require('./public.js');

const log = new Log('info');

module.exports = async function (list) {
	try {
		if (!config.email.enable){
			log.error('sending email failed because you disabled the email module');
			return false;
		}
		log.info('sending email: %s', JSON.stringify(list));
	
		let str = await pub.renderTemplate(list);
		str = minify(str, {
			removeComments: true,
			collapseWhitespace: true,
			minifyJS: true,
			minifyCSS: true
		});
		let transporter = nodemailer.createTransport({
			host: config.email.host,
			port: config.email.port,
			secure: config.email.ssl,
			auth: {
				user: config.email.username,
				pass: config.email.password
			}
		});
		let options = {
			from: `直播通知 <${config.email.username}>`,
			to: config.system.email,
			subject: '直播通知',
			html: str
		};
		await pub.sendEmail(transporter, options);
	} catch (err) {
		log.error(err);
	}
};
