import jwt from "jsonwebtoken";
import authRepository from "../repository/authRepository";

class AuthService {
  private readonly SECRET_KEY = "OWASP_TOKEN_2026_VERY_SECRET";

  async login(email: string) {
    // Simula a busca de um usuário comum (ID: 15, por exemplo)
    const payload = {
      id: 15,
      nome: "Larissa Moreira",
      email: email,
      role: "user",
    };

    // Gera um token válido inicialmente
    return jwt.sign(payload, this.SECRET_KEY, { algorithm: "HS256" });
  }

  async getVulnerableData() {
    // Retorna os dados diretamente, sem nenhuma validação.
    return await authRepository.getAllData();
  }

  async getSecureData(token: string): Promise<any> {
    if (!token) {
      throw new Error("Token de autenticação não fornecido.");
    }

    try {
      const allowedAlgorithms: any = ["HS256", "none"];

      // Decodifica para inspecionar o cabeçalho
      const decodedToken = jwt.decode(token, { complete: true }) as any;
      
      if (!decodedToken) {
        throw new Error("Formato de token inválido.");
      }

      const alg = decodedToken?.header?.alg;
      console.log(`[AUTH] Processando token com algoritmo: ${alg}`);

      // VULNERABILIDADE (Broken Authentication):
      // Se o algoritmo for 'none' e estiver na lista de permitidos, aceitamos sem validar assinatura.
      if (alg === "none" && allowedAlgorithms.includes("none")) {
        console.log("⚠️ AVISO: Bypass detectado! Processando token sem assinatura (alg: none).");
        return decodedToken.payload;
      }

      // Caso contrário, valida normalmente com a chave secreta
      return jwt.verify(token, this.SECRET_KEY, {
        algorithms: allowedAlgorithms,
      }) as any;
      
    } catch (error: any) {
      console.error(`[AUTH] Erro na validação: ${error.message}`);
      throw new Error("Token de autenticação inválido: " + error.message);
    }
  }

  async getAdminData(token: string) {
    // 1. Primeiro valida o token (usando a lógica vulnerável que permite bypass)
    const decoded = await this.getSecureData(token);

    // 2. VERIFICAÇÃO DE AUTORIZAÇÃO (Onde o ataque de bypass terá sucesso se o role for alterado)
    if (decoded.role !== "admin") {
      throw new Error("Acesso negado: Este recurso é restrito a administradores.");
    }

    // 3. Se for admin, retorna todos os dados sensíveis do repositório
    return await authRepository.getAllData();
  }
}

export default new AuthService();
