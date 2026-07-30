import { Project } from "@/store/project-store";

export function generatePlanningMarkdown(project: Project): string {
  let md = `# Planning: ${project.name}\n\n`;
  
  if (project.problemStatement) {
    md += `## Problem Statement\n${project.problemStatement}\n\n`;
  }
  
  if (project.objective) {
    md += `## Objective\n${project.objective}\n\n`;
  }
  
  if (project.stakeholders && project.stakeholders.length > 0) {
    md += `## Stakeholders\n`;
    project.stakeholders.forEach(s => md += `- ${s}\n`);
    md += `\n`;
  }
  
  if (project.timeline) {
    md += `## Timeline\n`;
    md += `- **Start Date:** ${project.timeline.startDate || 'TBD'}\n`;
    md += `- **End Date:** ${project.timeline.endDate || 'TBD'}\n`;
    md += `\n`;
  }
  
  return md;
}

export function generateRequirementsMarkdown(project: Project): string {
  let md = `# Requirements: ${project.name}\n\n`;
  
  if (project.requirements) {
    const { 
      functional, functionalGroups,
      nonFunctional, nonFunctionalGroups,
      externalInterface, externalInterfaceGroups
    } = project.requirements;
    
    // Helper to render a requirement section with groups
    const renderSection = (title: string, items: any[], groups: any[]) => {
      if (!items || items.length === 0) return '';
      
      let sectionMd = `## ${title}\n`;
      
      const groupMap = new Map<string, string>();
      if (groups) {
        groups.forEach(g => groupMap.set(g.id, g.name));
      }
      
      const groupedItems = new Map<string, any[]>();
      const ungroupedItems: any[] = [];
      
      items.forEach(item => {
        if (item.groupId) {
          if (!groupedItems.has(item.groupId)) {
            groupedItems.set(item.groupId, []);
          }
          groupedItems.get(item.groupId)!.push(item);
        } else {
          ungroupedItems.push(item);
        }
      });
      
      groupedItems.forEach((groupItems, groupId) => {
        const groupName = groupMap.get(groupId) || 'Unknown Group';
        sectionMd += `### ${groupName}\n`;
        groupItems.forEach(req => {
          sectionMd += `- **${req.requirement}**\n`;
          if (req.description) {
            sectionMd += `  - ${req.description.replace(/\n/g, '\n  - ')}\n`;
          }
        });
        sectionMd += `\n`;
      });
      
      if (ungroupedItems.length > 0) {
        if (groupedItems.size > 0) {
           sectionMd += `### General / Uncategorized\n`;
        }
        ungroupedItems.forEach(req => {
          sectionMd += `- **${req.requirement}**\n`;
          if (req.description) {
            sectionMd += `  - ${req.description.replace(/\n/g, '\n  - ')}\n`;
          }
        });
        sectionMd += `\n`;
      }
      
      return sectionMd;
    };

    md += renderSection("Functional Requirements", functional, functionalGroups || []);
    md += renderSection("Non-Functional Requirements", nonFunctional, nonFunctionalGroups || []);
    md += renderSection("External Interfaces", externalInterface, externalInterfaceGroups || []);
  }
  
  return md;
}

export function generateDesignMarkdown(project: Project): string {
  let md = `# System Design: ${project.name}\n\n`;
  
  if (project.design) {
    const {  rbacGroups, rbac, apiDesignGroups, apiDesign, techSpecs } = project.design;
    
   

    if (rbac && rbac.length > 0) {
      md += `## RBAC Matrix\n`;
      md += `| Permission |`;
      // Extract unique roles from the first permission or all permissions
      const roles = new Set<string>();
      rbac.forEach(p => {
        if (p.roles) Object.keys(p.roles).forEach(r => roles.add(r));
      });
      roles.forEach(r => md += ` ${r} |`);
      md += `\n|---`;
      roles.forEach(() => md += `|---`);
      md += `|\n`;
      
      rbac.forEach(p => {
        md += `| ${p.permission} |`;
        roles.forEach(r => {
          const hasAccess = p.roles && p.roles[r];
          md += hasAccess ? ` ✓ |` : ` - |`;
        });
        md += `\n`;
      });
      md += `\n`;
    }
    
    if (apiDesign && apiDesign.length > 0) {
      md += `## API Design\n`;
      apiDesign.forEach(api => {
        md += `### \`${api.verb}\` ${api.path}\n`;
        md += `- **Action:** ${api.action}\n`;
        md += `- **Used For:** ${api.usedFor}\n\n`;
      });
    }
    
    if (techSpecs && techSpecs.length > 0) {
      md += `## Tech Specifications\n`;
      techSpecs.forEach(tech => {
        md += `- **${tech.need}:** ${tech.name} (v${tech.version})\n`;
      });
      md += `\n`;
    }
  }
  
  return md;
}

export function generateTestingMarkdown(project: Project): string {
  let md = `# Testing: ${project.name}\n\n`;
  
  if (project.testCases && project.testCases.length > 0) {
    md += `## Test Cases\n`;
    md += `| Test Case ID | Status | Expected Result | Actual Result |\n`;
    md += `|---|---|---|---|\n`;
    project.testCases.forEach(tc => {
      md += `| ${tc.testCaseId} | ${tc.executionStatus} | ${tc.expectedResult || '-'} | ${tc.actualResult || '-'} |\n`;
    });
    md += `\n`;
  } else {
    md += `*No test cases defined yet.*\n\n`;
  }
  
  return md;
}

export function generateDeploymentMarkdown(project: Project): string {
  let md = `# Deployment: ${project.name}\n\n`;
  
  if (project.deployment) {
    const { platform, environments, seeds, accounts } = project.deployment;
    
    md += `## Platform\n${platform || 'TBD'}\n\n`;
    
    if (environments && environments.length > 0) {
      md += `## Environment Variables\n`;
      environments.forEach(env => {
        md += `- \`${env.name}\`: \`${env.value}\`\n`;
      });
      md += `\n`;
    }
    
    if (seeds && seeds.length > 0) {
      md += `## Database Seeds\n`;
      seeds.forEach(seed => {
        md += `- **Role:** ${seed.role} | **Email:** ${seed.email}\n`;
      });
      md += `\n`;
    }
    
    if (accounts && accounts.length > 0) {
      md += `## Accounts\n`;
      accounts.forEach(acc => {
        md += `### ${acc.platform}\n`;
        md += `- **Description:** ${acc.description}\n`;
        md += `- **Email/Username:** ${acc.email}\n\n`;
      });
    }
  }
  
  return md;
}

export function generateAllMarkdown(project: Project): string {
  return [
    generatePlanningMarkdown(project),
    generateRequirementsMarkdown(project),
    generateDesignMarkdown(project),
    generateTestingMarkdown(project),
    generateDeploymentMarkdown(project),
  ].join("\n---\n\n");
}

export function downloadMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
