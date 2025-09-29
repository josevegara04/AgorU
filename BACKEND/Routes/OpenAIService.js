import express, { response } from "express";
import OpenAI from "openai";
import { fetchReviews } from "./Reviews.js" 

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Endpoint para resumir reseñas
router.post("/summarize/:subjectId", fetchReviews, async (req, res) => {
    try {
        const reviews = req.reviews;
        const concatenatedContent = reviews.map(review => review.content).join("\n");

        const completion = await openai.chat.completions.create({
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
        });

        const summary = completion.choices[0].message.content;
        res.json({summary});
    } catch(err) {
        console.error(err);
        res.status(500).json({message: "error summaring reviews"});
    }
})
export default router;
