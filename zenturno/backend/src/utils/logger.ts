import winston from 'winston';

// Configuración del logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'zenturno-backend' },
  transports: [
    // Escribir logs de nivel 'error' y superiores en 'error.log'
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Escribir logs de todos los niveles en 'combined.log'
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Si no estamos en producción, también mostrar logs en la consola
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

export { logger }; 