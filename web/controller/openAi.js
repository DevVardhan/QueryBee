import axios from "axios";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const pool = new Pool({
    host: process.env.SUPABASE_HOST,
    port: Number(process.env.SUPABASE_PORT),
    user: process.env.SUPABASE_USER,
    password: process.env.SUPABASE_PASSWORD,
    database: process.env.SUPABASE_DATABASE,
    ssl: { rejectUnauthorized: false }
});

const openQuery = async (req, res) => {
    const userQuery = req.query.q;
    const complexity = req.complexity;
    if (!userQuery) {
        return res.status(400).json({ error: 'Missing query parameter "q"' });
    }

    try {
        // Step 1: Generate SQL using OpenAI
        const openaiResponse = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an assistant that converts natural language into SQL queries. Assume a PostgreSQL database.'
                    },
                    {
                        role: 'user',
                        content: `Convert this to SQL: ${userQuery}`
                    }
                ],
                temperature: 0,
                max_tokens: 150
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                timeout: 10000 // 10 seconds timeout
            }
        );

        const sql = openaiResponse.data.choices[0].message.content.trim();
        console.log('Generated SQL:', sql);

        // Step 2: Basic SQL safety check
        const forbidden = /drop|alter|delete|truncate|update/i;
        if (forbidden.test(sql)) {
            return res.status(400).json({ error: 'Generated SQL contains unsafe commands. Aborted.' });
        }

        // Step 3: Execute SQL using pool
        // const client = await pool.connect();
        // try {
        //     const result = await client.query(sql);
        //     res.json({
        //         sql,
        //         rows: result.rows
        //     });
        // } finally {
        //     client.release();
        // }

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to process the query' });
    }
};

const preProcess = async(req , res , next) =>{
   try{ 
    const genAI = new GoogleGenerativeAI(process.env.GEMI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("choose a word from 'hard , mid , easy'");
    const response = await result.response;
    const text = response.text().trim().toLocaleLowerCase();
    console.log(text);

    const allowed = ["hard" , "easy" , "mid"];
    if(!allowed.includes(text)){
        console.log("Unexpected Complexity detected:falling to base complexity")
        req.complexity = "mid" ; 
    }else {
        req.complexity = text ;
    } 
  } catch (err) {
    console.error("Error:", err);
  }
  next();
}


const queryController = {
    openQuery,
    preProcess,
};

export default queryController;
