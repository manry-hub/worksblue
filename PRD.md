# Product Vision

WorksBlue adalah aplikasi web yang dirancang khusus untuk developer dalam mengelola seluruh siklus pengembangan perangkat lunak, mulai dari ide, perencanaan, implementasi, pengujian, hingga deployment dan maintenance.

WorksBlue menyediakan satu workspace terstruktur sehingga seluruh aspek teknis dan manajemen project berada dalam satu tempat.

---

# Product Objectives

WorksBlue membantu developer untuk:

- Merencanakan project secara terstruktur.
- Mendokumentasikan seluruh keputusan teknis.
- Mengelola task dan progres pengembangan.
- Memvisualisasikan timeline project.
- Menyusun deployment checklist.
- Menyimpan dokumentasi project secara terorganisir.
- Memudahkan maintenance setelah project selesai.

---

# Target User

### Primary

- Solo Developer
- Full Stack Developer
- Backend Developer
- Frontend Developer
- Freelancer

### Secondary

- Mahasiswa
- Startup Founder
- Technical Lead

---

# Software Development Lifecycle (SDLC)

Ini adalah inti WorksBlue.

```
Idea

↓

Planning

↓

Requirements

↓

Design

↓

Implementation

↓

Testing

↓

Deployment

↓

Maintenance
```

Seluruh modul mengikuti alur tersebut.

---

# Core Modules

## Dashboard

Ringkasan seluruh workspace.

- Active Projects
- Upcoming Deadlines
- Recent Activities
- Project Progress
- Quick Access

---

## Project Overview

Informasi dasar project.

- Nama
- Deskripsi
- Status
- Progress
- Tech Stack
- Repository
- Deadline
- Version

---

## Planning

Berisi:

- Vision
- Objectives
- Scope
- Milestones
- Roadmap
- Feature List
- Priority

---

## Requirements

- Functional Requirements
- Non-functional Requirements

---

## Design

- Architecture
- Tech Stack
- ERD 
- Flow Diagram
- API Design

---

## Implementation

- Modules
- Tasks
- Development Notes

---

## Testing

- Unit Test
- Integration Test
- Manual Testing
- Bug Tracking
- Regression Checklist

---

## Deployment

- Environment
- Server Configuration
- Docker
- CI/CD
- Release Checklist
- Rollback Plan

---

## Maintenance

- Bug Fix Log
- Improvements
- Feature Requests
- Technical Debt
- Known Issues

---

## Documentation

- README
- Installation Guide
- Configuration
- API Documentation
- Developer Notes

---

## Changelog

Riwayat perubahan project.

---

# Project Management

Bagian ini menjadi fitur utama, bukan pelengkap.

## Task Management

- Task
- Subtask
- Labels
- Priority
- Status
- Assignee (opsional untuk penggunaan tim di masa depan)

---

## Kanban Board

Status task.

```
Backlog

↓

To Do

↓

In Progress

↓

Review

↓

Testing

↓

Done
```

---

# Documentation

WorksBlue menggabungkan project management dan dokumentasi.

Setiap project memiliki:

```
Overview

Planning

Requirements

Design

Implementation

Testing

Deployment

Maintenance

Documentation

Resources
```

---

# Core Principles

- **Project-first** — Semua aktivitas berpusat pada project.
- **Developer-centric** — Dibangun sesuai workflow developer.
- **Structured documentation** — Struktur dokumentasi konsisten.
- **Visual planning** — Mendukung Kanban.
- **Lightweight** — Cepat dan tidak membebani developer.
- **Portable** — Data mudah dibackup dan dipindahkan.

---

# MVP (v1) - Implemented Features

Berikut adalah ruang lingkup MVP (v1) yang telah selesai diimplementasikan secara aktual:

### 1. Workspace & Project Overview
- **Projects Dashboard**: Ringkasan project aktif, Tech Stack, Repository, Deadline, Live Environment, dsb.
- **Local JSON Database**: Menggunakan file `.worksblue/projects.json` untuk manajemen state yang portabel dan cepat.
- **Mock Authentication**: Simulasi login menggunakan `jose` (JWT) dan `bcryptjs`.

### 2. Scrumban (Project Management)
- **Backlog**: Daftar tugas yang belum dikerjakan.
- **Kanban Board**: Drag-and-drop tugas antar status (Todo, In Progress, Review, Done) menggunakan `@dnd-kit/core`.

### 3. SDLC Documentation Modules
Seluruh fase pengembangan telah diimplementasikan dalam UI interaktif (CRUD lengkap):
- **Planning**: Visi, Misi, Target.
- **Requirements**: Grouping dan CRUD untuk Functional, Non-Functional, dan External Interface Requirements.
- **Design**:
  - Upload Diagram Interaktif (Context, Usecase, ERD) dengan konversi otomatis ke `.webp` via Canvas API di sisi klien.
  - Tabel Matrix RBAC dinamis berdasarkan daftar Stakeholders.
  - Desain Endpoint API.
  - Technology Specifications (Tech Specs).
- **Implementation**: Halaman khusus berisi progress tracking / checklist interaktif.
- **Testing**: Tabel eksekusi Test Cases dengan fitur *search dropdown*, grouping otomatis berdasarkan Requirement ID, *auto-resizing textareas*, dan Preview Modal UI.
- **Deployment**: Manajemen Platform, Platform Accounts, Environment Configuration (`.env`), dan User Seeds.

### 4. Utilities & Infrastructure
- **Server-side Asset Serving**: Rute `/api/uploads/[filename]` untuk merender dan menyajikan file statis yang diunggah secara dinamis.
- **Custom UI / UX**: Antarmuka estetis bertema *dark-glassmorphism*, *micro-animations*, dan desain premium yang responsif.

*(Catatan: Modul Maintenance, Documentation terpisah, Changelog, dan Export/Backup dapat menjadi ruang lingkup pada fase iterasi pengembangan selanjutnya).*