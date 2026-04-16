import express from "express";
import cors from "cors";
import authRouter from "./routes/authRoutes";

const PORT = 1350;
export const app = express();

app.use(cors());
app.use(express.json());

// Rota Health Check
app.get("/api", (req, res) => {
  res.send(
    `API de Controle de Atividades Físicas está funcionando! \nTempo de Uptime: ${process.uptime().toFixed(2)} segundos`,
  );
});

// Registrar rotas de autenticação
app.use("/api", authRouter);

app.get("/", (req, res) => {
  res.redirect("/api");
});

//função para iniciar o servidor
async function startServer() {
  try {
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error("Erro ao iniciar o servidor:", error);
    process.exit(1);
  }
}

startServer();
