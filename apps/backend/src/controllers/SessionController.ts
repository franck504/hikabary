import { Request, Response } from "express";
import { sessionService } from "../services/SessionService";

export class SessionController {
  async create(req: Request, res: Response) {
    try {
      const { contextId, title, participantRoleKey, participantRoleLabel } = req.body;
      const speakerId = (req as any).user?.id; // On récupère l'ID du token JWT

      if (!speakerId) {
        return res.status(401).json({ error: "Tsy nahitana mpampiasa. Midira aloha." });
      }

      const session = await sessionService.createSession({
        contextId,
        speakerId,
        title,
        participantRoleKey,
        participantRoleLabel,
      });

      res.status(201).json(session);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async listActive(req: Request, res: Response) {
    try {
      const sessions = await sessionService.getActiveSessions();
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getOne(req: Request, res: Response) {
    try {
      const session = await sessionService.getSessionById(req.params.id);
      if (!session) return res.status(404).json({ error: "Tsy hita io session io" });
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async react(req: Request, res: Response) {
    try {
      const { type } = req.body;
      const { id } = req.params;
      const userId = (req as any).user?.id; // Optionnel, car un spectateur non-connecté peut aussi réagir

      const reaction = await sessionService.addReaction(id, type, userId);
      res.status(201).json(reaction);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async postSignal(req: Request, res: Response) {
    try {
      const { type, data, senderId } = req.body;
      const { id } = req.params;
      const signal = await sessionService.addSignal(id, senderId, type, data);
      res.status(201).json(signal);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async fetchSignals(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { after } = req.query;
      const signals = await sessionService.getSignals(id, after ? new Date(after as string) : undefined);
      res.json(signals);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const sessionController = new SessionController();
