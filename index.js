var express = require('express');
app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var numUsers = 0;
var Users = [];

//启动webpack-dev-server
//require('./webpack.server.js')(app);

//提供静态文件服务，这样就能找到你的`js`文件
app.use(express.static(__dirname));

app.all('*',function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
	res.header("X-Powered-By", ' 3.2.1')
	if (req.method == "OPTIONS") res.send(200); /*让options请求快速返回*/
	else next();
})

app.get('/', (req, res) => {
	//res.send('<h1>Hello world</h1>');//发送到页面
	res.sendFile(__dirname + '/dist/view/home.html');
})

/*用户连接以后*/
io.on('connection', function(socket) {
	var addedUser = false;
	console.log('connection');

	//监听客户端添加用户的时候
	socket.on('add user', function(username) {
		if (addedUser) return;
		console.log('add user');
		//判断用户是否存在
		addedUser = true;
		var user = {};
		user.username = username;
		Users.push(user);
		//储存用户在socket上
		socket.username = username;
		++numUsers;
		socket.emit('login', {
			numUsers: numUsers,
			Users: Users
		});

		//向其他用户广播 socket.broadcast.emit() 向其他socket 发送数据出去当前socket
		socket.broadcast.emit('user joined', {
			username: socket.username,
			numUsers: numUsers
		})
	})

	//返回聊天信息
	socket.on('chat messages', msg => {
		console.log(msg);
		msg.time = new Date().toLocaleString();
		io.emit('chat message', msg);
	})

	socket.on('disconnect', function() {
		if (addedUser) {
			--numUsers;
			del_user(socket.username);
			//广播用户离开了
			socket.broadcast.emit('user left', {
				username: socket.username,
				numUsers: numUsers,
				Users: Users
			})
		}
	})
})

/*从数组中删除用户*/
function del_user(username) {
	Users = Users.filter(function(item) {
		return item.username != username;
	})
}
/*判断是否用户名已存在*/
function isExit(username) {
	var _Users = Users.filter(function(item) {
		return item.username != username;
	});
	//console.log(_Users.length,Users.length);
	//如果用户不为0 且过滤后人数不等于当前人数 说明用户已经存在
	return Users.length != 0 && _Users.length !== Users.length;
}

/*返回当前系统时间*/
app.get('/get_time', function(req, res) {
	console.log('get time');
	res.json({
		time: new Date().toLocaleString()
	});
})

/*判断用户名是否存在*/
app.get('/isExit', function(req, res) {
	//获取前台数据
	var name = req.query.username;
	res.json({
		isExit: isExit(name)
	});
})
http.listen(3000, function() {
	console.log('listening on * :3000')
})