
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Excalidraw } from "@excalidraw/excalidraw";
import { useState } from "react";
import { CheckIcon } from "@heroicons/react/24/outline";

export interface ExcalidrawModalProps {
  initialElements?: any;
  initialAppState?: any;
  initialFiles?: any;
  onSave: (elements: any, appState: any, files: any, newTitle: string) => void;
  onClose: () => void;
  title: string;
}

export default function ExcalidrawModal({ initialElements, initialAppState, initialFiles, onSave, onClose, title }: ExcalidrawModalProps) {
  const [elements, setElements] = useState(initialElements || []);
  const [appState, setAppState] = useState(initialAppState || {});
  const [files, setFiles] = useState(initialFiles || {});
  const [diagramTitle, setDiagramTitle] = useState(title);

  const handleSave = () => {
    onSave(elements, appState, files, diagramTitle);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#121212]">
      <div className="flex items-center justify-between px-4 py-3 bg-background border-b border-white/10 shrink-0">
        <input
          type="text"
          value={diagramTitle}
          onChange={(e) => setDiagramTitle(e.target.value)}
          placeholder="Nama Diagram..."
          className="bg-transparent border border-transparent hover:border-white/10 focus:border-accent focus:bg-white/5 focus:ring-1 focus:ring-accent rounded px-2 py-1 text-lg font-medium text-foreground w-64 outline-none transition-all"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-foreground-muted hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-md text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            <CheckIcon className="w-4 h-4" />
            Save & Close
          </button>
        </div>
      </div>
      <div className="flex-1 relative w-full h-full min-h-[500px]">
        <Excalidraw
          initialData={{
            elements: initialElements,
            appState: initialAppState ? { ...(initialAppState as any), collaborators: new Map() } : undefined,
            files: initialFiles,
          }}
          onChange={(excalidrawElements, excalidrawAppState, excalidrawFiles) => {
            setElements(excalidrawElements);
            setAppState(excalidrawAppState);
            setFiles(excalidrawFiles);
          }}
          theme="dark"
        />
      </div>
    </div>
  );
}
