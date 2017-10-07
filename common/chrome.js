let app = require('http').createServer();
let io = require('socket.io')(app);

app.listen(config.chrome.port);

io.on('connection', function (socket) {
	socket.emit('check', async function (data) {
		console.log(data);
	});
});
