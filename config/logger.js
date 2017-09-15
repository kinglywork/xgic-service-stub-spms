/**
 * Created by xiaoling on 18/08/2017.
 *
 * level for winston can specify one of
 *      {
 *          error: 0,
 *          warn: 1,
 *          info: 2,
 *          verbose: 3,
 *          debug: 4,
 *          silly: 5
 *      }
 * https://www.npmjs.com/package/winston
 */
const fs = require('fs');
const winston = require('winston');
const Logger = winston.Logger;
const DailyRotateFile = require('winston-daily-rotate-file');
const logDir = './logs';

winston.emitErrs = true;
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const appLogger = new Logger({
  transports: [],
  exitOnError: false
});
if (process.env.NODE_ENV === 'development') {
  // Add console logger for development environment
  appLogger.add(winston.transports.Console, {
    level: 'debug',
    handleExceptions: true,
    humanReadableUnhandledException: true,
    colorize: true
  });
} else {
  appLogger.add(DailyRotateFile, {
    level: 'info',
    dirname: logDir,
    filename: 'app.notice.log',
    json: false,
    handleExceptions: true,
    humanReadableUnhandledException: true,
    maxsize: 5242880,
    maxFiles: 5
  });
}
// Add stream to app logger
module.exports = appLogger;
