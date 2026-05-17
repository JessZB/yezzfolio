import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { env } from './config/env.js';
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import projectRoutes from './modules/projects/projects.routes.js';
import profileRoutes from './modules/profile/profile.routes.js';
import driveRoutes from './modules/drive/drive.routes.js';
import generatorRoutes from './modules/generator/generator.routes.js';
import { errorHandler } from './core/middlewares/errorHandler.js';

const app = express();

// Middleware

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// CORS
const allowedOrigins = env.CORS_ORIGIN.split(',').map(o => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());

// --- Routes ---

// Authentication (Includes Drive OAuth)
app.use('/api/auth', authRoutes);

// Artist Profile (New Module)
app.use('/api/profile', profileRoutes);

// Content Management
app.use('/api/projects', projectRoutes);
app.use('/api/drive', driveRoutes);
app.use('/api/generator', generatorRoutes);

// Admin / Whitelist management
app.use('/api/admin/users', usersRoutes);

// --- Error Handling ---
app.use(errorHandler);

export default app;
