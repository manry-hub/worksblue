"use client";

import { useState } from "react";
import {
  MapIcon,
  DocumentMagnifyingGlassIcon,
  CodeBracketSquareIcon,
  RocketLaunchIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentCheckIcon,
  RectangleGroupIcon,
  HomeIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowLeftIcon,
  WindowIcon
} from "@heroicons/react/24/outline";
import type { ReactNode } from "react";
import { CommandPaletteSearch } from "@/components/shell/command-palette-search";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

function NavItem({
  icon: Icon,
  label,
  href,
  isActive = false,
  disabled = false
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  href: string;
  isActive?: boolean;
  disabled?: boolean;
}) {
  return (
    <Link
      href={disabled ? "#" : href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-200",
        {
          "bg-white/[0.08] text-foreground font-medium": isActive,
          "text-foreground-muted hover:bg-white/[0.05] hover:text-foreground": !isActive && !disabled,
          "opacity-50 cursor-not-allowed pointer-events-none text-foreground-muted": disabled
        }
      )}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );
}

function ProjectSidebar({ isOpen, onClose, projectId }: { isOpen: boolean; onClose: () => void; projectId: string }) {
  const pathname = usePathname();
  const basePath = `/projects/${projectId}`;

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background-deep/60 backdrop-blur-md md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-72 md:w-64 lg:w-72 glass-panel border-y-0 border-l-0 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:translate-x-0 md:static shadow-2xl md:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
          <Link href="/projects" className="flex items-center gap-2 text-foreground-muted hover:text-foreground text-sm font-medium transition-colors">
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Projects
          </Link>
          <button onClick={onClose} className="md:hidden text-foreground-muted hover:text-foreground">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="space-y-1">
            <NavItem icon={HomeIcon} label="Overview" href={basePath} isActive={pathname === basePath} />
            
          </div>

          <div className="space-y-1">
            <p className="px-3 mb-2 text-xs font-mono tracking-widest uppercase text-foreground-subtle">SDLC Phase Docs</p>
            <NavItem icon={MapIcon} label="Planning" href={`${basePath}/planning`} isActive={pathname === `${basePath}/planning`} />
            <NavItem icon={DocumentMagnifyingGlassIcon} label="Requirements" href={`${basePath}/requirements`} isActive={pathname === `${basePath}/requirements`} />
            <NavItem icon={WindowIcon } label="Design" href={`${basePath}/design`} isActive={pathname === `${basePath}/design`} />
            <NavItem icon={CodeBracketSquareIcon} label="Implementation" href={`${basePath}/implementation`} isActive={pathname === `${basePath}/implementation`} />
            <NavItem icon={WrenchScrewdriverIcon} label="Testing" href={`${basePath}/testing`} isActive={pathname === `${basePath}/testing`} />
            <NavItem icon={RocketLaunchIcon} label="Deployment" href={`${basePath}/deployment`} isActive={pathname === `${basePath}/deployment`} />
          </div>
          <div className="space-y-1">
            <p className="px-3 mb-2 text-xs font-mono tracking-widest uppercase text-foreground-subtle">Scrumban Development</p>
            <NavItem icon={ClipboardDocumentCheckIcon} label="Backlog" href={`${basePath}/backlog`} isActive={pathname === `${basePath}/backlog`} />
            <NavItem icon={RectangleGroupIcon} label="Kanban" href={`${basePath}/kanban`} isActive={pathname === `${basePath}/kanban`} />
          </div>
        </div>
      </aside>
    </>
  );
}

export default function ProjectLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const params = useParams();
  const projectId = params.id as string;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-base text-foreground">
      <ProjectSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} projectId={projectId} />
      
      <div className="flex flex-col flex-1 min-w-0">
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-white/[0.04] bg-background-base/60 backdrop-blur-2xl sticky top-0 z-30 transition-all duration-300">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-foreground-muted hover:text-foreground">
              <Bars3Icon className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 max-w-md mx-4">
            <CommandPaletteSearch />
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-sky-500 p-[1px] ml-2 cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-shadow">
              <div className="w-full h-full rounded-full bg-background-elevated flex items-center justify-center text-xs font-semibold text-white">
                UD
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto relative custom-scrollbar">
          <div className="dashboard-frame pb-32 px-4 sm:px-6 md:px-8 lg:px-12 pt-6 sm:pt-8 transition-all duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
