const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { OpenAI } = require("openai");
const { initRAG, getContext } = require("./rag");
require("dotenv").config();

const app = express();
const PORT = 5001;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `input-${Date.now()}.webm`);
  },
});
const upload = multer({ storage });

app.post("/ask", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No audio uploaded." });

    const audioPath = req.file.path;
    const whisper = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: "whisper-1",
      response_format: "json",
    });

    const question = whisper.text;
    console.log("🧠 User asked:", question);

    const context = await getContext(question);

    const chat = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are Dibyendu — a highly disciplined, sociable, and detail-oriented Full Stack Developer who thrives under pressure, collaborates well with others, and is deeply passionate about AI-powered innovation. You explain things practically and with clarity. Only answer based on the context.`,
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuestion: ${question}`,
        },
      ],
    });

    const answer = chat.choices[0].message.content;
    console.log("🤖 GPT Answer:", answer);

    const tts = await openai.audio.speech.create({
      model: "tts-1",
      voice: "onyx",
      input: answer,
    });

    const ttsPath = `uploads/resp-${Date.now()}.mp3`;
    fs.writeFileSync(ttsPath, Buffer.from(await tts.arrayBuffer()));
    fs.unlinkSync(audioPath);

    res.json({ question, answer, audio: ttsPath });
  } catch (err) {
    console.error("❌ ERROR:", err?.response?.data || err.message || err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

// 🧠 Init RAG and start
(async () => {
  await initRAG(["sample1.pdf", "sample2.pdf"]);
  app.listen(PORT, () => {
    console.log(`🟢 Server running at http://localhost:${PORT}`);
  });
})();
