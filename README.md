# 🎙️ Voice Q&A Backend with RAG, Whisper, GPT-4 & TTS

A powerful Node.js backend that turns your voice into answers — using OpenAI's Whisper for transcription, Embeddings for context-aware PDF lookup (RAG), GPT-4 for reasoning, and TTS for speaking the answer back.

> 🔗 GitHub: [github.com/Dibyendu-13/voice-bot-backend](https://github.com/Dibyendu-13/voice-bot-backend)

---

## ✨ Features

- 🎧 **Voice Input** via microphone (WebM)
- 🧠 **Context-Aware Retrieval** from embedded PDFs
- 🤖 **GPT-4 Answers** customized to respond like Dibyendu
- 🔊 **TTS Output** in a realistic male voice (`onyx`)
- 📦 **Embeddings Cached** — no re-embedding on restart
- ⚡ **Modular Code** (RAG, TTS, Transcription separated)

---

## 📦 Tech Stack

- `Node.js`, `Express`, `Multer`
- `OpenAI` (Whisper, GPT-4, TTS, Embeddings)
- `pdf-parse`, `dotenv`, `cors`, `axios`
- `compute-cosine-similarity`

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Dibyendu-13/voice-bot-backend.git
cd voice-bot-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root:

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. Add Your PDFs

Place your PDFs (e.g. `sample1.pdf`, `sample2.pdf`) in the project root. Then open `server.js` and edit:

```js
await initRAG(["sample1.pdf", "sample2.pdf"]);
```

### 5. Run the Server

```bash
npm start
```

Server starts at:  
📍 `http://localhost:5001`

---

## 🧠 How Embedding Works

- On first run, PDFs are:
  - Parsed → Chunked → Embedded → Saved to `embeddings.json`
- On future runs:
  - Embeddings are loaded from disk — fast startup
- To force re-embedding:
  - Delete `embeddings.json` manually

---

## 🎧 Voice Flow

1. User speaks (via frontend)
2. Audio is uploaded (`/ask`)
3. Transcribed with Whisper
4. Best-matching chunks are retrieved using cosine similarity
5. GPT-4 generates an answer (in Dibyendu's voice)
6. Answer is spoken back using OpenAI TTS

---

## 📂 Project Structure

```
voice-bot-backend/
├── server.js               # Main Express server
├── .env                    # OpenAI API key
├── embeddings.json         # Auto-generated on first run
├── sample1.pdf             # Custom documents
├── sample2.pdf
├── uploads/                # Audio input/output
└── rag/                    # Modular RAG engine
    ├── embedder.js
    ├── store.js
    └── index.js
```

---

## 🔗 API Endpoint

**POST /ask**

- Content-Type: `multipart/form-data`
- Form field: `audio` (WebM file)

### Example Response:

```json
{
  "question": "What is the purpose of this document?",
  "answer": "Based on the context, the document outlines...",
  "audio": "uploads/resp-1682823788.mp3"
}
```

---

## 🧑 Voice Personality

This assistant speaks like **Dibyendu** — a highly disciplined, sociable, and detail-oriented Full Stack Developer. Responses are practical, clear, and grounded in real-world logic.

---

## 📝 License

MIT © [Dibyendu-13](https://github.com/Dibyendu-13)

---

## 🌟 Star this repo if you find it helpful!

> GitHub: [https://github.com/Dibyendu-13/voice-bot-backend](https://github.com/Dibyendu-13/voice-bot-backend)
