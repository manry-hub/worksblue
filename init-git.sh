#!/bin/bash

# Initialize git repository
git init

# Base date: 7 days ago
START_DATE=$(date -d "7 days ago" +%s)

# Helper function to commit with a date offset (in hours)
commit_with_date() {
    local offset_hours=$1
    local msg=$2
    local commit_date=$(date -d "@$((START_DATE + offset_hours * 3600))" -R)
    
    # Check if there are changes to commit
    if ! git diff --cached --quiet; then
        GIT_AUTHOR_DATE="$commit_date" GIT_COMMITTER_DATE="$commit_date" git commit -m "$msg"
    else
        echo "Nothing to commit for: $msg"
    fi
}

# 1. init: bootstrap Next.js project with TypeScript and Tailwind CSS
git add package.json tsconfig.json next.config.mjs next-env.d.ts eslint.config.mjs postcss.config.mjs .gitignore 2>/dev/null
commit_with_date 0 "init: bootstrap Next.js project with TypeScript and Tailwind CSS"

# 2. style: define global design system and CSS theme variables
git add src/app/globals.css 2>/dev/null
commit_with_date 2 "style: define global design system and CSS theme variables"

# 3. feat(ui): implement reusable UI primitives
git add src/components/ui/badge.tsx src/components/ui/button.tsx src/components/ui/card.tsx src/components/ui/icon-button.tsx src/lib/utils.ts 2>/dev/null
commit_with_date 6 "feat(ui): implement reusable UI primitives"

# 4. feat(layout): create workspace shell and root layout
git add src/app/layout.tsx src/app/page.tsx src/components/shell/workspace-shell.tsx src/components/shell/command-palette-search.tsx src/components/app-providers.tsx 2>/dev/null
commit_with_date 12 "feat(layout): create workspace shell and navigation structure"

# 5. feat(dashboard): implement main dashboard with analytics widgets
git add src/data/dashboard.ts src/components/dashboard/dashboard.tsx 2>/dev/null
commit_with_date 24 "feat(dashboard): implement main dashboard with analytics widgets"

# 6. feat(store): setup Zustand state management for projects and tasks
git add src/store/project-store.ts src/store/task-store.ts 2>/dev/null
commit_with_date 30 "feat(store): setup Zustand state management for projects and tasks"

# 7. feat(api): implement projects REST API with file-based persistence
git add src/app/api/projects/route.ts src/app/api/projects/\[id\]/route.ts 2>/dev/null
commit_with_date 36 "feat(api): implement projects REST API with file-based persistence"

# 8. feat(api): implement tasks CRUD API with project stats sync
git add src/app/api/projects/\[id\]/tasks/route.ts src/app/api/projects/\[id\]/tasks/\[taskId\]/route.ts 2>/dev/null
commit_with_date 42 "feat(api): implement tasks CRUD API with project stats sync"

# 9. feat(projects): build projects listing page with create and edit modals
git add src/app/projects/page.tsx src/components/projects/create-project-modal.tsx src/components/projects/edit-project-modal.tsx 2>/dev/null
commit_with_date 54 "feat(projects): build projects listing page with create and edit modals"

# 10. feat(projects): add project detail layout with sidebar navigation
git add src/app/projects/\[id\]/layout.tsx src/app/projects/\[id\]/page.tsx 2>/dev/null
commit_with_date 60 "feat(projects): add project detail layout with sidebar navigation"

# 11. feat(kanban): implement drag-and-drop Kanban board with dnd-kit
git add src/components/kanban/kanban-board.tsx src/components/kanban/kanban-column.tsx src/components/kanban/kanban-card.tsx 2>/dev/null
commit_with_date 72 "feat(kanban): implement drag-and-drop Kanban board with dnd-kit"

# 12. feat(kanban): add task creation and detail modals with form validation
git add src/components/kanban/create-task-modal.tsx src/components/kanban/task-details-modal.tsx src/app/projects/\[id\]/kanban/page.tsx 2>/dev/null
commit_with_date 84 "feat(kanban): add task creation and detail modals with form validation"

# 13. feat(backlog): create dedicated backlog page with CRUD and send-to-board
git add src/app/projects/\[id\]/backlog/page.tsx 2>/dev/null
commit_with_date 96 "feat(backlog): create dedicated backlog page with CRUD and send-to-board"

# 14. docs: add project requirements and design specifications
git add PRD.md design.xml techstack.md 2>/dev/null
commit_with_date 108 "docs: add project requirements and design specifications"

# Fallback for any remaining uncommitted files
git add . 2>/dev/null
commit_with_date 110 "chore: initial project configuration and remaining files"

echo "Git history generated successfully!"
