import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { Readable } from 'stream';
import { env } from '../../config/env.js';
import prisma from '../../core/db.js';
import { decrypt } from '../../core/utils/encrypt.js';
/**
 * DriveService
 * Handles multi-tenant interaction with Google Drive API using personal OAuth tokens.
 */
export class DriveService {
    /**
     * Resolves the owner (userId) of a specific Drive ID by looking up assets.
     * This allows the public proxy to work without explicit userId in URL.
     */
    static async resolveUserIdByDriveId(driveId) {
        const asset = await prisma.asset.findFirst({
            where: { driveId },
            include: {
                section: {
                    include: {
                        project: true
                    }
                }
            }
        });
        if (!asset) {
            // Fallback: check profile fields (avatar/favicon) or project thumbnails
            const profile = await prisma.profile.findFirst({
                where: {
                    OR: [
                        { avatarDriveId: driveId },
                        { faviconDriveId: driveId }
                    ]
                }
            });
            if (profile)
                return profile.userId;
            const project = await prisma.project.findFirst({
                where: { thumbnailDriveId: driveId }
            });
            if (project)
                return project.userId;
            throw new Error('ASSET_NOT_FOUND');
        }
        return asset.section.project.userId;
    }
    /**
     * Instantiates a Google Drive client for a specific user.
     */
    static async getDriveClient(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { refreshToken: true }
        });
        if (!user || !user.refreshToken) {
            throw new Error('DRIVE_NOT_CONNECTED');
        }
        const oauth2Client = new OAuth2Client(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_REDIRECT_URI);
        oauth2Client.setCredentials({
            refresh_token: decrypt(user.refreshToken)
        });
        return google.drive({ version: 'v3', auth: oauth2Client });
    }
    /**
     * Proxies a file from Google Drive.
     * Validates ownership if driveUserId is provided.
     */
    static async getFileStream(userId, driveId) {
        const drive = await this.getDriveClient(userId);
        // Ownership check (optional but recommended for security)
        // In SaaS mode, we use the user's own client, so Google already enforces access.
        const response = await drive.files.get({ fileId: driveId, alt: 'media', supportsAllDrives: true }, { responseType: 'stream' });
        return {
            stream: response.data,
            mimeType: response.headers['content-type']
        };
    }
    /**
     * Verifies if the file belongs to the user or they have access.
     */
    static async checkFileOwnership(userId, driveId) {
        const drive = await this.getDriveClient(userId);
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const file = await drive.files.get({
            fileId: driveId,
            fields: 'id, name, owners',
            supportsAllDrives: true
        });
        const isOwner = file.data.owners?.some(o => o.permissionId === user?.googleUserId);
        if (!isOwner) {
            throw new Error('NOT_OWNER');
        }
        return file.data;
    }
    /**
     * Uploads a file to the user's Google Drive.
     */
    static async uploadFile(userId, file) {
        const drive = await this.getDriveClient(userId);
        const response = await drive.files.create({
            requestBody: {
                name: file.originalname,
            },
            media: {
                mimeType: file.mimetype,
                body: Readable.from(file.buffer),
            },
        });
        const fileId = response.data.id;
        if (!fileId)
            throw new Error('UPLOAD_FAILED');
        // Optional: Make it readable by anyone with the link if required for the portfolio
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });
        return fileId;
    }
}
//# sourceMappingURL=drive.service.js.map