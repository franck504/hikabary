import { Router } from "express";
import { userController } from "../controllers/UserController";
import { authMiddleware } from "../middleware/AuthMiddleware";

const router = Router();

// Route pour l'inscription
router.post("/register", userController.register);

// Route pour la connexion
router.post("/login", userController.login);

// Route pour filtrer les utilisateurs par rôle
router.get("/role/:role", userController.getAllByRole);

// Route profil public
router.get("/profile/:id", userController.getProfileById);

// Mise à jour de son propre profil
router.patch("/me", authMiddleware, userController.updateMyProfile);

export default router;
