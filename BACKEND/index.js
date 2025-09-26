import express from "express";
import registerRoutes from "./Routes/Register.js";
import loginRoutes from "./Routes/Login.js";
import reviewsRoutes from "./Routes/Reviews.js";
import openAIServiceRoute from "./Routes/OpenAIService.js"
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY;

app.use(express.json());
app.use(cors());

// Manejo de rutas
app.use("/login", loginRoutes);
app.use("/register", registerRoutes);
app.use("/reviews", reviewsRoutes);
app.use("openAIService", openAIServiceRoute);

// Middleware para autenticar el token enviado desde la petición
export function authMiddleware(req, res, next) {
  console.log("Buenassss")
  const authHeader = req.headers["authorization"]; 
  if (!authHeader) return res.status(401).json({ message: "No token provided!" });

  const token = authHeader.split(" ")[1]; 
  try {
    console.log(token);
    const decoded = jwt.verify(token, SECRET_KEY); 
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token inválido o expirado" });
  }
}

// Endpoint por si no se reconoce ninguna ruta
app.use((req, res) => {
  res.status(404).json({
    "success": "failed",
    "message": `route not found`
  })
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});