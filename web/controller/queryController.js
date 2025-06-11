import * as dotenv from "dotenv";
import features from "../utils/util.js";
import modelController from "./modelController.js";

dotenv.config();

const databaseSchema = await features.getDatabaseSchema();

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
    const prompt = modelController.generatePrompt(userQuery ,databaseSchema);
    console.log(complexity);
    switch (complexity) {
      case "easy":
        sql = await modelController.generateSQLWithGemini(prompt);
        break;
      case "mid":
        sql = await modelController.generateSQLWithOpenAI(prompt);
        break;
      case "hard":
        sql = await modelController.generateSQLWithClaude(prompt);
        break;
      default:
        sql = await modelController.generateSQLWithGemini(prompt);
    }
    let result ;
     result = await features.executeGeneratedQuery(sql); 
    res.status(200).json({result});
  } catch (error) {
    console.error("Error generating SQL:", error.response?.data || error.message);
    return res.status(500).json({ error: `error : query not valid or Failed to generate SQL` });
  }
};

const fetchSchema = async(req , res) =>{
  const dbSchema = await features.getDatabaseSchema();
  res.status(200).json({
    dbSchema , 
  })
}

// Main export
const queryController = {
  openQuery,
  preProcess,
  fetchSchema , 
};

export default queryController;
