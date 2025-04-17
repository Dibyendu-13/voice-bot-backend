const pdfParse = require("pdf-parse");
const fs = require("fs");
const { OpenAI } = require("openai");
const path = require("path");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function chunkText(text, maxWords = 200) {
  const sentences = text.split(/\.\s+|\n+/);
  const chunks = [];
  let temp = "";

  for (let sentence of sentences) {
    if ((temp + sentence).split(" ").length > maxWords) {
      chunks.push(temp.trim());
      temp = sentence + ". ";
    } else {
      temp += sentence + ". ";
    }
  }
  if (temp.trim()) chunks.push(temp.trim());
  return chunks;
}

async function embedPDFs(pdfPaths) {
  const allChunks = [];

  for (const filePath of pdfPaths) {
    console.log("📄 Processing:", filePath);
    const buffer = fs.readFileSync(filePath);
    const { text } = await pdfParse(buffer);
    const chunks = chunkText(text);

    for (const chunk of chunks) {
      const res = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: chunk,
      });
      allChunks.push({
        chunk,
        embedding: res.data[0].embedding,
      });
    }
  }

  console.log(`✅ Embedded ${allChunks.length} chunks`);
  return allChunks;
}

module.exports = { embedPDFs };
