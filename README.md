# Skillatics - AI-Powered Adaptive Learning Platform

**A comprehensive learning assessment platform with adaptive testing, gamification, coding environment, and deep analytics.**

**Status**: Production Ready (MVP) | **Deadline**: February 25, 2026 | **Completion**: 85%

---

## ✨ Core Features

### 🎯 Adaptive Test Engine
- **Dynamic Difficulty Adjustment**: Questions adapt in real-time (difficulty 1-5) based on student performance
- **Smart Question Pooling**: Reuses DB questions + AI generation to minimize latency
- **AI-Powered Generation**: Uses Google Gemini to create high-quality MCQs on-demand
- **Progress Tracking**: Visual difficulty path shows adaptation in action

### 👥 Multi-Role Platform
- **Students**: Personalized dashboards, skill gap analysis, recommendations
- **Faculty**: Department-level analytics, at-risk student alerts, performance tracking
- **TPO**: College-wide insights, batch comparisons, scorecard distributions
- **Admin**: User management, question creation, platform configuration

### 💻 Coding Environment
- **Monaco Editor Integration**: Professional IDE experience with syntax highlighting
- **Multi-Language Support**: Python, JavaScript, Java, C++ (via Judge0 API)
- **Test Case Validation**: Automated test execution with detailed output
- **Real-time Feedback**: Immediate compilation errors and runtime results

### 🎮 Gamification System
- **XP & Leveling**: Earn points for tests, level up based on performance
- **10 Unique Achievements**: From "First Steps" to "Coding Ninja"
- **Live Leaderboards**: Weekly, monthly, and all-time rankings
- **Visual Progression**: Progress bars and badge showcases

### 📊 Advanced Analytics
- **Skill Gap Analysis**: Radar charts showing topic-wise proficiency
- **Personalized Recommendations**: AI-driven suggestions for weak areas
- **Performance Trends**: Historical score tracking with visualizations
- **Comparative Analytics**: Department, division, and year-wise comparisons

### 🔒 Proctoring Features (MVP)
- **Tab Switch Detection**: Monitors when students leave test page
- **Webcam Monitoring**: Live camera feed during tests
- **Violation Logging**: Records suspicious behavior for faculty review

---

## 🛠️ Tech Stack

### Backend
- **Flask** - Web framework
- **MongoDB** - NoSQL database (with Flask-PyMongo)
- **JWT** - Token-based authentication (Flask-JWT-Extended)
- **Google Gemini AI** - Question generation
- **Judge0 API** - Code execution sandbox
- **passlib** - Password hashing

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Chart.js** - Data visualization (Line, Bar, Radar charts)
- **Monaco Editor** - Code editing
- **Lucide React** - Icons
- **Axios** - HTTP client

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- MongoDB (local or Atlas)
- Judge0 API key (optional, for coding tests)
- Google Gemini API key

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure .env
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and API keys

# Initialize database
python scripts/init_db.py

# Run server
flask run  # Starts on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev  # Starts on http://localhost:5173
```

**Default Admin**: `admin@skillatics.local` / `ChangeMe123!`

---

## 📂 Project Structure

```
skillatics-io/
├── backend/
│   ├── routes/
│   │   ├── auth.py              # Authentication & OTP
│   │   ├── test_engine.py       # Adaptive testing logic
│   │   ├── code_execution.py    # Judge0 integration
│   │   ├── gamification.py      # XP, badges, leaderboards
│   │   ├── data.py              # Analytics endpoints
│   │   └── admin.py             # User & question management
│   ├── services/
│   │   ├── ai_generator.py      # Gemini question generation
│   │   └── gamification.py      # XP calculation, achievements
│   ├── app.py                   # Flask app factory
│   ├── extensions.py            # DB/JWT instances
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── XPBadge.jsx           # Gamification display
    │   │   ├── CodeEditor.jsx        # Monaco editor wrapper
    │   │   ├── ProctorMonitor.jsx    # Webcam + violation tracking
    │   │   └── [Navbars, Sidebars]
    │   ├── pages/
    │   │   ├── Test.jsx              # Adaptive MCQ test
    │   │   ├── CodingTestPage.jsx    # Code execution test
    │   │   ├── StudentDashboard.jsx  # Analytics + recommendations
    │   │   ├── FacultyDashboard.jsx  # Batch analytics
    │   │   ├── LeaderboardPage.jsx   # Rankings
    │   │   └── [Other pages]
    │   ├── lib/
    │   │   ├── api.js               # Axios client
    │   │   └── auth.js              # JWT management
    │   └── App.jsx
    └── package.json
```

---

## 🔐 API Reference

### Authentication
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/register` - Create new user
- `POST /api/auth/refresh` - Refresh access token

### Testing
- `POST /api/test/start` - Start adaptive test session
- `POST /api/test/submit` - Submit answer (returns next question or results)
- `POST /api/code/execute` - Execute code with test cases

### Gamification
- `GET /api/gamification/profile` - User's XP, level, rank, badges
- `GET /api/gamification/achievements` - All achievements with status
- `GET /api/gamification/leaderboard` - Rankings with filters
- `GET /api/gamification/stats` - Platform-wide stats

### Analytics
- `GET /api/data/my-results` - Student test history
- `GET /api/data/skill-gaps` - Topic-wise proficiency analysis
- `GET /api/data/recommendations` - Personalized learning advice
- `GET /api/data/batch-analytics` - Faculty/TPO batch metrics
- `GET /api/data/student-stats` - Per-student performance table

### Admin
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id/role` - Update user role
- `POST /api/admin/questions` - Add question manually
- `POST /api/admin/questions/generate` - AI-generate questions

---

## 🎯 Key Workflows

### Taking an Adaptive Test
1. Student navigates to `/test`
2. Selects test type (General Aptitude / Technical)
3. Backend generates pool of 13 questions across difficulties
4. First question presented (easiest)
5. Each answer adjusts next question difficulty:
   - **Correct** → Difficulty +1 (max 5)
   - **Incorrect** → Difficulty -1 (min 1)
6. After 10 questions, results show:
   - Score, XP gained, new level
   - Achievements unlocked
   - Difficulty path visualization

### Earning Achievements
- **First Steps**: Complete first test (+50 XP)
- **Perfectionist**: Score 100% (+100 XP)
- **Speed Demon**: Complete in <10 min (+75 XP)
- **Dedicated Learner**: 7-day streak (+200 XP)
- **Coding Ninja**: Solve 5 coding problems (+250 XP)
- ...and 5 more!

### Faculty Monitoring
1. Login as Faculty/TPO
2. Use filters: Department, Division, Year of Study
3. View metrics: Avg Score, At-Risk Students, Distribution
4. Export or drill down to individual student performance

---

## 🧪 Testing Checklist

### Manual Testing
- [ ] Register new student account
- [ ] Complete adaptive MCQ test
- [ ] Verify XP awarded and achievement unlocked
- [ ] Check leaderboard updates
- [ ] Take coding test (Python/JavaScript)
- [ ] Faculty login and view batch analytics
- [ ] Admin create question via AI generation

### Automated Testing
```bash
# Backend (if you add pytest)
cd backend
pytest

# Frontend (if you add Vitest)
cd frontend
npm run test
```

---

## 📈 Performance & Scalability

- **Database Indexing**: Applied on `userId`, `studentId`, `topic`, `difficulty`
- **Caching Strategy**: Question pools cached per session
- **API Rate Limiting**: Recommended for production
- **CDN**: Serve frontend via Vercel/Netlify for low latency

---

## 🚢 Deployment

### Backend (Heroku/Render/Railway)
```bash
# Example for Heroku
heroku create skillatics-api
heroku addons:create mongolab
heroku config:set JWT_SECRET_KEY=<your-secret>
heroku config:set GEMINI_API_KEY=<your-key>
git push heroku main
```

### Frontend (Vercel/Netlify)
```bash
# Update frontend/src/lib/api.js with production backend URL
npm run build
vercel --prod  # or netlify deploy --prod
```

---

## 🛣️ Roadmap

### Completed ✅
- Multi-user authentication with OTP
- Adaptive testing engine
- AI question generation
- Coding environment (Monaco + Judge0)
- Gamification (XP, badges, leaderboards)
- Analytics (skill gaps, recommendations)
- Proctoring basics

### Future Enhancements 🔮
- **Advanced Proctoring**: Face detection, eye tracking
- **Social Features**: Study groups, peer challenges
- **Mobile App**: React Native version
- **Offline Mode**: PWA with sync
- **AI Tutor**: Chatbot for personalized help
- **Video Lectures**: Integrated learning content

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👥 Team

**Skillatics** - Building the future of adaptive learning

For questions or support: `synaptrix4@gmail.com`

---

**Built with ❤️ using Flask, React, MongoDB, and AI**
