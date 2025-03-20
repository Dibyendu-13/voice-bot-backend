
# Voice Bot Backend

This project is a backend server that integrates OpenAI for natural language processing and Google Cloud's Text-to-Speech API for generating voice responses. It processes user input, generates AI-based responses, and converts them into speech. The server communicates with a frontend through WebSockets.

## Features

- **PDF Parsing**: Extracts text from PDF files and combines them to answer user queries.
- **AI Integration**: Uses OpenAI's GPT-4 model to process queries and provide AI-generated responses.
- **Text-to-Speech Conversion**: Converts AI-generated text into speech using Google Cloud's Text-to-Speech API.
- **WebSocket Communication**: Real-time communication with the frontend using Socket.IO.
- **CORS Handling**: Configured to handle requests from specific domains.

## Technologies Used

- **Express**: Web framework for Node.js.
- **OpenAI GPT-4**: AI-powered language model for processing user queries.
- **Google Cloud Text-to-Speech**: Converts AI-generated text into speech.
- **Socket.IO**: Enables real-time communication with the frontend.
- **dotenv**: Loads environment variables from a `.env` file.
- **base-64**: Decodes base64-encoded credentials for Google Cloud authentication.
- **pdf-parse**: Extracts text from PDF files.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Google Cloud account with Text-to-Speech API enabled
- OpenAI API key

### 1. Clone the repository

```bash
git clone https://github.com/Dibyendu-13/voice-bot-backend.git
cd voice-bot-backend
```

### 2. Install dependencies

Run the following command to install all required dependencies:

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory and add the following:

```env
OPENAI_API_KEY=your_openai_api_key
GOOGLE_CREDENTIALS_BASE64=your_base64_encoded_google_credentials
PORT=5001
```

- Replace `your_openai_api_key` with your actual OpenAI API key.
- Replace `your_base64_encoded_google_credentials` with the base64-encoded string of your Google service account credentials. You can generate this by encoding your `google-service-account-key.json` using base64.

### 4. Run the server

After setting up your environment variables, start the server using the following command:

```bash
npm start
```

The server will be accessible at `http://localhost:5001`.

### 5. Deployment

This backend can be deployed on platforms such as Render or Heroku. Make sure to set the appropriate environment variables on the platform during deployment.

## Usage

- The backend server listens for WebSocket connections on port `5001`.
- The frontend (React-based) should send user input (voice or text) as a message via WebSocket to the server.
- The server will respond with both a text-based response and an audio file (MP3).
- The frontend should play the audio and display the text response.

## CORS Configuration

CORS is enabled for the frontend URL `https://voice-bot13.netlify.app`, allowing the frontend to connect to this backend. If you're deploying to other domains, make sure to update the CORS configuration accordingly.

## Files

- **`server.js`**: Main server file that initializes the Express app, Socket.IO, PDF parsing, AI integration, and Text-to-Speech conversion.
- **`files/`**: Directory containing the PDF files that will be parsed and used to generate responses.

## Troubleshooting

- **Error**: `Could not load the default credentials`.
  - **Solution**: Make sure the base64-encoded Google service account credentials are set correctly in the `GOOGLE_CREDENTIALS_BASE64` environment variable.

- **Error**: CORS issues.
  - **Solution**: Ensure that the frontend URL is correctly set in the CORS configuration.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
