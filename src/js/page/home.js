require('../../css/reset.css');
require('../../css/home.less');
require('../../view/home.html');
for(var i = 1; i< 69; i++){
	require('../../imgs/emoji/'+ i +'.gif');
}
 
/*调整页面 */
//$('.login').remove();
//var socket = require('socket.io-client')('http://fydor.iok.la/');
var socket = require('socket.io-client')('http://localhost:3000/');
let USER = '';
var connected = false;
// setInterval(function(){
// 	get_time();
// },60000);

$('.submit').click(function(){
	//点击发送聊天消息;
	send_msg();
	$("#m").val('');
	emojeFadeOut();
});

$(document).on('click',function(){
	emojeFadeOut();
})

/*登录函数*/
$.loginFun = function(){
	var username = $('.usernameInput').val().trim();
	if( username == '') return ;
	$.get('http://localhost:3000/isExit',{username:username},function(data){
		console.log(data);
		if (data.isExit) {
			$(".title").text('名字已存在,换个吧');
		}else{
			//发送添加用户信息
			socket.emit('add user',username);
			USER = username;
			$(".header").html(`欢迎${username}来到聊天室`);
			$('.login').css({"transform":"translateY(-100%)","transition":'.5s'});
			setTimeout(function(){
				$('.login').remove();
			},500)
		}
	})
}
$(window).keyup(function(event){
	if(event.keyCode == 13){
		if($('.comfirm').length){
			$.loginFun();
			return ;
		}

		//点击发送聊天消息;
		if(!$("#m").val()) return;
		send_msg();
		$("#m").val('');
		emojeFadeOut();
	}
}) 


$(".usernameInput").focus(function(){
	$(".comfirm").css("animation",".5s buttonIn both linear");
})



/*点击注册按钮*/
$('.comfirm').click(function(){
	$.loginFun();
});

/*接收后台返回消息*/
socket.on('chat message',function(msg){
	/* 通过判断是否是自己发送的 添加对话消息 */
	var result = msg.msg;
	var reg = /\[emoji:\d*\]/g,emojiIndex,match,
	totalEmojiNum = $(".emoji").children().length;
	while(match = reg.exec(result)){
		emojiIndex = match[0].slice(7,-1);
		if(emojiIndex > totalEmojiNum){
			result = result.replace(match[0],'[X]');
		}else{
			result = result.replace(match[0],'<img  src="/dist/imgs/emoji/' + emojiIndex + '.gif" />')
		}
	}
	console.log(result);
	msg.msg = result;
	append_other_msg(msg);
})  

/*登录进来后 添加一条欢迎语*/
socket.on('login',function(data){
	connected = true;
	var message = "Welcome 欢迎来到聊天室 此聊天室 是一个很帅的开发员写的 只有你一个人能看见这句话哦! – ";
	addSystemMsg(message);
	//添加在线人数
	console.log(data);
	for(var i = 0,len = data.Users.length; i< len ; i++){
		addOnlinePerson( data.Users[i].username,data.numUsers);
	}
	
})

/*监听用户加入的信息*/
socket.on('user joined',({username,numUsers})=>{
	var message =`${username} 用户加入聊天室`;
	
	//添加在线人数
	addOnlinePerson(username,numUsers);
	//添加系统信息
	addSystemMsg(message);
});

/*监听用户离开*/
socket.on('user left',({username,numUsers,Users}) =>{
	var message =`${username} 用户离开聊天室`;
	//添加系统信息
	addSystemMsg(message);

	//更新在线人员信息
	$('.online-persons').html('');
	//添加在线人数
	for(var i = 0,len = Users.length; i< len ; i++){
		addOnlinePerson( Users[i].username,numUsers);
	}
})

//-------------帅气的分割线---------------------------

/* 添加对话消息 */
function append_other_msg(msg){
	console.log(msg);
	
	var s = msg.user == USER ? 'my-talk' : 'other-talk';
	
	$(".talk").append(`<li class="${s}">\
							<div class="minihead" >\
								<img src="/dist/imgs/emoji/headportrait.jpg">\
							</div>\
							<p class="ctx"><span style="color:red;">${msg.user}</span>&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:gray">(${msg.time})</span><br> ${msg.msg}</p>\
						</li>`);
	$('.content').scrollTop($('.content')[0].scrollHeight + 30);
}


/*点击发送 */
function send_msg(){
	//点击发送 
	$('#m').val().trim() == '' || socket.emit('chat messages',{'msg':$('#m').val(),'user' : USER});
	
	return false; 
}

/* 添加时间戳 */
function get_time(){
	$.get('http://localhost:3000/get_time',({time})=>{
		addSystemMsg(time);
	})	
}


/*添加在线人数*/
function addOnlinePerson(username,numUsers){
	var msg = `<li class="ps">
					<img src="/dist/imgs/emoji/headportrait.jpg" alt="">
					<span class="nick">${username}</span>
				</li>`
	$(".show-person").find('h3').text(`当前在线${numUsers}人`);
	$('.online-persons').append(msg);
}


/*添加 系统信息*/
function addSystemMsg(message){
	$(".talk").append(`<li class="time">${message}</li>`);
}
 
/*添加表情 并绑定点击事件*/
add_emoji();
function add_emoji(){
	var docFragment = document.createDocumentFragment();
	for(var i= 1; i<= 69; i++){
		var emojiItem = document.createElement('img');
		emojiItem.src = '/dist/imgs/emoji/'+ i+ '.gif';
		emojiItem.title = i;
		docFragment.appendChild(emojiItem);
	}
	$(".emoji").append(docFragment);
	$('.emoji').css('transform','translateY(-100%)')
}

/*点击 emoji按钮显示隐藏*/
tarigger();
function tarigger(){
	$('.emoji-btn').click(function(){
		$('.emoji').fadeToggle();
		return false;
	})

}

/*隐藏表情包*/
function emojeFadeOut(){
	$('.emoji').fadeOut();
}

/*点击表转换成文字*/
trun_img();
function trun_img(){
	$('.emoji').click(function(e){
		var target = e.target;
		if(target.nodeName.toLowerCase() == 'img'){
			$('#m').val($('#m').val() + `[emoji:${target.title}]`);
		}
	})
}