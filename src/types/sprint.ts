export type SprintStatus = "Planned" | "Active" | "Completed" | "Cancelled";

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal: string;
  status: SprintStatus;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface SprintSettings {
  defaultDurationWeeks: 1 | 2 | 3 | 4;
  workingDays: number[];
  autoCloseSprint: boolean;
  sprintPrefix: string;
}

export interface ColumnConfig {
  id: string;
  title: string;
  order: number;
  wipLimit: number | null;
}

export interface PriorityConfig {
  id: string;
  name: string;
  color: string;
  order: number;
}

export interface LabelConfig {
  id: string;
  name: string;
  color: string;
}

export interface ProjectConfig {
  columns: ColumnConfig[];
  priorities: PriorityConfig[];
  labels: LabelConfig[];
  estimateUnit: "hour" | "day";
  issueNumberPrefix: string;
  sprintSettings: SprintSettings;
}

export interface ExtendedIssue {
  id: string;
  projectId: string;
  sprintId?: string;
  parentId?: string | null;
  title: string;
  description?: string;
  type: "epic" | "story" | "task" | "bug";
  status: string;
  priority: string;
  labels: string[];
  dueDate?: string;
  assignee?: string;
  reporter?: string;
  estimate?: number;
  checklist: ChecklistItem[];
  attachments: Attachment[];
  comments: Comment[];
  activity: Activity[];
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  action: string;
  user: string;
  timestamp: string;
}