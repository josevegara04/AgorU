import express, { response } from "express";
/* import OpenAI from "openai"; */
import axios from "axios";
import { fetchReviews } from "./Reviews.js";

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

const HF_API_URL =
  "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";
const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;

/* const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
}); */

// Endpoint para resumir reseñas
router.post("/summarize/:subjectId", fetchReviews, async (req, res) => {
  try {
    const reviews = req.reviews;
    if (!reviews || reviews.length === 0) {
      return res.status(400).json({ message: "No reviews found to summarize" });
    }

    const concatenatedContent = reviews
      .map((review) => review.content)
      .join("\n");

    const prompt = `
      Resume los siguientes comentarios de manera clara, fluida y con buena redacción. Son reseñas de una materia llamada:
      Haz que el resumen suene natural y agradable, como si fuera una reseña general.
      Comentarios:
      ${concatenatedContent}
    `;

    console.log(prompt);

    try {
      /* const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant that summarizes reviews."
                    }, {
                        role: "system",
                        content: `Summarize the following reviews: \n${concatenatedContent}`
                    }
                ],
            }); */

      const hfResponse = await axios.post(
        HF_API_URL,
        { inputs: prompt },
        {
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      // La respuesta de Hugging Face viene como un array
      const summary = hfResponse.data[0]?.summary_text || "No summary generated";

      res.json({ summary });
    } catch (hfError) {
      cconsole.error("Hugging Face API Error:", hfError.response?.data || hfError.message);

      if (hfError.response?.status === 429) {
        return res.status(429).json({
          message: "Rate limit exceeded for Hugging Face API. Please try again later.",
          error: "RATE_LIMIT",
        });
      }

      res.status(503).json({
        message: "Error connecting to the summarization service (Hugging Face)",
        error: "API_ERROR",
      });
    }
  } catch (err) {
    console.error("General error:", err);
    res.status(500).json({ message: "Error processing reviews" });
  }
});
export default router;
