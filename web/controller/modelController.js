import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

// creating unique prompts
const generatePrompt = (userQuery , databaseSchema) =>{
  const prompt = `You are an expert data analyst and SQL developer.
  
  Your task is to convert natural language questions into syntactically correct SQL queries.

  ### SCHEMA INFORMATION:${JSON.stringify(databaseSchema)}

  ### INSTRUCTIONS:
  - Only use the tables and columns provided in the schema above.
  - If a table or column name mentioned in the user question is not present in the schema, find the *closest possible match in the schema* (e.g., if 
    user says "orders" but table is "order", use "order").
  - Always choose the table names present it schema if the table is not present , choose the closest table in schema.
  - Do not create or hallucinate any tables or columns not present in the schema.
  - Always write valid SQL
  - Prefer JOINs over subqueries where applicable.
  - Use table aliases to keep the query concise.
  - If the user asks for time-based filtering like "last 7 days", assume CURRENT_DATE is available.
  - If you’re unsure about a mapping, make the best reasonable guess based on names.
  - Do not explain anything. Just return the SQL query.
  - Do NOT wrap the SQL in quotes. Do NOT quote column or table names (no "table" or "column" with quotes).
  - Only return the raw SQL. Do not add markdown, explanation, or code block syntax.  
  - before any tabel name add "ecommerce_core."

  ### USER QUESTION:${userQuery}

  ### SQL QUERY: `
  return prompt ; 
}

const generateSQLWithOpenAI = async (prompt) => {
  const openaiResponse = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: prompt ,
  
        }
      ],
      temperature: 0,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      timeout: 10000 // 10 seconds
    }
  );
  
  const sql = openaiResponse.data.choices[0].message.content.trim();
  console.log("Generated SQL:", sql);
  
  // Basic safety check to block destructive operations
  const forbidden = /drop|alter|delete|truncate|update/i;
  if (forbidden.test(sql)) {
    throw new Error("Generated SQL contains unsafe commands.");
  }
  
  return sql;
};


const generateSQLWithGemini = async (prompt) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent(prompt);
  const sql = result.response.text().trim();

  return sql; 
};

const generateSQLWithClaude = async (prompt) => {
  const response = await axios.post(
    "https://api.anthropic.com/v1/messages",
    {
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: prompt , 
        }
      ]
    },
    {
      headers: {
        "x-api-key": process.env.CLAUDE_API_KEY,    
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      timeout: 10000
    }
  );

  const sql = response.data.content[0].text.trim();
  return sql;
};

const generateComplexityWithGemini = async(userQuery) =>{

    const prompt = `
      Classify the complexity level of converting the following English query into an SQL statement.
      Choose one of the following categories:
      
      - easy: Simple queries involving a single table, basic SELECT, WHERE, or simple conditions.
      - mid: Moderate queries involving JOINs, aggregations (GROUP BY), or nested conditions.
      - hard: Complex queries with multiple JOINs, subqueries, window functions, or advanced SQL features.

      Query: "${userQuery}"

      Complexity level: (Answer with one word only from: easy, mid, hard)
    `;

    const genAI = new GoogleGenerativeAI(process.env.GEMI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().toLowerCase();

   return text ;
}


const modelController = {
    generateSQLWithOpenAI , 
    generateSQLWithClaude , 
    generateSQLWithGemini , 
    generateComplexityWithGemini ,
    generatePrompt , 
}

export default modelController ;