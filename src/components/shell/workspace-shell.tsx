"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BellIcon,
  ClipboardDocumentCheckIcon,
  CodeBracketSquareIcon,
  FolderIcon,
  PlusIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightStartOnRectangleIcon
} from "@heroicons/react/24/outline";
import { HomeIcon } from "@heroicons/react/24/solid";
import type { ReactNode } from "react";
import { CommandPaletteSearch } from "./command-palette-search";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/store/project-store";

function WorkspaceSwitcherIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z"
      />
    </svg>
  );
}

function NavItem({
  icon: Icon,
  label,
  href = "#",
  isActive = false,
  badge,
  disabled = false
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  href?: string;
  isActive?: boolean;
  badge?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <Link
      href={disabled ? "#" : href}
      className={cn(
        "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors duration-200",
        {
          "bg-white/[0.08] text-foreground font-medium": isActive,
          "text-foreground-muted hover:bg-white/[0.05] hover:text-foreground": !isActive && !disabled,
          "opacity-50 cursor-not-allowed pointer-events-none text-foreground-muted": disabled
        }
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <span>{label}</span>
      </div>
      {badge && badge}
    </Link>
  );
}

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { projects } = useProjectStore();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background-deep/60 backdrop-blur-md md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-72 md:w-64 lg:w-72 glass-panel border-y-0 border-l-0 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:translate-x-0 md:static shadow-2xl md:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Workspace Switcher Header */}
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center text-accent-bright">
              <WorkspaceSwitcherIcon />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">Personal Workspace</span>
              <span className="text-xs text-foreground-muted">{projects.length} active projects</span>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-foreground-muted hover:text-foreground">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          <div className="space-y-1">
            <p className="px-3 mb-2 text-xs font-mono tracking-widest uppercase text-foreground-subtle">Workspace</p>
            <NavItem icon={HomeIcon} label="Dashboard" href="/" isActive={pathname === "/"} />
            <NavItem 
              icon={FolderIcon} 
              label="Projects" 
              href="/projects" 
              isActive={pathname.startsWith("/projects")} 
              badge={projects.length > 0 ? <Badge>{projects.length}</Badge> : undefined} 
            />
          </div>

          <div className="space-y-1">
            <p className="px-3 mb-2 text-xs font-mono tracking-widest uppercase text-foreground-subtle">Management</p>
            <NavItem icon={ClipboardDocumentCheckIcon} label="Tasks" disabled />
          </div>

         
        </div>
      </aside>
    </>
  );
}

function Topbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const isProjectsPage = pathname === "/projects";
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        if (data.authenticated) setUserName(data.user.name);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const initials = userName
    ? userName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-white/[0.04] bg-background-base/60 backdrop-blur-2xl sticky top-0 z-30 transition-all duration-300">
      
      <div className="flex items-center gap-4">
        <button onClick={onOpenSidebar} className="md:hidden text-foreground-muted hover:text-foreground">
          <Bars3Icon className="w-6 h-6" />
        </button>
        <div className="hidden md:flex items-center gap-2">
          <CodeBracketSquareIcon className="w-5 h-5 text-accent-bright" />
          <span className="font-semibold tracking-tight text-foreground">WorksBlue</span>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-4">
        <CommandPaletteSearch />
      </div>

      <div className="flex items-center gap-2">
        {!isProjectsPage && (
          <div className="hidden md:block">
            <Link href="/projects">
              <Button variant="primary" size="sm" icon={<PlusIcon />}>
                New Project
              </Button>
            </Link>
          </div>
        )}
        <IconButton variant="ghost" size="sm" icon={<BellIcon />} aria-label="Notifications" />
        
        {/* User Avatar with Dropdown */}
        <div className="relative ml-2" ref={menuRef}>
          <button 
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-sky-500 p-[1px] cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-shadow"
          >
            <div className="w-full h-full rounded-full bg-background-elevated flex items-center justify-center text-xs font-semibold text-white">
              {initials}
            </div>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-background-elevated border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <p className="text-sm font-medium text-foreground">{userName || "User"}</p>
                <p className="text-xs text-foreground-muted">Logged in</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-white/[0.04] transition-colors"
              >
                <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-base text-foreground">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar onOpenSidebar={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto relative custom-scrollbar">
          <div className="dashboard-frame pb-32 px-4 sm:px-6 md:px-8 lg:px-12 pt-6 sm:pt-8 transition-all duration-300">
            <div className="mobile-brand md:hidden mb-6 flex items-center justify-between border-b border-white/[0.06] pb-4">
              <span className="font-semibold">WorksBlue</span>
              <Link href="/projects">
                <Button variant="primary" size="sm" icon={<PlusIcon />}>
                  Project
                </Button>
              </Link>
            </div>
            
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
