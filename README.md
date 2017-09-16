# bilibili-live-checker
bilibili直播检测工具，基于nodejs编写，提供多种提醒方式+自动录屏功能

## 配置文件说明

### email
邮件模块，仅支持SMTP协议

推荐使用[阿里云邮件推送](https://www.aliyun.com/product/directmail)

每天200封免费配额，用完后5元/1000封，需要自备域名
```json
{
	"enable": true, // 是否启用该模块
	"host": "", // SMTP服务器地址
	"port": 465, // SMTP服务器端口号
	"ssl": true, // 是否启用ssl
	"username": "", // SMTP用户名
	"password": "" // SMTP密码
}
```

### sms
短信模块，仅支持[阿里云短信服务](https://www.aliyun.com/product/sms)

新注册用户赠送10元代金券，用完后0.045元/条，需自行申请签名和模板

模板样式：
```
您关注的${ups}等${num}位主播正在直播，快去看看吧
```

```json
{
	"enable": true, // 是否启用该模块
	"accessKeyId": "",
	"accessKeySecret": "",
	"signName": "", // 短信签名名称
	"templateCode": "" // 短信模版CODE
}
```

### oss
对象存储模块，仅支持[阿里云对象存储](https://www.aliyun.com/product/oss)

推荐使用[阿里云服务器](https://www.aliyun.com/product/ecs)搭配OSS使用，上传可以通过内网传输，速度快，不消耗ECS流量（OSS上传流量免费）。下载流量0.50元/GB
```json
{
	"enable": true, // 是否启用该模块
	"accessKeyId": "",
	"accessKeySecret": "",
	"deleteAfterUpload": true // 在上传完成后删除服务器本地的录屏文件
}
```
### chrome
浏览器通知模块，未完成

### wechat
微信通知模块，未完成

### system
系统配置
```json
{
	"phone": "", // 接收短信的手机号码
	"email": "", // 接收邮件的邮箱地址
	"interval": "*/3 * * * *", // 检测直播间隔
	"publicNotification": ["email"] // 公共提醒方式
}
```
#### 检测间隔格式
crontab格式，详见[node-schedule文档](https://github.com/node-schedule/node-schedule#cron-style-scheduling)

### 关于accessKey
请访问 https://help.aliyun.com/knowledge_detail/38738.html

## cli 使用说明
您可以通过在根目录下使用`node cli.js`命令使用命令行工具

| 命令 | 简写 | 参数 | 说明 |
| :-------- | :- | :------------ | :------------- |
| --add     | -a | 房间id或房间url | 添加新关注      |
| --delete  | -d | 房间id或房间url | 删除已关注的直播 |
| --list    | -l | null          | 查看所有关注     |
| --help    | -h | null          | 显示帮助        |
| --Version | -V | null          | 查看版本号      |

其他命令会后续添加


## up.json说明
**不推荐直接修改，可使用cli自动添加或删除**
```json
{
	"直播间ID": {
		"name": "", // 房间UP主昵称
		"roomId": "", // 直播间ID
		"urlId": "", // 直播间URL ID
		"notification": "public", // 提醒方式
		"record": false // 是否录屏
	}
}
```
### 关于ROOMID和URLID
部分直播间可能有两个id，ROOMID为bilibili分配给直播间的id，但是有些id可能过长，所以达到一定人气的UP主可以从b站获取一个短的URLID，此时访问旧的地址会自动跳转，但是所有的API仍然使用的是旧的ROOMID

eg:https://live.bilibili.com/305 和 https://live.bilibili.com/79558 为同一个直播间

其中305为URLID，79558为URLID


## 其他
**推荐使用pm2部署**`pm2 start pm2.json`

**修改配置后需重启应用，添加关注后下次检测会自动更新**

*我真的不是在阿里云打广告啊（逃）*
