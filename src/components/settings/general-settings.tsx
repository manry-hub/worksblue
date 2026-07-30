"use client";

import { useState } from "react";
import { Project } from "@/store/project-store";
import { SprintSettings } from "@/types/sprint";
import { Button } from "@/components/ui/button";

export function GeneralSettings({ project, updateProject }: { project: Project; updateProject: (data: Partial<Project>) => Promise<void> }) {
  const [estimateUnit, setEstimateUnit] = useState(project.estimateUnit || "hour");
  const [issueNumberPrefix, setIssueNumberPrefix] = useState(project.issueNumberPrefix || "ISSUE-");
  const [sprintSettings, setSprintSettings] = useState<SprintSettings>(project.sprintSettings || {
    defaultDurationWeeks: 2,
    workingDays: [1, 2, 3, 4, 5],
    autoCloseSprint: false,
    sprintPrefix: "SPRINT-"
  });
  
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await updateProject({ estimateUnit: estimateUnit as "hour" | "day", issueNumberPrefix, sprintSettings });
    setIsSaving(false);
  };

  const handleWorkingDayToggle = (day: number) => {
    const days = [...sprintSettings.workingDays];
    if (days.includes(day)) {
      setSprintSettings({ ...sprintSettings, workingDays: days.filter(d => d !== day) });
    } else {
      setSprintSettings({ ...sprintSettings, workingDays: [...days, day].sort() });
    }
  };

  const daysOfWeek = [
    { value: 1, label: "Mon" },
    { value: 2, label: "Tue" },
    { value: 3, label: "Wed" },
    { value: 4, label: "Thu" },
    { value: 5, label: "Fri" },
    { value: 6, label: "Sat" },
    { value: 0, label: "Sun" },
  ];

  return (
    <div className="space-y-10 animate-fade-in-up">
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">General Configuration</h2>
          <p className="text-sm text-foreground-muted mt-1">Configure global estimation and issue formatting.</p>
        </div>
        
        <div className="space-y-6 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-2">Estimate Unit</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="estimateUnit"
                  value="hour"
                  checked={estimateUnit === "hour"}
                  onChange={(e) => setEstimateUnit(e.target.value as "hour" | "day")}
                  className="accent-accent"
                />
                <span className="text-sm text-foreground">Hours</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="estimateUnit"
                  value="day"
                  checked={estimateUnit === "day"}
                  onChange={(e) => setEstimateUnit(e.target.value as "hour" | "day")}
                  className="accent-accent"
                />
                <span className="text-sm text-foreground">Days</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-1">Issue Numbering Prefix</label>
            <input
              type="text"
              value={issueNumberPrefix}
              onChange={(e) => setIssueNumberPrefix(e.target.value)}
              placeholder="e.g. ISSUE-"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
            <p className="text-xs text-foreground-subtle mt-1">Example: {issueNumberPrefix}001, {issueNumberPrefix}002</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.05] pt-10">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">Sprint Settings</h2>
          <p className="text-sm text-foreground-muted mt-1">Configure default sprint behaviors.</p>
        </div>
        
        <div className="space-y-6 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-1">Default Sprint Duration (Weeks)</label>
            <select
              value={sprintSettings.defaultDurationWeeks}
              onChange={(e) => setSprintSettings({ ...sprintSettings, defaultDurationWeeks: parseInt(e.target.value) as 1|2|3|4 })}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent appearance-none"
            >
              {[1, 2, 3, 4].map(w => <option key={w} value={w} className="bg-background-elevated">{w} Week{w > 1 ? "s" : ""}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-2">Working Days</label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map(day => {
                const isSelected = sprintSettings.workingDays.includes(day.value);
                return (
                  <button
                    key={day.value}
                    onClick={() => handleWorkingDayToggle(day.value)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                      isSelected 
                        ? 'bg-accent/20 border-accent/50 text-accent' 
                        : 'bg-white/[0.03] border-white/[0.08] text-foreground-muted hover:text-foreground hover:bg-white/[0.05]'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={sprintSettings.autoCloseSprint}
              onChange={(e) => setSprintSettings({ ...sprintSettings, autoCloseSprint: e.target.checked })}
              className="accent-accent w-4 h-4 rounded border-white/[0.08] bg-white/[0.03]"
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">Auto-close Sprints</span>
              <span className="text-xs text-foreground-subtle">Automatically close sprints when end date is reached</span>
            </div>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end pt-4 border-t border-white/[0.05]">
        <Button variant="primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
