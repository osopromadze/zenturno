import { Server, Socket } from 'socket.io';
import { logger } from '../../utils/logger';

// Extender la interfaz Server para incluir nuestros métodos personalizados
declare module 'socket.io' {
  interface Server {
    notifyUser: (userId: string, event: string, data: any) => void;
    notifyAppointment: (appointmentId: string, event: string, data: any) => void;
  }
}

/**
 * Configura el servidor de Socket.IO
 * @param io Instancia de Socket.IO Server
 */
export const setupSocketServer = (io: Server): void => {
  // Middleware para autenticación de sockets
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    // Aquí se verificaría el token JWT y se asignaría el usuario al socket
    // Por simplicidad, lo dejamos comentado
    // try {
    //   const decoded = jwt.verify(token, config.jwt.secret);
    //   socket.data.user = decoded;
    //   next();
    // } catch (error) {
    //   return next(new Error('Authentication error'));
    // }
    
    // Por ahora, permitimos todas las conexiones
    next();
  });

  // Evento de conexión
  io.on('connection', (socket: Socket) => {
    logger.info('User connected', {
      socketId: socket.id,
      userId: socket.data.user?.id,
    });

    // Unir al socket a salas según su rol
    if (socket.data.user) {
      socket.join(`user:${socket.data.user.id}`);
      
      if (socket.data.user.role === 'admin') {
        socket.join('admins');
      } else if (socket.data.user.role === 'professional') {
        socket.join('professionals');
        socket.join(`professional:${socket.data.user.id}`);
      } else if (socket.data.user.role === 'client') {
        socket.join('clients');
      }
    }

    // Evento para unirse a sala de citas
    socket.on('join:appointment', (appointmentId: string) => {
      socket.join(`appointment:${appointmentId}`);
      logger.debug(`Socket ${socket.id} joined appointment:${appointmentId}`);
    });

    // Evento para desconectarse
    socket.on('disconnect', () => {
      logger.info('User disconnected', {
        socketId: socket.id,
        userId: socket.data.user?.id,
      });
    });
  });

  // Función para enviar notificación a un usuario específico
  const notifyUser = (userId: string, event: string, data: any): void => {
    io.to(`user:${userId}`).emit(event, data);
    logger.debug(`Notification sent to user ${userId}`, { event, data });
  };

  // Función para notificar sobre una cita
  const notifyAppointment = (appointmentId: string, event: string, data: any): void => {
    io.to(`appointment:${appointmentId}`).emit(event, data);
    logger.debug(`Notification sent to appointment ${appointmentId}`, { event, data });
  };

  // Exponer funciones para ser utilizadas desde otras partes de la aplicación
  io.notifyUser = notifyUser;
  io.notifyAppointment = notifyAppointment;
}; 