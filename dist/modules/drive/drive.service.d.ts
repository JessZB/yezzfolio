import { Readable } from 'stream';
/**
 * DriveService
 * Handles multi-tenant interaction with Google Drive API using personal OAuth tokens.
 */
export declare class DriveService {
    /**
     * Resolves the owner (userId) of a specific Drive ID by looking up assets.
     * This allows the public proxy to work without explicit userId in URL.
     */
    static resolveUserIdByDriveId(driveId: string): Promise<string>;
    /**
     * Instantiates a Google Drive client for a specific user.
     */
    private static getDriveClient;
    /**
     * Proxies a file from Google Drive.
     * Validates ownership if driveUserId is provided.
     */
    static getFileStream(userId: string, driveId: string): Promise<{
        stream: Readable;
        mimeType: string | undefined;
    }>;
    /**
     * Verifies if the file belongs to the user or they have access.
     */
    static checkFileOwnership(userId: string, driveId: string): Promise<import("googleapis").drive_v3.Schema$File>;
    /**
     * Uploads a file to the user's Google Drive.
     */
    static uploadFile(userId: string, file: {
        buffer: Buffer;
        originalname: string;
        mimetype: string;
    }): Promise<string>;
}
