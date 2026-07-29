import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("SUPABASE_URL yoki Key muhit o'zgaruvchilarida topilmadi.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export class QuestionService {
    async getRandomQuestions(category?: string, limit: number = 10) {
        let query = supabase.from("questions").select("*");

        if (category) {
            query = query.eq("category", category);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(error.message);
        }

        if (!data || data.length === 0) {
            return [];
        }
        const shuffled = data.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, limit);
    }
}
