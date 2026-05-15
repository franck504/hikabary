import { Router } from "express";
import { kabaryController } from "../controllers/KabaryController";
import { authMiddleware, checkRole } from "../middleware/AuthMiddleware";

const router = Router();

// Créer un contexte (Autorisé pour Admin, Institution, Pro, Beginner)
router.post(
  "/create", 
  authMiddleware, 
  checkRole(["ADMIN", "INSTITUTION", "PRO", "BEGINNER"]), 
  kabaryController.create
);

// Lister les contextes (Public)
router.get("/contexts", kabaryController.list);

// Voir un contexte précis
router.get("/contexts/:id", kabaryController.getOne);

export default router;
