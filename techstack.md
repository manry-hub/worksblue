# Library & Teknologi yang Digunakan (Aktual)

| Kebutuhan                  | Teknologi / Library                         | Keterangan                                                 |
| -------------------------- | ------------------------------------------- | ---------------------------------------------------------- |
| **Framework**              | Next.js 15 (App Router)                     | Core framework untuk routing & server actions              |
| **Language**               | TypeScript                                  | Static typing                                              |
| **UI Library**             | React 19                                    | Core UI component                                          |
| **Styling**                | Tailwind CSS                                | Utilitas styling utama (menggantikan Tailwind 4 jika blm)  |
| **State Management**       | Zustand                                     | Digunakan pada `project-store.ts`                          |
| **Icons**                  | @heroicons/react                            | Icon system untuk seluruh antarmuka                        |
| **Data Storage**           | JSON (Local File System)                    | `.worksblue/projects.json` sebagai "database" relasional   |
| **File Upload & Image**    | HTML5 Canvas API + Next.js Route Handlers   | Konversi WebP di sisi klien & local storage (`.worksblue/`)|
| **Drag & Drop (Kanban)**   | `@dnd-kit/core`, `@dnd-kit/sortable`        | Untuk fitur drag-and-drop di halaman Kanban                |
| **Authentication (Mock)**  | `jose` + `bcryptjs`                         | Simulasi sistem login admin menggunakan JWT                |
| **Package Manager**        | pnpm                                        | Manajemen dependensi proyek                                |

| Markdown   | remark + rehype                           |
| Diagram    | React Flow                                |
| Kanban     | dnd-kit                                   |
| Timeline   | vis-timeline atau react-calendar-timeline |
| Gantt      | Frappe Gantt                              |
| Calendar   | FullCalendar                              |
| Date       | date-fns                                  |
| Search     | Fuse.js                                   |