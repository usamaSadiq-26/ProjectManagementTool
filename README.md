# 🚀 Project Management Tool

A modern, comprehensive project management system built with Next.js, designed to streamline task tracking, team collaboration, and attendance management.

## ✨ Core Features

### 📋 Task Management
- **Interactive Task Boards**: Organize tasks with a dynamic drag-and-drop interface.
- **Detailed Task Cards**: Track progress, checklists, and assignees with ease.
- **Real-time Updates**: Stay synced with your team's progress instantly.

### 🕒 Attendance System
- **Employee Check-in/out**: Simple interface for employees to log their hours.
- **Admin Dashboard**: Comprehensive view for administrators to monitor attendance.
- **Automated Rules**: Configurable rules for late arrivals and half-day status.
- **Override Capabilities**: Admins can adjust attendance statuses manually.

### 📊 Dashboard & Analytics
- **Visual Insights**: Real-time charts and metrics for project health and attendance trends.
- **Recent Activity**: Activity feeds to keep everyone informed.

### 🔔 Notifications & Alerts
- **Integrated Notifications**: Stay updated with task assignments, deadline reminders, and attendance alerts.

## 🛠️ Technology Stack

### Frontend & UI
- **⚡ Next.js 15+** - The React framework for production with App Router.
- **📘 TypeScript** - Type-safe development.
- **🎨 Tailwind CSS** - Utility-first styling.
- **🧩 shadcn/ui** - High-quality, accessible components.
- **🌈 Framer Motion** - Smooth animations and transitions.

### Backend & Database
- **🗄️ Prisma ORM** - Type-safe database management.
- **🔐 NextAuth.js** - Secure authentication.
- **🔄 TanStack Query** - Efficient data fetching and synchronization.

### State Management
- **🐻 Zustand** - Lightweight and scalable state management.

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh/) (preferred) or [Node.js](https://nodejs.org/)

### Installation

```bash
# Install dependencies
bun install

# Configure environment variables
cp .env.example .env # Ensure you set up your database URL and secrets

# Setup the database
bun run db:push
bun run db:seed

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router (Dashboard, Attendance, Tasks)
├── components/          # Shared UI and Feature-specific components
├── hooks/               # Custom React hooks for logic reuse
├── lib/                 # Utility functions and configurations (Prisma, Auth)
└── types/               # TypeScript definitions
```

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Starts the development server |
| `bun run build` | Builds the application for production |
| `bun start` | Starts the production server |
| `bun run db:push` | Pushes the Prisma schema to the database |
| `bun run db:seed` | Seeds the database with initial data |

---

Built with ❤️ for efficient project management.
# ProjectManagementTool
