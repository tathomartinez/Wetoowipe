const { createLogger, format, transports } = require('winston');
const path = require('path');

const logger = createLogger({
    level: 'debug', // Configurar el nivel mínimo de log (debug, info, warn, error, etc.)
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
    ),
    transports: [
        new transports.Console({ level: 'debug' }), // Mostrar logs de nivel debug y superiores en la consola
        new transports.File({ 
            filename: path.join(__dirname, '../../logs/app.log'), 
            level: 'info' // Guardar logs de nivel info y superiores en el archivo
        }),
        new transports.File({ 
            filename: path.join(__dirname, '../../logs/debug.log'), 
            level: 'debug' // Guardar logs de nivel debug en un archivo separado
        })
    ]
});

module.exports = logger;