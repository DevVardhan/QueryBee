import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import  features  from "../utils/util.js";

const generateSQLWithOpenAI = async (userQuery , databaseSchema) => {
  const openaiResponse = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an assistant that converts natural language into SQL queries. Assume a PostgreSQL database. Only return the SQL query.
          ⚠️ Do NOT wrap the SQL in quotes. Do NOT quote column or table names (no "table" or "column" with quotes).

          Only return the raw SQL. Do not add markdown, explanation, or code block syntax.

          before any tabel name add "ecommerce_core."
          
          strictly follow the table naming schema and use only among the table names in the schema.
          
          Request:
          "${userQuery}"

          Database Schema:
          ${databaseSchema}`
        },
        {
          role: "user",
          content: `You are an expert SQL assistant. Convert the following natural language request into a **PostgreSQL SQL query** using the provided schema.
         ⚠️ Do NOT wrap the SQL in quotes. Do NOT quote column or table names (no "table" or "column" with quotes).

          Only return the raw SQL. Do not add markdown, explanation, or code block syntax.

          before any tabel name add "ecommerce_core."
          
          strictly follow the table naming schema and use only among the table names in the schema.

          Request:
          "${userQuery}"

          Database Schema:
         ${databaseSchema}`
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


const generateSQLWithGemini = async (userQuery ,databaseSchema) => {
  const prompt = `You are an expert SQL assistant. Convert the following natural language request into a **PostgreSQL SQL query** using the provided schema.

⚠️ Do NOT wrap the SQL in quotes. Do NOT quote column or table names (no "table" or "column" with quotes).

Only return the raw SQL. Do not add markdown, explanation, or code block syntax.

before any tabel name add "ecommerce_core." 

Request:
"${userQuery}"

Database Schema:
${databaseSchema}`;

  const genAI = new GoogleGenerativeAI(process.env.GEMI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent(prompt);
  const sql = result.response.text().trim();

  return sql; 
};

const generateSQLWithClaude = async (userQuery , databaseSchema) => {
  const response = await axios.post(
    "https://api.anthropic.com/v1/messages",
    {
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: `You are an expert SQL assistant. Convert the following natural language request into a **PostgreSQL SQL query** using the provided schema.

          ⚠️ Do NOT wrap the SQL in quotes. Do NOT quote column or table names (no "table" or "column" with quotes).

          Only return the raw SQL. Do not add markdown, explanation, or code block syntax.

          before any tabel name add "ecommerce_core." 

          Request:
          "${userQuery}"

          Database Schema:
          ${databaseSchema}`
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
}

export default modelController ;