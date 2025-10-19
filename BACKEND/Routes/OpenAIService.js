import express, { response } from "express";
import OpenAI from "openai";
import { fetchReviews } from "./Reviews.js";
import db from "../db.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const HF_MODEL = "microsoft/Phi-3-mini-4k-instruct";
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;
const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;

// Endpoint para resumir reseñas
router.post("/summarize/:subjectId", fetchReviews, async (req, res) => {
  try {
    const [resultName] = await db.query(
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
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Eres un asistente especializado en analizar y resumir reseñas académicas.",
          },
          {
            role: "user",
            content: `Por favor, resume las siguientes reseñas de la materia ${resultName[0].name}. Enfócate en los temas más mencionados y las opiniones generales:\n\n${concatenatedContent}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
      });

      const summary = completion.choices[0].message.content;

      res.json({ summary });
    } catch (openAiError) {
      console.error("OpenAI API Error:", openAiError);

      if (openAiError.response?.status === 429) {
        return res.status(429).json({
          message:
            "Has excedido el límite de peticiones. Por favor, intenta más tarde.",
          error: "RATE_LIMIT",
        });
      }

      if (openAiError.response?.status === 401) {
        return res.status(401).json({
          message: "Error de autenticación con OpenAI. Verifica tu API key.",
          error: "AUTH_ERROR",
        });
      }

      if (openAiError.response?.status === 402) {
        return res.status(402).json({
          message:
            "Has excedido tu cuota de OpenAI. Por favor, verifica tu plan de facturación.",
          error: "QUOTA_EXCEEDED",
        });
      }

      return res.status(500).json({
        message: "Error al generar el resumen con OpenAI",
        error: openAiError.message || "UNKNOWN_ERROR",
      });
    }
  } catch (err) {
    console.error("General error:", err);
    res.status(500).json({ message: "Error processing reviews" });
  }
});

/* router.post("/summarizeHF/:subjectId", fetchReviews, async (req, res) => {
  try {
    const [resultName] = await db.query(
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
      const messages = `
Eres un asistente especializado en analizar y resumir reseñas académicas de materias universitarias.
Tu resumen debe destacar los puntos principales, positivos y negativos, de manera clara y estructurada.
Estas son las reseñas de la materia ${resultName[0].name}:

${concatenatedContent}

Por favor, escribe un resumen breve que refleje las opiniones generales.
`;

      console.log(messages);
      console.log("➡️ Enviando a Hugging Face...");

      const resp = await axios.post(
        HF_API_URL,
        { inputs: messages },
        {
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            "Content-Type": "application/json",
          },
          timeout: 60000,
        }
      );
      const summary =
        response.data?.[0]?.generated_text ||
        response.data?.generated_text ||
        "No response from model";
      res.json({ summary });
    } catch (openAiError) {}
  } catch (err) {
    console.error(
      "❌ Error en Hugging Face:",
      err.response?.data || err.message
    );
    res
      .status(500)
      .json({ message: "Error al generar resumen con Hugging Face" });
  }
}); */

router.post("/summarizeGEMINI/:subjectId", fetchReviews, async (req, res) => {
  try {
    console.log(process.env.GEMINI_API_KEY);
    const [resultName] = await db.query(
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
Destaca los aspectos positivos, negativos y la opinión general.

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
