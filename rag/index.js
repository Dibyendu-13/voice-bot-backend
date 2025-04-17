const { embedPDFs } = require("./embedder");
const { saveEmbeddings, loadEmbeddings } = require("./store");
const cosineSimilarity = require("compute-cosine-similarity");
const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let embeddedChunks = [];

async function initRAG(pdfPaths) {
  const cached = loadEmbeddings();
  if (cached) {
    embeddedChunks = cached;
  } else {
    embeddedChunks = await embedPDFs(pdfPaths);
    saveEmbeddings(embeddedChunks);
  }
}

async function getContext(question, topK = 3) {
  const res = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: question,
  });

  const qVec = res.data[0].embedding;

  const ranked = embeddedChunks.map(({ chunk, embedding }) => ({
    chunk,
    score: cosineSimilarity(embedding, qVec),
  }));

  return ranked
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((r) => r.chunk)
    .join("\n");
}

module.exports = { initRAG, getContext };
