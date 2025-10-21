import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Se establece la conexión con la base de datos
const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE_NAME,
};

export async function openConnection() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        return connection;
    } catch(err) {
        console.error("Error executing query: ", err);
        throw err;
    }
}

export async function closeConnection(connection) {
    try {
        if(connection) {
            await connection.end();
        }
    } catch(err) {
        console.error("Error closing connection:", err);
    }
}

export async function executeQuery(query, params = []) {
    let connection;
    try {
        connection = await openConnection();
        const [rows] = await connection.execute(query, params);
        return rows;
    } catch (err) {
        console.error("Error executing query: ", err);
        throw err;
    } finally {
        await closeConnection(connection);
    }
}