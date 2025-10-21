import express, { response } from "express";
import { executeQuery } from "../db.js"
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

// Endpoint para iniciar sesión
router.post("/", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verifica que si exista el usuario
        const users = await executeQuery("SELECT * from user WHERE email = ?", [email]);

        if(users.length == 0){
            return res.status(400).json({message: "user does not exist"});
        }

        // Verifica que la contraseña
        const match = await bcrypt.compare(password, users[0].password);
        if(!match) {
            return res.status(400).json({message: "invalid pasword"});
        }

        // Crea el token 
        const token = jwt.sign({ email: users[0].email, id: users[0].id}, SECRET_KEY, { expiresIn: "15m" })

        return res.status(201).json({
            token: token, 
            id: users[0].id,
            message: "user created"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "error inserting user"});
    }
})
export default router;
