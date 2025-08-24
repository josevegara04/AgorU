import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Se establece la conexión con la base de datos
const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE_NAME,
    waitForConnections: true,
    connectionLimit: 5, 
    queueLimit: 0
});

export default db;