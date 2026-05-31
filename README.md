# PrepWise AI 🚀

> **An AI-powered interview preparation platform** built for freshers targeting their first tech job.  
> Full-stack MERN project with Gemini AI integration, JWT auth, file uploads, analytics, and production deployment.

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen?logo=mongodb)](https://mongodb.com/atlas)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-orange?logo=google)](https://ai.google.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss)](https://tailwindcss.com)

---

## 🌟 Live Demo

> **Frontend:** [prepwise-ai.vercel.app](https://prepwise-ai.vercel.app)  
> **Backend API:** [prepwise-ai-api.render.com](https://prepwise-ai-api.render.com/api/health)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **JWT Authentication** | Secure signup/login with bcrypt password hashing, protected routes, role-based access |
| 📄 **AI Resume Analyzer** | Upload PDF → extract text → Gemini AI gives ATS score, keyword gaps, formatting score |
| 🎤 **Mock HR Interview** | AI-generated questions → user answers → per-question score + feedback + model answer |
| 📊 **DSA Tracker** | Log solved problems, auto-streak tracking, topic analytics, difficulty breakdown |
| 💡 **Question Generator** | On-demand AI interview questions for any role, type, and difficulty |
| 🛡️ **Admin Panel** | User management, platform stats, activate/deactivate accounts |
| 📈 **Analytics Dashboard** | Visual progress tracking, interview history, DSA streaks |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** — component-based UI
- **React Router DOM v7** — client-side routing with protected routes
- **Tailwind CSS** — utility-first styling with custom design system
- **Axios** — HTTP client with JWT interceptors
- **React Hot Toast** — toast notifications
- **Lucide React** — icon library
- **Vite** — lightning-fast build tool

### Backend
- **Node.js + Express.js** — REST API server
- **MongoDB Atlas + Mongoose** — cloud database with schemas and indexing
- **JWT (jsonwebtoken)** — stateless authentication
- **bcryptjs** — password hashing (12 salt rounds)
- **Multer + Cloudinary** — PDF resume upload and storage
- **pdf-parse** — server-side PDF text extraction
- **Helmet + CORS** — security middleware
- **express-rate-limit** — API rate limiting (separate limit for AI endpoints)
- **Morgan** — HTTP request logging

### AI & Cloud
- **Google Gemini 1.5 Flash** — resume analysis, interview question generation, answer evaluation
- **Cloudinary** — PDF storage with CDN delivery
- **MongoDB Atlas** — managed cloud database

### Deployment
- **Vercel** — frontend deployment with edge CDN
- **Render** — backend Node.js server
- **MongoDB Atlas** — managed database cloud

---

## 📁 Project Structure

```
prepwise-ai/
├── backend/
│   ├── config/
│   │   └── cloudinary.js        # Multer + Cloudinary storage setup
│   ├── controllers/
│   │   ├── authController.js    # Register, login, profile, password change
│   │   ├── resumeController.js  # PDF upload + Gemini AI analysis
│   │   ├── interviewController.js # Full mock interview session lifecycle
│   │   └── dsaController.js     # DSA logging, streak tracking, analytics
│   ├── middleware/
│   │   ├── auth.js              # JWT protect + adminOnly middleware
│   │   └── errorHandler.js      # Global async error handler
│   ├── models/
│   │   ├── User.js              # User schema with streak, stats, resumes
│   │   ├── Interview.js         # Interview session with Q&A and scores
│   │   └── DSAProblem.js        # DSA problem log with topic/difficulty
│   ├── routes/
│   │   ├── auth.js
│   │   ├── resume.js
│   │   ├── interview.js
│   │   ├── dsa.js
│   │   ├── questions.js
│   │   └── admin.js
│   ├── utils/
│   │   └── gemini.js            # All Gemini AI functions (analyze, generate, evaluate)
│   ├── server.js                # Express app + MongoDB connection
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ui/
│   │   │       └── Layout.jsx   # Sidebar + responsive mobile layout
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Global auth state with React Context
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ResumeAnalyzerPage.jsx
│   │   │   ├── MockInterviewPage.jsx
│   │   │   ├── InterviewSessionPage.jsx
│   │   │   ├── InterviewResultPage.jsx
│   │   │   ├── DSATrackerPage.jsx
│   │   │   ├── QuestionGeneratorPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── AdminPage.jsx
│   │   ├── services/
│   │   │   └── api.js           # Axios instance + all API calls
│   │   ├── App.jsx              # Router + protected routes
│   │   ├── main.jsx
│   │   └── index.css            # Tailwind + custom component classes
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── index.html
│
└── README.md
```

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier)
- Google AI Studio account (Gemini API key — free)
- Cloudinary account (free tier)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/prepwise-ai.git
cd prepwise-ai
```

### 2. Setup the Backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill in your `.env` file:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/prepwise
JWT_SECRET=your_super_long_secret_key_here
JWT_EXPIRE=7d
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

```bash
npm run dev
# Server runs at http://localhost:5000
```

### 3. Setup the Frontend

```bash
cd ../frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

---

## 🌐 Deployment Guide

### Backend → Render

1. Push code to GitHub
2. Create new Web Service on [render.com](https://render.com)
3. Root directory: `backend`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add all environment variables in Render dashboard

### Frontend → Vercel

1. Import GitHub repo on [vercel.com](https://vercel.com)
2. Root directory: `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-render-url.onrender.com`

> Update `vite.config.js` proxy target to your Render URL for production.

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Private |
| PUT | `/api/auth/update-profile` | Private |
| PUT | `/api/auth/change-password` | Private |

### Resume
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/resume/analyze` | Private (multipart/form-data) |
| GET | `/api/resume/history` | Private |

### Interview
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/interview/start` | Private |
| POST | `/api/interview/:id/answer` | Private |
| POST | `/api/interview/:id/complete` | Private |
| GET | `/api/interview/history` | Private |
| GET | `/api/interview/:id` | Private |

### DSA
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/dsa/log` | Private |
| GET | `/api/dsa/problems` | Private |
| GET | `/api/dsa/analytics` | Private |
| DELETE | `/api/dsa/:id` | Private |

### Admin
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/admin/stats` | Admin only |
| GET | `/api/admin/users` | Admin only |
| PUT | `/api/admin/users/:id/toggle` | Admin only |

---

## 💡 Key Interview Questions

You'll be asked these when you present this project — study them!

**Authentication:**
- How does JWT authentication work? What's stored in the token?
- Why use bcrypt with 12 salt rounds?
- What's the difference between authentication and authorization?
- How do you protect routes in Express? In React?

**API & Backend:**
- What is REST API? How are your routes RESTful?
- What is middleware in Express? Name the middleware you used.
- How does rate limiting protect your API?
- Why MongoDB over SQL for this project?

**AI Integration:**
- How do you call the Gemini API? What is a prompt?
- How do you ensure the AI returns JSON?
- Why is there a separate rate limit for AI endpoints?

**Frontend:**
- What is React Context? Why use it for auth?
- How do Axios interceptors work?
- What is a protected route in React Router?

**Deployment:**
- What are environment variables? Why not commit them?
- How does CORS work and why is it needed?
- What is the difference between Vercel and Render?

---

## 📸 Screenshots

> *(Add screenshots of your deployed app here for maximum recruiter impact)*

---

## 🤝 Author

Built by **[Your Name]** — fresher targeting full-stack / backend developer roles.

- LinkedIn: [linkedin.com/in/yourname](https://linkedin.com/in/yourname)
- GitHub: [github.com/yourusername](https://github.com/yourusername)
- Email: your@email.com

---

## 📄 License

MIT License — free to use and modify.
