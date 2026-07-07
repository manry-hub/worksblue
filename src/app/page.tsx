import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard/dashboard";
import { WorkspaceShell } from "@/components/shell/workspace-shell";

export const metadata: Metadata = {
  title: "Dashboard — WorksBlue",
};

export default function Home() {
  return (
    <WorkspaceShell>
      <Dashboard />
    </WorkspaceShell>
  );
}
