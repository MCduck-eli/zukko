import pkg from "pg";
const { Client } = pkg;
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function test() {
    try {
        await client.connect();
        console.log("Connected to DB!");
        const res = await client.query("SELECT * FROM questions LIMIT 1");
        console.log("Query success:", res.rows);
    } catch (err) {
        console.error("DB Error:", err);
    } finally {
        await client.end();
    }
}

test();
