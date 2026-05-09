# TaskFlow AI — AI-Powered Task Manager

A production-grade AI-powered task management SaaS 
## Features

| Feature | Description |
|---------|-------------|
|  Authentication | Email/password with bcrypt + JWT sessions |
|  Task Management | Full CRUD, status, priority, due dates, search & filter |
|  Calendar View | FullCalendar with tasks plotted by due date |
|  AI Assistant | Gemini-powered chat about your tasks |
|  Email Generator | AI drafts professional emails from task context |
|  Analytics | Charts for completion rate, weekly progress, distribution |
|  Notifications | In-app notification system with unread badges |
|  Dark Mode | System-aware theme toggle |

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repo>
cd agentflowos
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/aitaskmanager  # or Atlas URI
AUTH_SECRET=<run: openssl rand -base64 32>
GEMINI_API_KEY=<your Gemini API key from ai.google.dev>
AUTH_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

```
src/
├── app/
│   ├── (auth)/          # Login, Signup pages
│   ├── (dashboard)/     # Protected dashboard pages
│   ├── api/             # REST API route handlers
│   └── actions/         # Server Actions (auth, tasks)
├── components/
│   ├── ui/              # Shadcn-compatible UI primitives
│   ├── layout/          # Sidebar, Navbar, Providers
│   ├── tasks/           # TaskList, TaskForm, RecentTasks
│   ├── calendar/        # TaskCalendar (FullCalendar)
│   ├── analytics/       # StatsCard, AnalyticsDashboard
│   ├── ai/              # ChatPanel, EmailGenerator, QuickAiBar
│   ├── notifications/   # NotificationPanel
│   └── landing/         # Hero, Features, Footer
├── lib/                 # auth.ts, db.ts, gemini.ts, utils.ts
├── models/              # Mongoose models (User, Task, Notification, AiChat)
├── services/            # taskService, analyticsService, aiService
├── hooks/               # useTasks, useAnalytics, useNotifications
├── store/               # Zustand: useAppStore
├── types/               # TypeScript types + next-auth extensions
└── validators/          # Zod schemas for auth & tasks
```

## 🔌 API Reference

### Authentication
```
POST /api/auth/callback/credentials  — Sign in
```

### Tasks
```
GET    /api/tasks          — List tasks (with ?status=&priority=&search=)
POST   /api/tasks          — Create task
GET    /api/tasks/:id      — Get task
PATCH  /api/tasks/:id      — Update task
DELETE /api/tasks/:id      — Delete task
```

### Analytics
```
GET /api/analytics         — Get productivity stats
```

### AI
```
POST /api/ai/chat          — Chat with Gemini (with task context)
POST /api/ai/email         — Generate email from tasks
```

### Notifications
```
GET   /api/notifications   — List notifications
PATCH /api/notifications   — Mark as read (body: { ids?: string[] })
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI**: Shadcn UI components
- **Database**: MongoDB + Mongoose
- **Auth**: Auth.js v5 (NextAuth)
- **AI**: Google Gemini API (`gemini-1.5-flash`)
- **State**: TanStack Query + Zustand
- **Validation**: Zod
- **Animations**: Framer Motion
- **Calendar**: FullCalendar
- **Charts**: Recharts

## 📝 Notes

- AI features require a valid `GEMINI_API_KEY`. The app gracefully degrades without it.
- MongoDB can be local (`mongodb://localhost:27017/...`) or Atlas.
- Auth secret must be at least 32 random bytes.
