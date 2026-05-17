import { Role, Status } from '@prisma/client';
import prisma from '../../core/db.js';

/**
 * UsersService
 * Handles business logic for user management, including invitations and system statistics.
 */
export class UsersService {
  /**
   * Invites a new user by adding them to the whitelist with a PENDING_INVITE status.
   */
  static async inviteUser(email: string, role: Role = Role.ARTIST) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('USER_ALREADY_EXISTS');
    }

    return await prisma.user.create({
      data: {
        email,
        role,
        status: Status.PENDING_INVITE,
      },
    });
  }

  /**
   * Fetches global system statistics.
   */
  static async getSystemStats() {
    const [totalArtists, activeArtists, pendingInvites, totalProjects, publishedProjects] = await Promise.all([
      prisma.user.count({ where: { role: Role.ARTIST } }),
      prisma.user.count({ where: { status: Status.ACTIVE } }),
      prisma.user.count({ where: { status: Status.PENDING_INVITE } }),
      prisma.project.count(),
      prisma.project.count({ where: { isPublished: true } }),
    ]);

    return {
      users: {
        total: totalArtists,
        active: activeArtists,
        pending: pendingInvites,
      },
      projects: {
        total: totalProjects,
        published: publishedProjects,
      },
    };
  }

  /**
   * Lists all users in the system with their project counts.
   */
  static async listUsers() {
    return await prisma.user.findMany({
      include: {
        _count: {
          select: { projects: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
