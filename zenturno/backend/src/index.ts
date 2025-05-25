import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { AppDataSource } from './infra/db/data-source';
import { setupRoutes } from './infra/http/routes';
import { errorHandler } from './infra/http/middlewares/errorHandler';
import { logger } from './utils/logger';
import { setupSocketServer } from './infra/http/socket';
import { setupSwagger } from './infra/http/swagger';

// Inicializar la aplicación Express
const app = express();

// Middlewares básicos
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('combined'));

// Configuración de límite de tasa para prevenir ataques DoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana de tiempo por IP
});
app.use(limiter);

// Configuración de Swagger
setupSwagger(app);

// Configurar rutas
setupRoutes(app);

// Middleware para manejo de errores (debe estar después de las rutas)
app.use(errorHandler);

// Crear servidor HTTP y configurar Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Configurar Socket.io
setupSocketServer(io);

// Inicializar la conexión a la base de datos
AppDataSource.initialize()
  .then(() => {
    logger.info('Conexión a la base de datos establecida');
    
    // Iniciar el servidor
    const PORT = process.env.PORT || 3001;
    httpServer.listen(PORT, () => {
      logger.info(`Servidor en ejecución en el puerto ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error('Error al conectar con la base de datos:', error);
  });

// Manejo de señales para cierre graceful
process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido. Cerrando servidor...');
  httpServer.close(() => {
    logger.info('Servidor HTTP cerrado.');
    AppDataSource.destroy().then(() => {
      logger.info('Conexión a la base de datos cerrada.');
      process.exit(0);
    });
  });
});

export default app; 