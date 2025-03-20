const express = require('express');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { OpenAI } = require('openai');
const dotenv = require('dotenv');
const textToSpeech = require('@google-cloud/text-to-speech');
const { Server } = require('socket.io');
const cors = require('cors'); // Import CORS
const base64 = require('base-64'); // Import the base64 library to decode the base64 string

dotenv.config(); // Load environment variables from .env file

// Initialize Express app
const app = express();
const port = process.env.PORT || 5001;  

// Enable CORS for the frontend URL (Netlify) and allow credentials
app.use(cors({
  origin: [
    'http://localhost:3000',  // Local frontend URL
    'https://voice-bot13.netlify.app',  // Deployed frontend URL
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true,  // Allow credentials (cookies)
}));


const googleCredentialsBase64 = process.env.GOOGLE_CREDENTIALS_BASE64;

if (googleCredentialsBase64) {
  // Define the path where the Google credentials will be stored temporarily
  const googleCredentialsPath = path.join(__dirname, 'google-credentials.json');
  
  // Decode the base64 credentials into the actual JSON content
  const decodedCredentials = base64.decode(googleCredentialsBase64);

  // Write the decoded credentials to a temporary file (google-credentials.json)
  fs.writeFileSync(googleCredentialsPath, decodedCredentials, 'utf8');

  // Set the GOOGLE_APPLICATION_CREDENTIALS environment variable to the file path
  process.env.GOOGLE_APPLICATION_CREDENTIALS = googleCredentialsPath;

  console.log('Google credentials saved successfully.');
} else {
  console.error('No Google credentials found in environment variables.');
}

// Set up OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Replace with your OpenAI API key
});

// Set up Google Cloud Text-to-Speech client using the service account credentials
const client = new textToSpeech.TextToSpeechClient();

// Create a server using the Express app
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Set up Socket.IO with CORS configuration
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',  // Local frontend URL for development
      'https://voice-bot13.netlify.app',  // Deployed frontend URL
    ],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,  // Allow credentials (cookies)
  },
});


// Paths to the two PDF files
const pdfPath1 = path.join(__dirname, 'files/sample1.pdf'); // Replace with your actual PDF file path
const pdfPath2 = path.join(__dirname, 'files/sample2.pdf'); // Replace with your actual PDF file path

// Helper function to preprocess PDF
const preprocessPDF = async (pdfPath) => {
  const dataBuffer = fs.readFileSync(pdfPath);
  const pdfData = await pdfParse(dataBuffer);
  return pdfData.text;
};

// Store the preprocessed PDF content globally or in memory for the session
let combinedPdfContent = '';

// Preprocess the two PDFs and combine their content
const initializePDFs = async () => {
  try {
    const pdfContent1 = await preprocessPDF(pdfPath1);
    const pdfContent2 = await preprocessPDF(pdfPath2);
    // Combine the content of both PDFs
    combinedPdfContent = `${pdfContent1}\n\n${pdfContent2}`;
    console.log('Both PDFs preprocessed successfully.');
  } catch (error) {
    console.error('Error processing PDFs:', error);
  }
};

// Helper function to convert text to speech
const textToSpeechConversion = async (text) => {
  const request = {
    input: { text: text },
    voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
    audioConfig: { audioEncoding: 'MP3' },
  };

  try {
    const [response] = await client.synthesizeSpeech(request);
    return response.audioContent;
  } catch (error) {
    console.error('Error during text-to-speech conversion:', error);
    throw new Error('Text-to-Speech conversion failed');
  }
};

// Handle socket connections
io.on('connection', (socket) => {
  console.log('a user connected');

  // Handle user messages
  socket.on('userMessage', async (question) => {
    try {
      if (!question) {
        return socket.emit('aiResponse', { error: 'Question is required' });
      }

      if (!combinedPdfContent) {
        return socket.emit('aiResponse', { error: 'No PDF content available for conversation' });
      }

      // Send the combined PDF content to the LLM (OpenAI API) for the conversation
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

      // Convert the text response to audio
      const audioContent = await textToSpeechConversion(textResponse);

      // Emit the AI response (both text and audio)
      socket.emit('aiResponse', { text: textResponse, audio: audioContent });

    } catch (error) {
      console.error('Error during AI interaction or TTS conversion:', error);
      socket.emit('aiResponse', { error: 'An error occurred during AI interaction or text-to-speech conversion' });
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Initialize PDF content on startup
initializePDFs();
