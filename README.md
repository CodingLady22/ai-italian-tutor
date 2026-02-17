## AI Italian Language Tutor 🇮🇹

A full-stack application designed to help users practice Italian through conversation with an AI tutor. The application allows users to practice specific grammatical concepts (e.g., Passato Prossimo) or real-world topics (e.g., Ordering Coffee) based on their skill level.

Live Site: Click <a href="https://ai-italian-tutor.vercel.app/">here</a>

### 🤖 Features (MVP)
- User Authentication: Secure signup and login with JWT.
- Customizable Practice: Select your proficiency level (A1-C2), mode (Grammar vs. Topic), and specific focus area.
- AI Tutor: Powered by Google's Gemini API, providing context-aware responses and gentle corrections.
- Conversation History: Chat sessions are saved to MongoDB for review.

### 🛠️ Tech Stack
#### Backend
- Framework: Nest.js (TypeScript)
- Database: MongoDB (via Mongoose)
- AI Model: Google Gemini 1.5 Flash (via @google/genai SDK)
- Auth: Passport.js + JWT

#### Frontend
- Framework: React + Vite
- Styling: Tailwind CSS
- State: React Context API + Axios

### ⚙️ Backend Setup
1. Navigate to the server directory:
  ```
    cd server
    npm install
  ```
2. Create a .env file in server/ from the .env.example file
3. Run the server: `npm run start:dev`

Server runs on http://localhost:3000.

### 🔌 API Endpoints
#### Auth
- POST /auth/signup - Create account
- POST /auth/login - Get JWT Access Token

#### Chat
- POST /chat/start-session - Initialize a new session
- POST /chat/send-message - Send message to AI
- GET /chat/sessions - Get user history
