import { LoginRequest, RegisterRequest } from "./../types/auth-type.js";
import pkg from "pg";
const { Pool } = pkg;
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const isLocal =
    !process.env.DATABASE_URL || process.env.DATABASE_URL.includes("localhost");

const pool = new Pool({
    connectionString:
        process.env.DATABASE_URL ||
        "postgresql://postgres:postgres@127.0.0.1:5432/template1",
    ssl: isLocal ? false : { rejectUnauthorized: false },
});
async function createTablesIfNotExist() {
    const query = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            "fullName" VARCHAR(255)
        );
    `;
    try {
        await pool.query(query);
        console.log("🚀 'users' jadvali muvaffaqiyatli tekshirildi/yaratildi!");
    } catch (error) {
        console.error("Jadval yaratishda xato yuz berdi:", error);
    }
}
createTablesIfNotExist();

const JWT_SECRET = process.env.JWT_SECRET || "Eli9391383$";

export class AuthService {
    private saltRounds = 10;

    async register(data: RegisterRequest) {
        const hashedPassword = await bcrypt.hash(
            data.password,
            this.saltRounds,
        );
        const query = `
            INSERT INTO users (email, password, "fullName") 
            VALUES ($1, $2, $3) 
            RETURNING id, email, "fullName"
        `;
        const values = [data.email, hashedPassword, data.fullName];

        try {
            const res = await pool.query(query, values);
            return res.rows[0];
        } catch (error) {
            console.error("Registratsiyada xato:", error);
            throw error;
        }
    }

    async login(credentials: LoginRequest) {
        const query = "SELECT * FROM users WHERE email = $1";
        const res = await pool.query(query, [credentials.email]);
        const user = res.rows[0];

        if (!user) return null;

        const isMatch = await bcrypt.compare(
            credentials.password,
            user.password,
        );
        if (!isMatch) return null;

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: "24h" },
        );
        delete user.password;

        return { user, token };
    }
}

export const authService = new AuthService();
