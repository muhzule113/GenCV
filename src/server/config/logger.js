import winston from 'winston'
import { config } from './env.js'

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  config.nodeEnv === 'production'
    ? winston.format.json()
    : winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
        return `${timestamp} [${level.toUpperCase()}] ${message}${metaStr}`
      }),
)

const logger = winston.createLogger({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'gencv-api' },
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 10,
    }),
  ],
  exitOnError: false,
})

export class LoggerStream {
  write(message) {
    logger.http(message.trim())
  }
}

export default logger
