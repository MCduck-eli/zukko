import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

export class QuestionService {
    async getRandomQuestions(category?: string, limit: number = 10) {
        try {
            let query = "SELECT * FROM questions";
            const values: any[] = [];

            if (category) {
                query += " WHERE category = $1";
                values.push(category);
            }
            query += ` ORDER BY RANDOM() LIMIT $${values.length + 1}`;
            values.push(limit);

            const result = await pool.query(query, values);
            return result.rows;
        } catch (error: any) {
            console.error("getRandomQuestions xatosi:", error.message);
            throw error;
        }
    }

    async getStats() {
        try {
            const query =
                "SELECT category, COUNT(*) as count FROM questions GROUP BY category";
            const result = await pool.query(query);
            return result.rows;
        } catch (error: any) {
            console.error("getStats xatosi:", error.message);
            throw error;
        }
    }
}
