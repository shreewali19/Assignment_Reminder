# 📚 Assignment Reminder App — Smart Academic Task Manager
### 🎓 B.Tech Engineering Minor Project Presentation Edition

An intelligent, cross-platform, responsive web application designed to streamline academic submissions, eradicate late deadlines, and elevate student productivity.

---

## 🎯 Executive Summary & Presentation Alignment

| Slide | Requirement / Presentation Section | Implementation Detail |
|---|---|---|
| **Slide 1** | **Project Presentation Cover** | B.Tech Engineering Minor Project Branding with academic slate & deep indigo theme. |
| **Slide 2** | **Introduction & Core Purpose** | Acts as an automated digital secretary for academic deliverables across multiple subjects. |
| **Slide 3** | **Problem Statement** | Eliminates memory reliance, fragmented notes, and organizational chaos. |
| **Slide 4** | **Existing System Limitations** | Replaces static wall calendars and manual phone alarms with a unified dashboard. |
| **Slide 5** | **Objectives of Proposed System** | Proactive reminders, course categorization, punctuality, and intuitive UI/UX. |
| **Slide 6** | **Tech Stack & Hardware Specs** | Node.js v24, SQLite with WAL mode, Next.js App Router, React 19, TypeScript, Tailwind CSS, Recharts. |
| **Slide 7** | **System Architecture & Workflow** | Interactive lifecycle: `Student Login ➔ Dashboard ➔ Add Task ➔ Cloud DB ➔ Notification ➔ Complete`. |
| **Slide 8** | **Unique Selling Proposition (USP)** | **Dual-Tracking Engine** (Pending Deliverables vs Successfully Finalized Archive) & Proactive Reminders. |
| **Slide 9** | **Target Applications & Users** | Category filters for Engineering Colleges, Universities, Coaching Institutes, and Online Platforms. |
| **Slide 10** | **Future Scope & System Limitations** | Integrated **AI Study Scheduler Suggestions Engine** & `.ics` Calendar Sync Export. |

---

## 🌐 Live Access & Running the Website

The website is currently running locally on:
👉 **[http://localhost:3000](http://localhost:3000)**

### ⚡ 1-Click Presentation Demo Login
For immediate presentation and evaluation:
- Click the **"1-Click Presentation Demo Login"** button on the homepage, or log in with:
  - **Email**: `demo@student.edu`
  - **Password**: `password123`
- Pre-loaded with realistic B.Tech Computer Science & Engineering coursework:
  - **CS601**: Database Management Systems (*Dr. Ramesh Sharma*)
  - **CS602**: Compiler Design (*Prof. Vineeta Nair*)
  - **CS603**: Machine Learning & Deep Learning (*Dr. Sourav Banerjee*)
  - **CS604**: Computer Networks & Security (*Prof. Kunal Patel*)
  - **CS605**: Software Engineering & Agile (*Dr. Maya Roy*)

---

## ✨ Primary Features

1. **Dual-Tracking Engine (USP Slide 8)**:
   - **Pending Requirements**: Real-time tracking of urgent lab records, homework, and projects with countdown badges (e.g. *"Due in 5h"*, *"Due Tomorrow"*).
   - **Successfully Finalized Archive**: Historical log of completed coursework with celebratory confetti feedback.
2. **Proactive Deadline Notification Engine**:
   - Automated server-side deadline scanner evaluating approaching deadlines.
   - Web Notifications API for browser desktop push alerts and acoustic audio chimes.
3. **Academic Timetable & Calendar Grid**:
   - Full monthly interactive calendar view displaying deadlines color-coded by course.
4. **Workload & Performance Analytics (Recharts)**:
   - Course-by-course workload distribution bar chart.
   - Completion rate radial progress.
   - Urgency breakdown and academic task type matrix.
5. **AI Smart Scheduling Engine (Slide 10)**:
   - Dynamically analyzes upcoming deliverables and generates cognitive load-balanced study blocks.
6. **External Calendar Sync (.ICS Export)**:
   - Direct download of `.ics` file containing events, course details, and reminder alarms for import into Google Calendar, Apple Calendar, or Microsoft Outlook.
7. **Slide Inspector & Defense Showcase Modal**:
   - Built-in presentation viewer directly displaying Slides 1 to 10 and project defense notes.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Next.js App Router, Tailwind CSS, Lucide React, Recharts, Canvas-Confetti
- **Backend**: Next.js RESTful API Route Handlers (`/api/auth/*`, `/api/assignments/*`, `/api/subjects/*`, `/api/notifications/*`, `/api/export/*`, `/api/ai-scheduler/*`)
- **Database**: Native SQLite (`academic_tasks.db`) with Foreign Keys enabled and Write-Ahead Logging (WAL)
- **Authentication**: JWT-based session tokens stored in secure HTTP-only cookies, password hashing with bcryptjs

---

## 💻 Commands

```bash
# Start Development Server
npm.cmd run dev

# Run Production Build
npm.cmd run build
npm.cmd run start
```
