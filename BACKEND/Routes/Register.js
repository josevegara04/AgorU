import express, { response } from "express";
import db from "../db.js"
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

// Middleware que verifica la duplicidad del email
async function checkUser(req, res, next){
    try {
        console.log(req.body);
        const { email } = req.body;
        const [rows] = await db.query("SELECT * from user where email = ?", [email]);
        console.log("Existing rows: ", rows);
        if (rows.length > 0){
            return res.status(400).json({message: "user already exists"});
        }
        return next();
    } catch (err) {
        console.error(err)
        res.status(500).json({message: "database error"});
    }
}

// endpoint para registrarse
router.post("/", checkUser, async (req, res) => {
    try {
        const { email, password } = req.body;
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await db.query("insert into user(email, password) values(?, ?)", [email, hashedPassword]);

        // Crea el token
        const token = jwt.sign({ email: result[0].email, id: result[0].id }, SECRET_KEY, { expiresIn: "15m" })

        res.status(201).json({token: token, message: "user created"});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "error inserting user"});
    }
})
export default router;
