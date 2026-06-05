import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

const isLocal =
    !process.env.DATABASE_URL || process.env.DATABASE_URL.includes("localhost");

const client = new Client({
    connectionString:
        process.env.DATABASE_URL ||
        "postgresql://postgres:postgres@127.0.0.1:5432/template1",
    ssl: isLocal ? false : { rejectUnauthorized: false },
});

client.connect();

export class QuestionService {
    async getRandomQuestions(category?: string, limit: number = 10) {
        let query = "SELECT * FROM questions";
        const values: any[] = [];

        if (category) {
            query += " WHERE category = $1";
            values.push(category);
        }
        query += ` ORDER BY RANDOM() LIMIT $${values.length + 1}`;
        values.push(limit);

        const result = await client.query(query, values);
        return result.rows;
    }

    async getStats() {
        const query =
            "SELECT category, COUNT(*) as count FROM questions GROUP BY category";
        const result = await client.query(query);
        return result.rows;
    }
}
