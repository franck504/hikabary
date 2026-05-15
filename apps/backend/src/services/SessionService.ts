import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class SessionService {
  async createSession(data: {
    contextId: string;
    speakerId: string;
    title?: string;
    participantRoleKey?: string;
    participantRoleLabel?: string;
  }) {
    console.log(`\n🎤 [SESSION] Fanombohana session vaovao: ${data.title || 'Kabary Live'}`);

    const context = await prisma.context.findUnique({
      where: { id: data.contextId },
      select: { id: true, sessionMode: true },
    });
    if (!context) {
      throw new Error("Tsy hita ilay lohahevitra");
    }

    if (context.sessionMode === "CONTINUOUS_LIVE" && data.participantRoleKey) {
      const existing = await prisma.session.findFirst({
        where: {
          contextId: data.contextId,
          status: "ONGOING",
          participantRoleKey: data.participantRoleKey,
        },
        select: { id: true },
      });
      if (existing) {
        throw new Error("Efa misy mpikabary amin'io andraikitra io amin'ity live mitohy ity.");
      }
    }

    return await prisma.session.create({
      data: {
        title: data.title,
        contextId: data.contextId,
        speakerId: data.speakerId,
        participantRoleKey: data.participantRoleKey,
        participantRoleLabel: data.participantRoleLabel,
        status: "ONGOING" // On commence direct en live pour l'instant
      },
      include: {
        context: true,
        speaker: {
          select: { id: true, name: true, role: true, photo: true }
        }
      }
    });
  }

  async getActiveSessions() {
    return await prisma.session.findMany({
      where: {
        status: "ONGOING"
      },
      include: {
        context: true,
        speaker: {
          select: { id: true, name: true, role: true, photo: true }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  async getSessionById(id: string) {
    return await prisma.session.findUnique({
      where: { id },
      include: {
        context: true,
        speaker: {
          select: { id: true, name: true, role: true, photo: true }
        },
        reactions: true
      }
    });
  }

  async addReaction(sessionId: string, type: string, userId?: string) {
    console.log(`\n❤️ [REACTION] ${type} ho an'ny session: ${sessionId}`);
    return await prisma.reaction.create({
      data: {
        type,
        sessionId,
        userId
      }
    });
  }

  async addSignal(sessionId: string, senderId: string, type: string, data: string) {
    return await prisma.streamSignal.create({
      data: {
        sessionId,
        senderId,
        type,
        data
      }
    });
  }

  async getSignals(sessionId: string, after?: Date) {
    return await prisma.streamSignal.findMany({
      where: {
        sessionId,
        createdAt: {
          gt: after || new Date(0)
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
  }
}

export const sessionService = new SessionService();
