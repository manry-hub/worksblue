"use client";

import { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export function CommandPaletteSearch() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="command-trigger w-full max-w-full justify-between"
        type="button"
        aria-label="Search projects and docs"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-2">
          <MagnifyingGlassIcon className="w-4 h-4 text-foreground-muted" />
          <span className="text-foreground-subtle">search</span>
        </div>
      </button>

      {/* Mock Command Palette Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-background-base/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal */}
          <div className="relative w-full max-w-2xl bg-background-elevated border border-white/[0.06] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(59,130,246,0.1)] overflow-hidden animate-fade-in-up">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
              <MagnifyingGlassIcon className="w-5 h-5 text-accent" />
              <input 
                autoFocus
                type="text"
                className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-foreground-subtle"
                placeholder="Type to search..."
              />
              <button 
                onClick={() => setIsOpen(false)}
                className="text-xs text-foreground-subtle hover:text-foreground border border-white/[0.06] rounded px-2 py-1"
              >
                ESC
              </button>
            </div>
            <div className="p-4 py-12 text-center text-sm text-foreground-muted">
              Search results will appear here.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
