const fs = require("fs");
const path = require("path");

const EMBEDDING_PATH = path.join(__dirname, "..", "embeddings.json");

function saveEmbeddings(data) {
  fs.writeFileSync(EMBEDDING_PATH, JSON.stringify(data, null, 2));
  console.log("💾 Saved embeddings to disk");
}

function loadEmbeddings() {
  if (!fs.existsSync(EMBEDDING_PATH)) return null;
  console.log("📥 Loaded embeddings from disk");
  return JSON.parse(fs.readFileSync(EMBEDDING_PATH, "utf8"));
}

module.exports = { saveEmbeddings, loadEmbeddings };
