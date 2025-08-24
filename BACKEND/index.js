import express from "express";
import registerRoutes from "./Routes/Register.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use("/register", registerRoutes);
app.use((req, res) => {
  res.status(404).json({
    "success": "failed",
    "message": `route not found`
  })
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});