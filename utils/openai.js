// utils/openai.js
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config(); // load env here just in case

if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY not found in env");
    throw new Error("OPENAI_API_KEY is missing");
}

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
