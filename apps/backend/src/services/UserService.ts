import { User, UserRole } from "@kabary/shared";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export class UserService {
  private readonly allowedRoles = new Set([
    "ADMIN",
    "INSTITUTION",
    "PRO",
    "BEGINNER",
    "STUDENT",
    "SPECTATOR",
  ]);
  
  async register(data: any): Promise<{ user: User; token: string }> {
    const { name, phone, password, role, email } = data;

    console.log(`\n🚀 [AUTH] Tentative d'inscription: ${name} (${phone}) - Rôle: ${role}`);

    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      console.warn(`⚠️ [AUTH] Inscription échouée: Le numéro ${phone} existe déjà.`);
      throw new Error("Laharana finday efa miasa.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: typeof email === "string" && email.trim() ? email.trim() : undefined,
        phone,
        password: hashedPassword,
        role: role as any,
      }
    });

    console.log(`✅ [AUTH] Utilisateur créé avec succès! ID: ${user.id}`);
    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  async login(phone: string, password: string): Promise<{ user: User; token: string }> {
    console.log(`\n🔑 [AUTH] Tentative de connexion pour: ${phone}`);

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      console.warn(`❌ [AUTH] Connexion échouée: Utilisateur ${phone} introuvable.`);
      throw new Error("Tsy hita ity mpikambana ity.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`❌ [AUTH] Connexion échouée: Mauvais mot de passe pour ${phone}.`);
      throw new Error("Diso ny teny fanalahidy.");
    }

    console.log(`🔓 [AUTH] Connexion réussie pour: ${user.name} (${user.role})`);
    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  async getUsersByRole(role: string) {
    const normalizedRole = String(role || "").toUpperCase();
    if (!this.allowedRoles.has(normalizedRole)) {
      throw new Error("Rôle invalide.");
    }

    const users = await prisma.user.findMany({
      where: { role: normalizedRole as any },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        bio: true,
        photo: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return users;
  }

  async getProfileById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        bio: true,
        photo: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateMyProfile(userId: string, data: { name?: string; bio?: string; email?: string; photo?: string; role?: string }) {
    const payload: { name?: string; bio?: string; email?: string; photo?: string; role?: any } = {};
    if (typeof data.name === "string") payload.name = data.name.trim();
    if (typeof data.bio === "string") payload.bio = data.bio.trim();
    if (typeof data.email === "string") payload.email = data.email.trim() || undefined;
    if (typeof data.photo === "string") payload.photo = data.photo.trim() || undefined;
    if (typeof data.role === "string") {
      const normalizedRole = data.role.toUpperCase();
      if (!this.allowedRoles.has(normalizedRole)) {
        throw new Error("Rôle invalide.");
      }
      payload.role = normalizedRole;
    }

    if (Object.keys(payload).length === 0) {
      throw new Error("Aucune donnée à mettre à jour.");
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: payload,
    });

    return this.sanitizeUser(updated);
  }

  private generateToken(user: any) {
    return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
  }

  private sanitizeUser(user: any): User {
    const { password, ...rest } = user;
    return rest;
  }
}

export const userService = new UserService();
