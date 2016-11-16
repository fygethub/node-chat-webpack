
/*日志页面*/
var log4js = require('log4js');
module.exports = function(name){
	var logger = log4js.getLogger(name);
	logger = logger.setLevel('INFO');
	return logger;
}
