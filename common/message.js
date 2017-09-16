const SMSClient = require('@alicloud/sms-sdk');

module.exports = async function (list) {
	if (!config.sms.enable){
		log.error('sending message failed because you disabled the sms module');
		return false;
	}
	// 初始化sms_client
	let smsClient = new SMSClient({
		accessKeyId: config.sms.accessKeyId,
		accessKeySecret: config.sms.accessKeySecret
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
		SignName: config.system.signName,
		TemplateCode: config.system.templateCode,
		TemplateParam: JSON.stringify(param)
	});
	/*if (Code === 'OK') {
		// 处理返回参数
		console.log(res);
	}*/
};
