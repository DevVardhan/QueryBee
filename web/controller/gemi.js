import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMI_API_KEY);

async function getRes() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent("count 1 to 10");

    const response = await result.response;
    const text = response.text();
    console.log(text);
  } catch (err) {
    console.error("Error:", err);
  }
}

getRes();

