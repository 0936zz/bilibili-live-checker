const SMSClient = require('@alicloud/sms-sdk');
const Log = require('log');

const log = new Log('info');

module.exports = async function (list) {
	try {
		if (!config.sms.enable){
			log.error('sending message failed because you disabled the sms module');
			return false;
		}
		// 初始化sms_client
		let smsClient = new SMSClient({
			accessKeyId: config.sms.accessKeyId,
			secretAccessKey: config.sms.accessKeySecret
		});
		log.info('sending email: %s', JSON.stringify(list));
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
			SignName: config.sms.signName,
			TemplateCode: config.sms.templateCode,
			TemplateParam: JSON.stringify(param)
		});
		/*if (Code === 'OK') {
			// 处理返回参数
			console.log(res);
		}*/
	} catch (err) {
		log.error(err);
	}
	
};
