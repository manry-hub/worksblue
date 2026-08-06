<div align="center">
  <h1> Worksblue</h1>
  <p><strong>Comprehensive Project Management Application</strong></p>
  <p>
    <a href="#overview">Overview</a> •
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a>
  </p>
</div>

<hr/>

## 📖 Overview

Worksblue is a comprehensive project management application built with Next.js 15. It provides a full suite of tools for teams to manage their software development lifecycle, including project planning, sprint management, Kanban boards, requirements tracking, and design documentation. The platform serves as an all-in-one solution to streamline workflows and enhance team productivity.

---

## ✨ Features

### 🏢 Project Workspace
- **Project Management:** Organize your work into distinct projects and workspaces.
- **Sprint Planning & Backlog:** Plan your sprints, manage your product backlog, and track tasks.
- **Requirements & Design:** Document project requirements and create/view designs right within the app (integrates with Excalidraw).

### 📊 Task Management
- **Kanban Board:** Visualize your workflow with interactive drag-and-drop boards.
- **Issue Tracking:** Create, assign, and track issues with detailed descriptions and statuses.

### 🛡️ System & Security
- **Secure Authentication:** Protected access and robust session management.
- **PWA Ready:** Progressive Web App support for a native-like experience on any device.
- **File Storage:** Seamless file uploads and asset management.

---

## 🗂️ Project Structure

The project follows an organized Next.js App Router architecture:

```text
📦 worksblue
┣ 📂 public/ # Static assets (images, manifest, icons, service worker)
┣ 📂 src/
┃ ┣ 📂 app/ # Next.js App Router (Pages, API routes)
┃ ┣ 📂 components/ # Reusable UI components (Dashboard, Kanban, Settings, Shell)
┃ ┣ 📂 store/ # Zustand state management (Sprint Store, etc.)
┃ ┗ 📜 ...
┣ 📜 next.config.mjs # Next.js configuration (with PWA setup)
┣ 📜 package.json # Project dependencies
┗ 📜 .env.local # Environment variables (local)
```

---

## 🛠️ Tech Stack
| Category | Technology |
| :--- | :--- |
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| State Management | Zustand |
| Forms & Validation | React Hook Form & Zod |
| Drag & Drop | @dnd-kit |
| Whiteboarding | Excalidraw |
| File Storage | @vercel/blob |
| Icons | Heroicons |

---

## 🚀 Getting Started
Follow these instructions to set up the project locally.

### Prerequisites

- Node.js (>= 20.0.0)
- npm, yarn, or pnpm (pnpm >= 10.26.2 recommended)

### Installation

Clone the repository:

```bash
git clone https://github.com/manry-hub/worksblue.git
cd worksblue
```

Install dependencies:

```bash
pnpm install
```

### Environment Variables

Create a `.env.local` file in the root of your project based on `.env.example` (if available) and configure your necessary keys:

```env
# Add your environment variables here
```

### Running Locally

Start the Next.js development server:

```bash
pnpm run dev
```

Navigate to `http://localhost:3000` in your browser to see the application.

### Build and Production

To create an optimized production build:

```bash
pnpm run build
```

To start the production server:

```bash
pnpm run start
```

---

<p align="center">
  &copy; 2026 Worksblue 
</p>
