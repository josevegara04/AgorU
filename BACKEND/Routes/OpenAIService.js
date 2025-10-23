import express, { response } from "express";
import { fetchReviews } from "./Reviews.js";
import { executeQuery } from "../db.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Endpoint para resumir reseñas
router.post("/summarizeGEMINI/:subjectId", fetchReviews, async (req, res) => {
  try {
    const resultName = await executeQuery(
      "SELECT name FROM subject WHERE id = ?",
      [req.params.subjectId]
    );

    const reviews = req.reviews;
    if (!reviews || reviews.length === 0) {
      return res.status(400).json({ message: "No reviews found to summarize" });
    }

    const concatenatedContent = reviews
      .map((review) => review.content)
      .join("\n");

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

      const prompt = `
Eres un asistente especializado en analizar reseñas académicas.
Resume las siguientes opiniones de estudiantes sobre la materia "${resultName[0].name}".
Destaca los aspectos positivos, negativos y la opinión general de manera que el lector tenga una idea general de lo que dicen los estudiantes sobre la materia. Por favor, no lo haga smuy extenso.

Reseñas:
${concatenatedContent}
`;
        console.log(prompt);

      const result = await model.generateContent(prompt);
      const summary = result.response.text();
      console.log("Resumen generado:", summary);
      res.json({ summary })
    } catch (geminiError) {
        console.error("Gemini API Error:", geminiError);

      if (geminiError.message?.includes("API key")) {
        return res.status(401).json({
          message: "Error de autenticación con Gemini. Verifica tu API key.",
          error: "AUTH_ERROR"
        });
      }

      if (geminiError.message?.includes("quota")) {
        return res.status(429).json({
          message: "Has excedido el límite de peticiones de Gemini. Por favor, intenta más tarde.",
          error: "RATE_LIMIT"
        });
      }

      return res.status(500).json({
        message: "Error al generar el resumen con Gemini",
        error: geminiError.message || "UNKNOWN_ERROR"
      });
    }
  } catch (err) {
    console.error(
      "❌ Error en Hugging Face:",
      err.response?.data || err.message
    );
    res
      .status(500)
      .json({ message: "Error al generar resumen con Hugging Face" });
  }
});

export default router;
