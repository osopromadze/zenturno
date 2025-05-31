import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

// Centralized application configuration
const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
  
  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    username: process.env.DB_USER || 'zenturno_user',
    password: process.env.DB_PASSWORD || 'zenturno_password',
    database: process.env.DB_NAME || 'zenturno_dev',
    logging: process.env.DB_LOGGING === 'true',
  },
  
  // Redis configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your_very_secure_jwt_secret_key',
    expiresIn: process.env.JWT_EXPIRATION || '24h',
  },
  
  // Email configuration
  email: {
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
    user: process.env.SMTP_USER || 'user@example.com',
    pass: process.env.SMTP_PASS || 'password',
    from: process.env.EMAIL_FROM || 'noreply@zenturno.com',
  },
  
  // SMS (Twilio) configuration
  sms: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  },
  
  // Image storage (Cloudinary) configuration
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  
  // Frontend URL para CORS
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Limits and configurations
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX, 10) : 100,
  },
};

export default config; 