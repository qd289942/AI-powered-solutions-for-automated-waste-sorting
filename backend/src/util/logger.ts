import path from 'path';
import * as winston from 'winston';

const FORMAT_DEBUG = winston.format.combine(
    winston.format.timestamp({
        format:"DD.MM.YYYY HH:mm:ss"
    }),
    winston.format.printf(
        info => `[${info.timestamp}] ${info.level.toUpperCase()}\t: ${info.message}`
    ),
    winston.format.colorize({
        all:true
    }),
);

const FORMAT_PRODUCTION = winston.format.combine(
    winston.format.timestamp({
        format:"DD.MM.YYYY HH:mm:ss"
    }),
    winston.format.printf(
        info => `[${info.timestamp}] ${info.level.toUpperCase()}\t: ${info.message}`
    ),
);
    
export const logger = winston.createLogger({
    level: "debug",
    transports: [
        new winston.transports.File({ filename: path.join(__dirname, '../../logs/error.log'), level: 'error', format: FORMAT_PRODUCTION }),
        new winston.transports.File({ filename:  path.join(__dirname, '../../logs/combined.log'), format: FORMAT_PRODUCTION}),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new (winston.transports.Console)({
        format: winston.format.combine(FORMAT_DEBUG)
    }),);
  }
  
  


