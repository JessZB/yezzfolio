import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import projectRoutes from './modules/projects/projects.routes.js';
import profileRoutes from './modules/profile/profile.routes.js';
import driveRoutes from './modules/drive/drive.routes.js';
import generatorRoutes from './modules/generator/generator.routes.js';
import { errorHandler } from './core/middlewares/errorHandler.js';
const app = express();
// Middleware
app.use(cors());
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
//# sourceMappingURL=app.js.map