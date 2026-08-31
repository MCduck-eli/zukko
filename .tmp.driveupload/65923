import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

const isLocal = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes("localhost");
const dbClient = new Client({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/template1",
    ssl: isLocal ? false : { rejectUnauthorized: false },
});

async function setup() {
    try {
        await dbClient.connect();
        console.log("Database connected!");
        
        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS ai_plans (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                category VARCHAR(255) NOT NULL,
                score VARCHAR(50),
                plan TEXT NOT NULL,
                is_read BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("ai_plans table created successfully!");
    } catch (err) {
        console.error("Error creating table:", err);
    } finally {
        await dbClient.end();
    }
}

setup();
