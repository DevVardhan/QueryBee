import * as dotenv from "dotenv";
import modelController from "./modelController.js";

dotenv.config();

// Controller to classify complexity 
const preProcess = async (req, res, next) => {
  const userQuery = req.query.userQuery ; 
  
  if (!userQuery) {
    return res.status(400).json({ error: 'Missing query parameter "userQuery"' });
  }
  
  try {

    const text = await modelController.generateComplexityWithGemini(userQuery);

    req.complexity = ["easy", "mid", "hard"].includes(text) ? text : "mid";

    if (!["easy", "mid", "hard"].includes(text)) {
      console.warn("Unexpected complexity result, defaulting to 'mid'");
    }
    
  } catch (err) {
    console.error("Error during complexity classification:", err);
    req.complexity = "mid";
  }

  next();
};

// Core route to process the query and return SQL
const openQuery = async (req, res) => {
  const userQuery = req.query.userQuery;
  const complexity = req.complexity;

  if (!userQuery) {
    return res.status(400).json({ error: 'Missing query parameter "userQuery"' });
  }

  try {
    let sql;

    switch (complexity) {
      case "easy":
        sql = await modelController.generateSQLWithGemini(userQuery);
        break;
      case "mid":
        sql = await modelController.generateSQLWithOpenAI(userQuery);
        break;
      case "hard":
        sql = await modelController.generateSQLWithClaude(userQuery);
        break;
      default:
        sql = await modelController.generateSQLWithGemini(userQuery);
    }

    return res.status(200).json({ sql });

  } catch (error) {
    console.error("Error generating SQL:", error.response?.data || error.message);
    return res.status(500).json({ error: "Failed to generate SQL" });
  }
};


// Main export
const queryController = {
  openQuery,
  preProcess,
};

export default queryController;
