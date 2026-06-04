import { Client } from "pg";

const client = new Client({
    user: "postgres",
    host: "localhost",
    database: "template1",
    password: "postgres",
    port: 5432,
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
