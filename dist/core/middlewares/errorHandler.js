import { logger } from '../utils/logger.js';
export const errorHandler = (err, req, res, next) => {
    logger.error(err.message || 'Internal Server Error', err);
    const statusCode = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        success: false,
        error: message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};
//# sourceMappingURL=errorHandler.js.map