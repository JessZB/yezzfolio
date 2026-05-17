import { DriveService } from './drive.service.js';
/**
 * DriveController
 * Entry point for Google Drive interactions.
 */
export class DriveController {
    /**
     * Public Proxy for Google Drive files.
     * Automatically resolves the owner to use their specific OAuth tokens.
     */
    static async proxy(req, res, next) {
        const driveId = req.params.driveId;
        try {
            // 1. Find who owns this file
            const userId = await DriveService.resolveUserIdByDriveId(driveId);
            // 2. Get the stream using that owner's tokens
            const { stream, mimeType } = await DriveService.getFileStream(userId, driveId);
            // 3. Set headers and pipe
            if (mimeType)
                res.setHeader('Content-Type', mimeType);
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
            stream.on('error', (err) => {
                console.error('[Drive.Proxy] Stream Error:', err);
                if (!res.headersSent)
                    res.status(404).json({ error: 'File not found' });
            });
            return stream.pipe(res);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Private endpoint to check if the authenticated user owns a file.
     */
    static async check(req, res, next) {
        const driveId = req.params.driveId;
        try {
            const fileMeta = await DriveService.checkFileOwnership(req.user.id, driveId);
            return res.status(200).json({ ok: true, file: fileMeta });
        }
        catch (error) {
            if (error.message === 'NOT_OWNER') {
                return res.status(403).json({ error: 'No tienes permisos de propietario sobre este archivo.' });
            }
            next(error);
        }
    }
    /**
     * Authenticated file upload.
     */
    static async upload(req, res, next) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No se recibió ningún archivo.' });
            }
            const fileId = await DriveService.uploadFile(req.user.id, req.file);
            return res.status(201).json({
                message: 'Archivo subido con éxito',
                driveId: fileId
            });
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=drive.controller.js.map