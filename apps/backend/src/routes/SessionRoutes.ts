import { Router } from "express";
import { sessionController } from "../controllers/SessionController";
import { authMiddleware, checkRole } from "../middleware/AuthMiddleware";

const router = Router();

// Voir les sessions en cours (Public)
router.get("/active", sessionController.listActive);
router.get("/:id", sessionController.getOne);
router.patch("/:id/thumbnail", authMiddleware, sessionController.updateThumbnail);

// Réagir à une session (Public ou Connecté)
router.post("/:id/react", sessionController.react);

// Signaux WebRTC (Public)
router.post("/:id/signal", sessionController.postSignal);
router.get("/:id/signals", sessionController.fetchSignals);

// Créer une session (Nécessite d'être connecté)
router.post("/", authMiddleware, checkRole(["ADMIN", "INSTITUTION", "PRO", "BEGINNER"]), sessionController.create);

export default router;
