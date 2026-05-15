import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type ParticipantRoleInput = {
  key?: string;
  label?: string;
  description?: string;
  required?: boolean;
  slots?: number;
};

type ParticipantRoleTemplate = {
  key: string;
  label: string;
  description?: string;
  required: boolean;
  slots: number;
};

export class KabaryService {
  private normalizeSessionMode(input: unknown): "CONTINUOUS_LIVE" | "ASYNCHRONOUS_LIVE" {
    const value = String(input || "").toUpperCase();
    if (value === "ASYNCHRONOUS_LIVE") return "ASYNCHRONOUS_LIVE";
    return "CONTINUOUS_LIVE";
  }

  private sanitizeParticipantRoles(input: unknown): ParticipantRoleTemplate[] {
    if (!Array.isArray(input)) return [];

    return input
      .filter((item): item is ParticipantRoleInput => typeof item === "object" && item !== null)
      .map((item) => {
        const rawKey = (item.key || "").trim().toLowerCase();
        const rawLabel = (item.label || "").trim();
        const key = rawKey.replace(/[^a-z0-9_]/g, "_").slice(0, 40);
        const label = rawLabel.slice(0, 80);
        const description = (item.description || "").trim().slice(0, 220);
        const slots = Number.isFinite(item.slots) ? Math.max(1, Math.min(10, Number(item.slots))) : 1;

        return {
          key,
          label,
          description: description || undefined,
          required: Boolean(item.required),
          slots,
        };
      })
      .filter((item) => item.key.length > 0 && item.label.length > 0);
  }

  async createContext(data: any) {
    const { title, type, image, description, rules, participantRoles, sessionMode, authorId } = data;
    const normalizedSessionMode = this.normalizeSessionMode(sessionMode);
    const sanitizedParticipantRoles = this.sanitizeParticipantRoles(participantRoles).map((role) => ({
      ...role,
      slots: normalizedSessionMode === "CONTINUOUS_LIVE" ? 1 : role.slots,
    }));
    
    console.log(`\n📜 [KABARY] Famoronana contexte vaovao: ${title}`);

    return await prisma.context.create({
      data: {
        title,
        type,
        sessionMode: normalizedSessionMode,
        image: typeof image === "string" ? image.trim() || undefined : undefined,
        description,
        rules,
        participantRoles: sanitizedParticipantRoles.length > 0 ? sanitizedParticipantRoles : undefined,
        authorId,
      },
      include: {
        author: {
          select: { id: true, name: true, role: true, photo: true }
        }
      }
    });
  }

  async getAllContexts() {
    return await prisma.context.findMany({
      include: {
        author: {
          select: { id: true, name: true, role: true, photo: true }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  async getContextById(id: string) {
    return await prisma.context.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, role: true, photo: true }
        }
      }
    });
  }
}

export const kabaryService = new KabaryService();
