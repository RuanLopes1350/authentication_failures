import fs from "fs/promises";
import path from "path";

class AuthRepository {
  private filePath: string;

  constructor() {
    this.filePath = path.join(__dirname, "../../bancoDeDados.json");
  }

  async getAllData() {
    try {
      const content = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      throw new Error("Erro ao ler o banco de dados.");
    }
  }
}

export default new AuthRepository();
