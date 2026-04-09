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

      // VULNERABILIDADE (Broken Authentication):
      // Aqui simulamos um erro comum: o desenvolvedor decide olhar o cabeçalho do token
      // ANTES de validar a assinatura para decidir como processá-lo.
      const decodedToken = jwt.decode(token, { complete: true }) as any;
      const alg = decodedToken?.header?.alg;

      let decoded: any;

      try {
        decoded = jwt.verify(token, this.SECRET_KEY, {
          algorithms: allowedAlgorithms,
        }) as any;
      } catch (error: any) {
        // O bypass só ocorre se o desenvolvedor também tiver permitido explicitamente 'none'.
        if (alg === "none" && allowedAlgorithms.includes("none")) {
          console.log("AVISO: Processando token sem assinatura (alg: none)!");
          decoded = decodedToken.payload;
        } else {
          throw error; // Para outros erros, lança normalmente.
        }
      }
      return decoded;
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
