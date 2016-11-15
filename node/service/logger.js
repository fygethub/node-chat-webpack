/*日志页面*/
var fs = require('fs');
var log4js = require('log4js');
var logConfig = JSON.parse(fs.readFileSync("./node/config/log4js.json", "utf-8"));
log4js.configure(logConfig);
module.exports = function(name) {
    console.log(name)
    var logger = log4js.getLogger(name);
    console.log(logger)
    logger.setLevel('INFO');
    logger.info("系统开始",name);
    logger.info("日志开启启动.....");
    
    return logger;
}
