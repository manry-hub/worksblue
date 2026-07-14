# Scrumban Development

---

# 1. Overview

> Sudah digabung ke **Project Overview**

### Tujuan

Memberikan gambaran kondisi proyek.

### Widget

```text
Project Progress

72%
```

```text
Task Summary

Todo
12

In Progress
5

Review
3

Done
18
```

```text
Recent Activity

✓ Task Login created

✓ API updated

✓ Task Dashboard completed
```

```text
Upcoming Deadline

Login API

2 days left
```

```text
Team Members

Hilman

Developer
```

---

# 2. Backlog

Ini menjadi tempat seluruh task sebelum masuk board.

## Features

✅ Create Task

✅ Edit Task

✅ Delete Task

✅ Priority

✅ Labels

✅ Due Date

✅ Estimate

✅ Assignee

✅ Search

✅ Filter

---

### Tampilan

```text
Backlog

+ New Task

──────────────────────────

□ Login

Priority : High

Estimate : 3h

□ Dashboard

Priority : Medium

Estimate : 6h

□ Notification
```

Task bisa dipindahkan ke **Ready**.

---

# 3. Kanban

Ini inti aplikasi.

Default workflow

```text
Backlog

↓

Ready

↓

In Progress

↓

Review

↓

Done
```

---

## Features

✅ Drag & Drop

✅ WIP Limit

✅ Move Task

✅ Task Detail

✅ Labels

✅ Due Date

✅ Assignee

✅ Checklist

✅ Comments

---

Misalnya

```text
Ready

Login

Dashboard

----------------

In Progress

Payment

Notification

(WIP = 2)
```

Kalau sudah penuh

↓

Muncul badge

```text
WIP Limit Reached
```

---

# 4. Reports

Versi awal jangan terlalu banyak.

Cukup

## Progress

```text
Completed

65%
```

---

## Task Status

```text
Todo

12

Doing

4

Done

31
```

---

## Priority Distribution

```text
Critical

2

High

10

Medium

8

Low

3
```

---

## Throughput

```text
Week 1

15 Task

Week 2

18 Task
```

---

## Activity

```text
Yesterday

5 Tasks Completed
```

---

# 5. Configuration

Pengaturan board.

---

## Workflow

```text
Backlog

Ready

In Progress

Review

Done
```

Bisa tambah kolom.

---

## WIP Limit

```text
Ready

∞

In Progress

2

Review

3
```

---

## Labels

```text
Bug

Feature

Enhancement

Documentation
```

---

## Priority

```text
Critical

High

Medium

Low
```

---

## Members

```text
Owner

Developer

QA
```



---

# Struktur Folder

```text
Development
│
├── Overview -> page.tsx
│
├── Backlog
│
├── Kanban
│
├── Reports
│
└── Configuration
```

---

# MVP Features

Saya akan membatasi fitur versi pertama menjadi:

### Overview

* Project Progress
* Task Summary
* Recent Activity
* Upcoming Deadline

### Backlog

* CRUD Task
* Priority
* Labels
* Due Date
* Estimate
* Search
* Filter

### Kanban

* Drag & Drop
* WIP Limit
* Checklist
* Comments
* Assignee

### Reports

* Progress
* Task Status
* Priority Distribution
* Throughput

### Configuration

* Workflow
* WIP Limit
* Labels
* Priority
* Members

