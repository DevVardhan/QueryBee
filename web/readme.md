# 🧠 Natural Language to SQL API

This is a Node.js + Express server that converts natural language queries into executable PostgreSQL SQL using OpenAI or Gemini AI. It executes the resulting SQL on a Supabase-hosted database and returns the results.

---

## 🚀 Features

- Converts plain English questions into SQL queries using OpenAI (`gpt-3.5-turbo`) or Google Gemini
- Executes generated SQL safely on a Supabase PostgreSQL database
- Pre-processes query complexity using Gemini
- Basic SQL command filtering to prevent destructive queries

---

## 🛠️ Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/nl-to-sql-api.git
   cd nl-to-sql-api
   ```
