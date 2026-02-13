# Antigravity MERN Todo App

A production-ready full-stack Todo application with advanced features, themes, and animations.

## Features

- **Daily Rules**: Persistent rules to follow every day via drag & drop (ordered).
- **Advanced Todos**: Priorities, colors, notes, links, date/time.
- **Theming**: "Calm", "Green", "Ocean", "Dark" themes.
- **Backgrounds**: Custom image upload or presets.
- **Authentication**: JWT auth with no email verification required for MVP.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Zustand, React Query/Axios.
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT.

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- MongoDB (Running locally on default port 27017 or provide connection string)

### 1. Installation

Run the install script from the root directory:

```bash
npm install
npm run install-all
```

### 2. Environment Variables

Server is pre-configured with `.env.example`.
Copy `server/.env.example` to `server/.env` and update `MONGO_URI` if needed.

### 3. Run Development Server

Start both client and server concurrently:

```bash
npm start
```

- Frontend: http://localhost:3000 (proxied to 5173 by vite, check terminal output)
- Backend: http://localhost:5000

## API Endpoints

- POST `/api/v1/auth/register` - Create account
- POST `/api/v1/auth/login` - Login
- GET `/api/v1/todos` - Get user todos
- GET `/api/v1/rules` - Get user daily rules
