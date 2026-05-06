const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const logger = require('./utils/logger');
require('dotenv').config();

const app = express();

// Middlewares
app.set('trust proxy', true); // Trust proxy para obtener la IP real (x-forwarded-for)
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom format sin colores (evita [36m, [0m) e incluyendo la IP de forma explícita
const morganFormat = 'IP: :remote-addr | Método: :method | Ruta: :url | Código: :status | Tiempo: :response-time ms';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Static files (for uploads if needed to serve them)
app.use('/uploads', express.static('uploads'));

// Basic health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running' });
});

const authRoutes = require('./routes/auth.routes');
const uploadRoutes = require('./routes/upload.routes');
const adminRoutes = require('./routes/admin.routes');

app.use('/api/auth', authRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`[${req.method}] ${req.originalUrl} - IP: ${req.ip} - ${err.message} \n${err.stack}`);
  res.status(500).json({ error: 'Algo salió mal en el servidor.' });
});

// Capture unhandled errors that might crash the process
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}\n${err.stack}`);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

module.exports = app;
