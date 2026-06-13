import { LoginRequest, RegisterRequest } from "./../types/auth-type.js";
import pkg from "pg";
const { Pool } = pkg;
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

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
    try {
        const createQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                "fullName" VARCHAR(255),
                is_verified BOOLEAN DEFAULT FALSE,
                verification_code VARCHAR(6),
                code_expires_at TIMESTAMP
            );
        `;
        await pool.query(createQuery);

        const alterQuery = `
            ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS code_expires_at TIMESTAMP;
        `;
        await pool.query(alterQuery);

        console.log(
            "🚀 'users' jadvali va OTP ustunlari muvaffaqiyatli tekshirildi/yaratildi!",
        );
    } catch (error) {
        console.error("Jadvalni sozlashda xato yuz berdi:", error);
    }
}
createTablesIfNotExist();

const JWT_SECRET = process.env.JWT_SECRET || "Eli9391383$";

export class AuthService {
    private saltRounds = 10;
    private getTransporter() {
        return nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
                    ? process.env.EMAIL_PASS.trim()
                    : "",
            },
        });
    }

    async sendVerificationEmail(email: string, code: string) {
        const transporter = this.getTransporter();

        const mailOptions = {
            from: `"Zukko Tizimi" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Zukko — Email tasdiqlash kodi",
            html: `
                <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #0a0a0c; color: #ffffff;">
                    <h2 style="color: #f97316; text-align: center; font-size: 24px; text-transform: uppercase;">ZukkO Tizimi</h2>
                    <p style="font-size: 14px; color: #94a3b8; text-align: center;">Platformadan muvaffaqiyatli ro'yxatdan o'tdingiz. Hisobingizni faollashtirish uchun quyidagi vaqtinchalik kodni kiriting:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #ffffff; background: #1e1e24; padding: 10px 24px; border-radius: 8px; border: 1px solid #334155;">${code}</span>
                    </div>
                    <p style="font-size: 12px; color: #64748b; text-align: center;">Ushbu kod 10 daqiqa davomida amal qiladi. Agar siz ro'yxatdan o'tmagan bo'lsangiz, ushbu xatga e'tibor bermang.</p>
                </div>
            `,
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(
                `✉️ Tasdiqlash kodi muvaffaqiyatli yuborildi: ${email}`,
            );
        } catch (error) {
            console.error("Email yuborishda muammo bo'ldi:", error);
            throw error;
        }
    }

    async register(data: RegisterRequest) {
        const hashedPassword = await bcrypt.hash(
            data.password,
            this.saltRounds,
        );

        const verificationCode = Math.floor(
            100000 + Math.random() * 900000,
        ).toString();
        const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        const query = `
            INSERT INTO users (email, password, "fullName", verification_code, code_expires_at) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING id, email, "fullName"
        `;
        const values = [
            data.email,
            hashedPassword,
            data.fullName,
            verificationCode,
            codeExpiresAt,
        ];

        try {
            const res = await pool.query(query, values);
            await this.sendVerificationEmail(data.email, verificationCode);

            return res.rows[0];
        } catch (error) {
            console.error("Registratsiyada xato:", error);
            throw error;
        }
    }

    async verifyCode(email: string, code: string) {
        const query = `
            SELECT * FROM users 
            WHERE email = $1 
              AND verification_code = $2 
              AND code_expires_at > NOW()
        `;
        const res = await pool.query(query, [email, code]);
        const user = res.rows[0];

        if (!user) return null;

        const updateQuery = `
            UPDATE users 
            SET is_verified = TRUE, 
                verification_code = NULL, 
                code_expires_at = NULL 
            WHERE id = $1 
            RETURNING id, email, "fullName"
        `;
        const updateRes = await pool.query(updateQuery, [user.id]);
        const updatedUser = updateRes.rows[0];

        const token = jwt.sign(
            { userId: updatedUser.id, email: updatedUser.email },
            JWT_SECRET,
            { expiresIn: "24h" },
        );

        return { user: updatedUser, token };
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

        if (!user.is_verified) {
            const newCode = Math.floor(
                100000 + Math.random() * 900000,
            ).toString();
            const newExpiry = new Date(Date.now() + 10 * 60 * 1000);
            await this.sendVerificationEmail(user.email, newCode);

            await pool.query(
                "UPDATE users SET verification_code = $1, code_expires_at = $2 WHERE id = $3",
                [newCode, newExpiry, user.id],
            );

            return {
                status: "unverified",
                email: user.email,
            };
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: "24h" },
        );
        const { password, verification_code, code_expires_at, ...safeUser } =
            user;

        return { user: safeUser, token };
    }
}

export const authService = new AuthService();
