# MeetingMind - AI Meeting Assistant

An intelligent meeting platform that provides real-time transcription, AI-generated insights, and automated follow-up workflows to maximize meeting productivity.

> **⚠️ Note:** This is a demo version. Not all features are fully functional yet. A comprehensive update with all working features is coming soon!

## 🚀 Features

### ✅ Currently Working (Demo)
- **Demo Authentication** - Use `demo@meetingmind.ai` / `demo123`
- **Virtual Whiteboard** - Drawing tools with undo/redo and AI analysis
- **Meeting Cost Calculator** - Real-time cost tracking and efficiency insights
- **Screen Annotations** - Live markup tools for presentations
- **Breakout Rooms** - AI-powered and manual room management
- **Integration Status** - Connected integrations display (Slack, Calendar, Email, Notion)
- **Modern UI** - Professional dark theme with responsive design

### 🚧 In Development
- **Live transcription** with speaker identification
- **AI-powered insights** extraction (action items, decisions, blockers)
- **Automated follow-ups** to Slack, email, and project management tools
- **Real-time collaboration** with WebRTC and WebSockets
- **Meeting analytics** and productivity insights
- **Privacy-first** design with opt-in recording and PII redaction

## 🏗️ Architecture

```
├── frontend/          # React + TypeScript UI
├── backend/           # Node.js API gateway
├── ai-service/        # Python FastAPI for ML/NLP
├── docker-compose.yml # Local development environment
└── docs/              # API documentation
```

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Redux Toolkit, Tailwind CSS, WebRTC
- **Backend:** Node.js, Express, Socket.io, PostgreSQL, Redis
- **AI/ML:** Python FastAPI, Whisper STT, GPT-4, spaCy
- **Infrastructure:** Docker, AWS (ECS, RDS, S3), GitHub Actions

## 🚀 Quick Start

### Demo Access
1. Visit the application
2. Use demo credentials:
   - **Email:** `demo@meetingmind.ai`
   - **Password:** `demo123`
3. Explore all available features!

### Development Setup
```bash
# Clone and setup
git clone https://github.com/yourusername/MeetingMind.git
cd MeetingMind

# Start development environment
docker-compose up -d

# Install dependencies
cd frontend && npm install
cd ../backend && npm install
cd ../ai-service && pip install -r requirements.txt

# Start development servers
npm run dev:all
```

## 📊 Development Status

- [x] **Phase 1:** UI/UX Foundation & Demo Features
  - [x] Authentication system with demo access
  - [x] Virtual Whiteboard with AI analysis
  - [x] Meeting Cost Calculator
  - [x] Screen Annotation tools
  - [x] Breakout Room management
  - [x] Integration status display
  - [x] Modern responsive UI

- [ ] **Phase 2:** Real AI Integration (Coming Soon)
  - [ ] Live Whisper speech-to-text
  - [ ] GPT-powered meeting insights
  - [ ] Real-time collaboration sync
  - [ ] Actual integration connections

- [ ] **Phase 3:** Production Features
  - [ ] Meeting recording & playback
  - [ ] Advanced analytics dashboard
  - [ ] Enterprise security features
  - [ ] Mobile applications

## 🔗 Integrations

**Demo Status:** All integrations show as "Connected" for demo users

- **Slack** - Meeting summaries & notifications
- **Google Calendar** - Event creation & scheduling
- **Notion** - Meeting notes & task management
- **Email** - Automated follow-ups & invitations

*Real integrations will be available in the next major update.*

---

*Built to solve real productivity challenges in modern remote work environments.*
