import express, { response } from "express";
import db from "../db.js"
import { authMiddleware } from "../index.js";

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

// Endpoint para buscar todas las reseñas de una materia por id
router.get("/:subjectId", authMiddleware, async(req, res) => {
    const {subjectId} = req.params;

    try{
        const [result] = await db.query("SELECT review.*, user.email FROM review JOIN user ON review.idPublisher = user.id WHERE review.idSubject = ?", [subjectId]);

        if(result.length === 0){
            return res.status(400).json({message: "no reviews yet"});
        }
        return res.status(200).json(result);
    } catch(err){
        console.error(err);
        return res.status(500).json({message: "error in database"});
    }
})

router.post("/postReview", authMiddleware, async(req, res) => {
    const { idPublisher, content, idSubject} = req.body;

    try{
        const [result] = await db.query("INSERT INTO review(idPublisher, content, postDate, idSubject) values(?, ?, NOW(), ?)", [idPublisher, content, idSubject]);
        return res.status(200).json({message: "message"});
    } catch(err){
        console.error(err);
        return res.status(500).json({message: "error in database"});
    }
})

export default router;