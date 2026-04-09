import { Request, Response } from "express";
import authService from "../service/authService";
import CommonResponse from "../utils/commonResponse";

class AuthController {
  async login(req: Request, res: Response) {
    const { email } = req.body;
    try {
      const token = await authService.login(email);
      return CommonResponse.success(res, { token }, 200, "Token gerado com sucesso. Use este token no cabeçalho 'Authorization: Bearer <token>'.");
    } catch (error: any) {
      return CommonResponse.serverError(res, error.message, "Erro ao realizar login.");
    }
  }

  async vulnerableHandler(req: Request, res: Response) {
    try {
      const data = await authService.getVulnerableData();
      return CommonResponse.success(res, data, 200, "Listando dados dos inscritos (Vulnerável).");
    } catch (error: any) {
      return CommonResponse.serverError(res, error.message, "Erro ao buscar dados vulneráveis.");
    }
  }

  async secureHandler(req: Request, res: Response) {
    // Extrai o token do cabeçalho Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Espera "Bearer <token>"

    try {
      const data = await authService.getSecureData(token as string);
      return CommonResponse.success(res, data, 200, "Dados obtidos com sucesso.");
    } catch (error: any) {
      if (error.message.includes("Token")) {
        return CommonResponse.error(res, 401, "Não Autorizado", null, [], error.message);
      }
      return CommonResponse.serverError(res, error.message, "Erro ao buscar dados.");
    }
  }

  async adminDataHandler(req: Request, res: Response) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    try {
      const data = await authService.getAdminData(token as string);
      return CommonResponse.success(res, data, 200, "Dados administrativos sensíveis acessados!");
    } catch (error: any) {
      return CommonResponse.error(res, 403, "Acesso Negado", null, [], error.message);
    }
  }
}

export default new AuthController();
