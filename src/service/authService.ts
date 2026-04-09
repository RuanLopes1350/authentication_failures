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
      role: "user"
    };

    // Gera um token válido inicialmente
    return jwt.sign(payload, this.SECRET_KEY, { algorithm: "HS256" });
  }

  async getVulnerableData() {
    // Retorna os dados diretamente, sem nenhuma validação.
    return await authRepository.getAllData();
  }

  async getSecureData(token: string) {
    if (!token) {
      throw new Error("Token de autenticação não fornecido.");
    }

    try {
      /**
       * VULNERABILIDADE (Broken Authentication):
       * Aqui simulamos um erro comum: o desenvolvedor decide olhar o cabeçalho do token
       * ANTES de validar a assinatura para decidir como processá-lo.
       */
      const decodedToken = jwt.decode(token, { complete: true }) as any;
      const alg = decodedToken?.header?.alg;

      let decoded: any;

      if (alg === "none") {
        // FALHA CRÍTICA: Se o algoritmo for 'none', o desenvolvedor confia no payload sem verificar assinatura.
        console.log("AVISO: Processando token sem assinatura (alg: none)!");
        decoded = decodedToken.payload;
      } else {
        // Se houver um algoritmo, ele tenta verificar normalmente.
        decoded = jwt.verify(token, this.SECRET_KEY, {
          algorithms: ["HS256"]
        }) as any;
      }

      // Se o atacante mudou o ID no payload para 1 (admin), ou mudou a role para admin
      if (decoded.role === "admin" || decoded.id === 1) {
        console.log("ACESSO DE ADMINISTRADOR CONCEDIDO VIA JWT BYPASS!");
        return await authRepository.getAllData();
      }

      return { 
        id: decoded.id, 
        nome: decoded.nome, 
        email: decoded.email, 
        role: decoded.role,
        mensagem: "Você é um usuário comum."
      };
    } catch (error: any) {
      throw new Error("Token de autenticação inválido: " + error.message);
    }
  }

  async getAdminData(token: string) {
    // Reutiliza a lógica vulnerável acima
    return await this.getSecureData(token);
  }
}

export default new AuthService();
