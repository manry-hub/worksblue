import { z } from "zod";

// Base schemas
const prioritySchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  order: z.number(),
});

const labelSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
});

const columnSchema = z.object({
  id: z.string(),
  title: z.string(),
  order: z.number(),
  wipLimit: z.number().nullable(),
});

// Project Validation
export const projectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  status: z.enum(["Planning", "In progress", "On Hold", "Completed", "Cancelled"]).optional(),
  progress: z.number().min(0).max(100).optional(),
  
  problemStatement: z.string().optional(),
  objective: z.string().optional(),
  stakeholders: z.array(z.string()).optional(),
  
  brief: z.record(z.string(), z.string()).optional(),
  timeline: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }).optional(),
  
  design: z.record(z.string(), z.any()).optional(),
  requirements: z.record(z.string(), z.any()).optional(),
  implementationTasks: z.record(z.string(), z.boolean()).optional(),
  testCases: z.array(z.any()).optional(),
  deployment: z.record(z.string(), z.any()).optional(),
  
  repository: z.string().optional(),
  deadline: z.string().optional(),
  liveEnvironment: z.string().optional(),
  figmaDesign: z.string().optional(),
  
  columns: z.array(columnSchema).optional(),
  priorities: z.array(prioritySchema).optional(),
  labels: z.array(labelSchema).optional(),
  estimateUnit: z.enum(["hour", "day"]).optional(),
  issueNumberPrefix: z.string().optional(),
  lastIssueCounter: z.number().optional(),
  sprintSettings: z.record(z.string(), z.any()).optional(),
}).strip(); // Strips out unrecognized keys to prevent mass assignment

export const projectUpdateSchema = projectSchema.partial();

// Global Task Validation
export const globalTaskSchema = z.object({
  parentId: z.string().nullable().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  assignee: z.string().optional(),
  completed: z.boolean().optional(),
}).strip();

export const globalTaskUpdateSchema = globalTaskSchema.partial();

// Sprint Validation
export const sprintSchema = z.object({
  name: z.string().min(1, "Name is required"),
  goal: z.string().optional(),
  status: z.enum(["Planned", "Active", "Completed", "Cancelled"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
}).strip();

export const sprintUpdateSchema = sprintSchema.partial();

// Issue/Task Validation
export const issueSchema = z.object({
  sprintId: z.string().optional(),
  parentId: z.string().nullable().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(["epic", "story", "task", "bug"]).optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  labels: z.array(z.string()).optional(),
  dueDate: z.string().optional(),
  assignee: z.string().optional(),
  reporter: z.string().optional(),
  estimate: z.number().optional(),
  checklist: z.array(z.any()).optional(),
  attachments: z.array(z.any()).optional(),
  comments: z.array(z.any()).optional(),
  activity: z.array(z.any()).optional(),
}).strip();

export const issueUpdateSchema = issueSchema.partial();
