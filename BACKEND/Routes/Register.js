import express, { response } from "express";
import db from "../db.js"

const router = express.Router();

async function checkUser(req, res, next){
    try {
        console.log(req.body);
        const { email } = req.body;
        const [rows] = await db.query("SELECT * from user where email = ?", [email]);
        if (rows.length > 0){
            return res.status(400).json({message: "user already exists"});
        }
        next();
    } catch (err) {
        res.status(500).json({message: "database error"});
    }
}

router.post("/", checkUser, async (req, res) => {
    try {
        const { email, password } = req.body;
        await db.query("insert into user(email, password) values(?, ?)", [email, password]);

        res.status(201).json({message: "user created"});
    } catch (err) {
        res.status(500).json({message: "error inserting user"});
    }
})
export default router;
