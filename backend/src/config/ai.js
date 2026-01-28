import { OpenAI } from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

export const indexName = process.env.PINECONE_INDEX_NAME || "chatbot";
