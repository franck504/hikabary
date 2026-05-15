import { Request, Response } from "express";
import { kabaryService } from "../services/KabaryService";

export class KabaryController {
  
  async create(req: Request, res: Response) {
    try {
      const { title, type, image, description, rules, participantRoles, sessionMode } = req.body;
      const authorId = (req as any).user?.id;

      if (!authorId) {
        return res.status(401).json({ error: "Tsy nahitana mpampiasa. Midira aloha." });
      }

      const context = await kabaryService.createContext({
        title,
        type,
        image,
        description,
        rules,
        participantRoles,
        sessionMode,
        authorId
      });

      res.status(201).json(context);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const contexts = await kabaryService.getAllContexts();
      res.json(contexts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getOne(req: Request, res: Response) {
    try {
      const context = await kabaryService.getContextById(req.params.id);
      if (!context) return res.status(404).json({ error: "Tsy hita io contexte io" });
      res.json(context);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const kabaryController = new KabaryController();
