import express, { response } from "express";
import db from "../db.js"
import jwt from "jsonwebtoken";
import { authMiddleware } from "../index.js";
import bcrypt from "bcrypt";

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

router.post("/", async (req, res) => {
    try {
        
        const { email, password } = req.body;

        // Verifica que si exista el usuario
        const [result] = await db.query("SELECT * from user WHERE email = ?", [email]);
        if(result.length == 0){
            return res.status(400).json({message: "user does not exist"});
        }

        // Verifica que la contraseña
        const match = await bcrypt.compare(password, result[0].password);
        if(!match) {
            return res.status(400).json({message: "invalid pasword"});
        }

        // Crea el token 
        const token = jwt.sign({ email: result[0].email, id: result[0].id }, SECRET_KEY, { expiresIn: "15m" })

        return res.status(201).json({
            token: token, 
            message: "user created"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "error inserting user"});
    }
})
export default router;
