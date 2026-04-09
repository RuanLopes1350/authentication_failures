import { Router } from "express";
import authController from "../controller/authController";

const authRouter = Router();

// Endpoint para obter um token JWT válido
authRouter.post("/login", authController.login);

// Rota que demonstra Broken Authentication por falta total de verificação
authRouter.get("/vulnerable/auth", authController.vulnerableHandler);

// Rota que demonstra Broken Authentication permitindo bypass de JWT (algoritmo: none)
authRouter.get("/secure/auth", authController.secureHandler);

// Rota restrita a administradores (Vulnerável ao exploit de algorithm none)
authRouter.get("/admin/data", authController.adminDataHandler);

export default authRouter;
