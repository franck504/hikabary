import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class SessionService {
  private toParticipant(session: any) {
    return {
      id: session.speaker.id,
      name: session.speaker.name,
      role: session.speaker.role,
      photo: session.speaker.photo,
      participantRoleKey: session.participantRoleKey,
      participantRoleLabel: session.participantRoleLabel,
    };
  }

  private attachParticipants(session: any, relatedSessions: any[]) {
    return {
      ...session,
      liveThumbnail: session.liveThumbnail || relatedSessions.find((relatedSession) => relatedSession.liveThumbnail)?.liveThumbnail || null,
      participants: relatedSessions.map((relatedSession) => this.toParticipant(relatedSession)),
    };
  }

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

    const createdSession = await prisma.session.create({
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

    if (context.sessionMode !== "CONTINUOUS_LIVE") {
      return createdSession;
    }

    const liveSessionsForContext = await prisma.session.findMany({
      where: {
        contextId: data.contextId,
        status: "ONGOING",
      },
      include: {
        context: true,
        speaker: {
          select: { id: true, name: true, role: true, photo: true }
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    const primarySession = liveSessionsForContext[0] || createdSession;
    return this.attachParticipants(primarySession, liveSessionsForContext);
  }

  async getActiveSessions() {
    const sessions = await prisma.session.findMany({
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

    const groupedContinuousSessions = new Set<string>();
    const activeSessions: any[] = [];

    for (const session of sessions) {
      if (session.context.sessionMode !== "CONTINUOUS_LIVE") {
        activeSessions.push(this.attachParticipants(session, [session]));
        continue;
      }

      if (groupedContinuousSessions.has(session.contextId)) continue;
      const relatedSessions = sessions
        .filter((relatedSession: any) => relatedSession.contextId === session.contextId)
        .sort((a: any, b: any) => a.createdAt.getTime() - b.createdAt.getTime());
      const primarySession = relatedSessions[0] || session;

      groupedContinuousSessions.add(session.contextId);
      activeSessions.push(this.attachParticipants(primarySession, relatedSessions));
    }

    return activeSessions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getSessionById(id: string) {
    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        context: true,
        speaker: {
          select: { id: true, name: true, role: true, photo: true }
        },
        reactions: true
      }
    });

    if (!session) return null;

    if (session.context.sessionMode !== "CONTINUOUS_LIVE") {
      return this.attachParticipants(session, [session]);
    }

    const relatedSessions = await prisma.session.findMany({
      where: {
        contextId: session.contextId,
        status: "ONGOING",
      },
      include: {
        context: true,
        speaker: {
          select: { id: true, name: true, role: true, photo: true }
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    return this.attachParticipants(session, relatedSessions);
  }

  async updateLiveThumbnail(sessionId: string, userId: string, liveThumbnail: string) {
    if (!liveThumbnail.startsWith("data:image/")) {
      throw new Error("Sary tsy mety.");
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        context: true,
      },
    });

    if (!session) {
      throw new Error("Tsy hita io session io");
    }

    const activeParticipant = await prisma.session.findFirst({
      where: {
        contextId: session.contextId,
        status: "ONGOING",
        speakerId: userId,
      },
      select: { id: true },
    });

    if (!activeParticipant) {
      throw new Error("Tsy afaka manavao sary amin'ity live ity ianao.");
    }

    if (session.context.sessionMode === "CONTINUOUS_LIVE") {
      await prisma.session.updateMany({
        where: {
          contextId: session.contextId,
          status: "ONGOING",
        },
        data: { liveThumbnail },
      });
      return { liveThumbnail };
    }

    await prisma.session.update({
      where: { id: sessionId },
      data: { liveThumbnail },
    });

    return { liveThumbnail };
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
