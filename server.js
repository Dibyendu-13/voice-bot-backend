const express = require('express');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { OpenAI } = require('openai');
const dotenv = require('dotenv');
const textToSpeech = require('@google-cloud/text-to-speech');
const cors = require('cors');
const base64 = require('base-64');

dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 5001;

// Enable JSON body parsing
app.use(express.json({ limit: '10mb' }));

// Enable CORS for frontend (localhost and Netlify or ngrok)
app.use(cors({
  origin: [
    "https://voice-bot13.netlify.app/"
    
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// Load and save Google credentials from base64 env var
const googleCredentialsBase64 = process.env.GOOGLE_CREDENTIALS_BASE64;
if (googleCredentialsBase64) {
  const googleCredentialsPath = path.join(__dirname, 'google-credentials.json');
  const decodedCredentials = base64.decode(googleCredentialsBase64);
  fs.writeFileSync(googleCredentialsPath, decodedCredentials, 'utf8');
  process.env.GOOGLE_APPLICATION_CREDENTIALS = googleCredentialsPath;
  console.log('✅ Google credentials loaded.');
} else {
  console.error('❌ No Google credentials found in env.');
}

// Set up OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Set up Google TTS client
const client = new textToSpeech.TextToSpeechClient();

// Preprocess PDF files on startup
const pdfPath1 = path.join(__dirname, 'files/sample1.pdf');
const pdfPath2 = path.join(__dirname, 'files/sample2.pdf');

let combinedPdfContent = '';

const preprocessPDF = async (pdfPath) => {
  const dataBuffer = await fs.promises.readFile(pdfPath);
  const pdfData = await pdfParse(dataBuffer);
  return pdfData.text;
};

const initializePDFs = async () => {
  try {
    const pdfContent1 = await preprocessPDF(pdfPath1);
    const pdfContent2 = await preprocessPDF(pdfPath2);
    combinedPdfContent = `${pdfContent1}\n\n${pdfContent2}`;
    console.log('✅ PDFs loaded and combined.');
  } catch (err) {
    console.error('❌ Error loading PDFs:', err);
  }
};

// TTS helper
const textToSpeechConversion = async (text) => {
  const request = {
    input: { text },
    voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
    audioConfig: { audioEncoding: 'MP3' },
  };

  const [response] = await client.synthesizeSpeech(request);
  return response.audioContent; // Buffer
};

// POST endpoint to receive question and return response
app.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    if (!combinedPdfContent) {
      return res.status(500).json({ error: 'PDF data not initialized.' });
    }

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are Dibyendu, an IT engineer with expertise in software and AI concepts. Answer all questions naturally as if you are Dibyendu, based on the content of the provided PDFs.`
        },
        {
          role: 'user',
          content: `Question: ${question}`
        },
      ],
    });

    const textResponse = aiResponse.choices[0].message.content;

    const audioBuffer = await textToSpeechConversion(textResponse);
    const audioBase64 = audioBuffer.toString('base64');

    res.json({
      text: textResponse,
      audio: audioBase64,
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: 'Failed to process question or TTS.' });
  }
});

// Optional: health check endpoint
app.get('/status', (_, res) => res.send('🟢 Server is running'));

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  initializePDFs();
});
