const SMSClient = require('@alicloud/sms-sdk');
const Log = require('log');

const log = new Log('info');

module.exports = async function (list) {
	try {
		if (!config.message.enable){
			log.error('sending message failed because you disabled the sms module');
			return false;
		}
		// 初始化sms_client
		let smsClient = new SMSClient({
			accessKeyId: config.message.accessKeyId,
			secretAccessKey: config.message.accessKeySecret
		});
		log.info('sending message: %s', JSON.stringify(list));
		let nameList = list.map(function (ele) {
			return ele.name;
		});
		let param = {
			ups: nameList.join('、'),
			num: nameList.length
		};
		// 发送短信
		await smsClient.sendSMS({
			PhoneNumbers: config.system.phone,
			SignName: config.message.signName,
			TemplateCode: config.message.templateCode,
			TemplateParam: JSON.stringify(param)
		});
	} catch (err) {
		log.error(err);
	}
	
};
