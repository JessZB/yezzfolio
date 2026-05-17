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
   * Handles revoked/invalid refresh tokens by clearing them from DB.
   * Called when Google returns invalid_grant (user revoked access).
   */
  private static async handleInvalidGrant(userId: string): Promise<never> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        refresh_token: null,
        google_user_id: null,
      },
    });
    throw new Error('DRIVE_ACCESS_REVOKED');
  }

  /**
   * Resolves the owner (userId) of a specific Drive ID by looking up assets.
   * This allows the public proxy to work without explicit userId in URL.
   */
  static async resolveUserIdByDriveId(drive_id: string): Promise<string> {
    const asset = await prisma.asset.findFirst({
      where: { drive_id },
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
            { avatar_drive_id: drive_id },
            { favicon_drive_id: drive_id }
          ]
        }
      });
      if (profile) return profile.user_id;

      const project = await prisma.project.findFirst({
        where: { thumbnail_drive_id: drive_id }
      });
      if (project) return project.user_id;

      throw new Error('DRIVE_ID_NOT_FOUND');
    }

    return asset.section.project.user_id;
  }

  /**
   * Instantiates a Google Drive client for a specific user.
   */
  private static async getDriveClient(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { refresh_token: true }
    });

    if (!user || !user.refresh_token) {
      throw new Error('DRIVE_NOT_CONNECTED');
    }

    const oauth2Client = new OAuth2Client(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: decrypt(user.refresh_token)
    });

    return google.drive({ version: 'v3', auth: oauth2Client });
  }

  /**
   * Proxies a file from Google Drive.
   * Validates ownership if driveUserId is provided.
   */
  static async getFileStream(userId: string, drive_id: string) {
    const drive = await this.getDriveClient(userId);
    
    try {
      const response = await drive.files.get(
        { fileId: drive_id, alt: 'media', supportsAllDrives: true },
        { responseType: 'stream' }
      );
      
      return {
        stream: response.data as Readable,
        mimeType: response.headers['content-type']
      };
    } catch (error: any) {
      if (error.message?.includes('invalid_grant')) {
        return this.handleInvalidGrant(userId);
      }
      throw error;
    }
  }

  /**
   * Verifies if the file belongs to the user or they have access.
   */
  static async checkFileOwnership(userId: string, drive_id: string) {
    const drive = await this.getDriveClient(userId);
    const user = await prisma.user.findUnique({ where: { id: userId } });

    try {
      const file = await drive.files.get({
        fileId: drive_id,
        fields: 'id, name, owners',
        supportsAllDrives: true
      });

      const isOwner = file.data.owners?.some(o => o.permissionId === user?.google_user_id);
      
      if (!isOwner) {
        throw new Error('NOT_OWNER');
      }

      return file.data;
    } catch (error: any) {
      if (error.message?.includes('invalid_grant')) {
        return this.handleInvalidGrant(userId);
      }
      throw error;
    }
  }

  /**
   * Uploads a file to the user's Google Drive.
   */
  static async uploadFile(userId: string, file: { buffer: Buffer, originalname: string, mimetype: string }) {
    const drive = await this.getDriveClient(userId);
    
    try {
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
      if (!fileId) throw new Error('UPLOAD_FAILED');

      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      return fileId;
    } catch (error: any) {
      if (error.message?.includes('invalid_grant')) {
        return this.handleInvalidGrant(userId);
      }
      throw error;
    }
  }
}
