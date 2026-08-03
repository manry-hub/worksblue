
"use client";

import { use, useEffect, useState, useRef } from "react";
import { useProjectStore, type Project } from "@/store/project-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LinkIcon, XMarkIcon, PlusIcon, PencilSquareIcon, CheckIcon } from "@heroicons/react/24/outline";
import { RbacMatrix } from "./components/rbac-matrix";
import { ApiDesignTable } from "./components/api-design";
import { TechSpecsTable } from "./components/tech-specs";
import dynamic from "next/dynamic";

const ExcalidrawModal = dynamic(() => import("./components/excalidraw-modal"), { ssr: false });

type DiagramItem = { id: string; title: string; url?: string; excalidrawElements?: unknown; excalidrawAppState?: unknown };
type DesignField = 'contextDiagrams' | 'usecaseDiagrams' | 'erds' | 'uiuxDiagrams';

const DiagramCard = ({ 
  item, 
  onRemove, 
  onEdit,
  onSaveTitle
}: { 
  item: DiagramItem; 
  onRemove: () => void; 
  onEdit: () => void;
  onSaveTitle: (newTitle: string) => void;
}) => {
  const [localTitle, setLocalTitle] = useState(item.title);
  const isDirty = localTitle !== item.title;

  return (
    <div className="min-w-[320px] w-[320px] flex-shrink-0 snap-center relative group rounded-lg border border-white/10 shadow-2xl bg-black/20 overflow-hidden flex flex-col">
      <div className="p-3 border-b border-white/10 bg-white/5 flex gap-2 items-center">
        <input
          type="text"
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && isDirty) {
              onSaveTitle(localTitle);
              e.currentTarget.blur();
            }
          }}
          placeholder="Enter diagram title..."
          className="w-full bg-transparent border-none p-0 focus:ring-0 text-foreground text-sm font-medium outline-none"
        />
        {isDirty && (
          <button 
            onClick={() => onSaveTitle(localTitle)}
            className="text-green-400 hover:text-green-300 p-1 bg-green-400/10 rounded transition-colors"
            title="Save Title"
          >
            <CheckIcon className="w-4 h-4" />
          </button>
        )}
        <button 
          onClick={onRemove}
          className="text-foreground-muted hover:text-red-400 p-1 transition-colors"
          title="Delete Diagram"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
      <div className="relative w-full flex-1 flex flex-col items-center justify-center p-6 group/image bg-[#121212]">
        <div className="text-center w-full h-full flex flex-col items-center justify-center gap-4 min-h-[160px]">
          <div className="p-4 bg-white/5 rounded-full">
            <PencilSquareIcon className="w-8 h-8 text-accent/80" />
          </div>
          <p className="text-sm text-foreground-muted">Excalidraw Canvas</p>
          <Button 
            variant="secondary"
            size="sm"
            onClick={onEdit}
          >
            Edit Diagram
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function DesignPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const projectId = params.id;
  const { getProject, updateProject, fetchProjects } = useProjectStore();
  const project = getProject(projectId);

  const [figmaUrl, setFigmaUrl] = useState("");
  const figmaInitialized = useRef(false);
  
  // Excalidraw modal state
  const [activeDiagram, setActiveDiagram] = useState<{
    field: DesignField;
    id: string;
    title: string;
    elements: unknown;
    appState: unknown;
    isNew: boolean;
  } | null>(null);
  
  useEffect(() => {
    if (!project) {
      fetchProjects();
    } else if (!figmaInitialized.current) {
      setFigmaUrl(project.figmaDesign || "");
      figmaInitialized.current = true;
    }
  }, [project, fetchProjects]);

  const saveChanges = async (updates: Partial<Project>) => {
    if (!project) return;
    await updateProject(projectId, updates);
  };



  const handleRemoveItem = (field: DesignField, id: string) => {
    if (!confirm("Hapus diagram ini?")) return;
    const currentDesign = project?.design || {};
    const currentItems = currentDesign[field] || [];
    saveChanges({ design: { ...currentDesign, [field]: currentItems.filter(item => item.id !== id) } });
  };

  const updateItemTitle = (field: DesignField, id: string, newTitle: string) => {
    const currentDesign = project?.design || {};
    const currentItems = currentDesign[field] || [];
    saveChanges({ 
      design: { 
        ...currentDesign, 
        [field]: currentItems.map(item => item.id === id ? { ...item, title: newTitle } : item) 
      } 
    });
  };

  const handleSaveDiagram = (elements: unknown, appState: unknown, newTitle: string) => {
    if (!activeDiagram) return;
    const { field, id, isNew } = activeDiagram;
    
    const currentDesign = project?.design || {};
    const currentItems = currentDesign[field] || [];
    
    if (isNew) {
      const newItem: DiagramItem = {
        id,
        title: newTitle,
        excalidrawElements: elements,
        excalidrawAppState: appState,
      };
      saveChanges({ design: { ...currentDesign, [field]: [...currentItems, newItem] } });
    } else {
      saveChanges({ 
        design: { 
          ...currentDesign, 
          [field]: currentItems.map(item => item.id === id ? { ...item, title: newTitle, excalidrawElements: elements, excalidrawAppState: appState } : item) 
        } 
      });
    }
    
    setActiveDiagram(null);
  };

  if (!project) return <div className="p-8 text-center text-foreground-muted">Loading project...</div>;

  const design = project.design || {};

  const DiagramSection = ({ 
    title, 
    description, 
    field, 
    items = [],
    children
  }: { 
    title: string, 
    description: string, 
    field: DesignField,
    items?: DiagramItem[],
    children?: React.ReactNode
  }) => {
    return (
      <Card className="bg-background-elevated/40 backdrop-blur-sm border-white/5 overflow-hidden flex flex-col h-full">
        <div className="p-5 border-b border-white/5 bg-white/[0.01]">
          <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
            {title}
          </h3>
          <p className="text-sm text-foreground-muted mt-1">{description}</p>
        </div>
        
        <div className="p-6 flex-1 flex flex-col bg-black/10 gap-6">
          {children && (
            <div className="mb-4">
              {children}
            </div>
          )}
          {items.length > 0 && (
            <div className="flex overflow-x-auto gap-6 pb-4 snap-x items-stretch custom-scrollbar">
              {items.map(item => (
                <DiagramCard 
                  key={item.id}
                  item={item}
                  onRemove={() => handleRemoveItem(field, item.id)}
                  onSaveTitle={(newTitle) => updateItemTitle(field, item.id, newTitle)}
                  onEdit={() => setActiveDiagram({
                    field,
                    id: item.id,
                    title: item.title,
                    elements: item.excalidrawElements,
                    appState: item.excalidrawAppState,
                    isNew: false
                  })}
                />
              ))}
            </div>
          )}

          <div className="text-center w-full mt-auto pt-4 border-t border-white/5 border-dashed">
            <Button 
              variant="secondary" 
              className="gap-2 mx-auto"
              onClick={() => setActiveDiagram({
                field,
                id: Date.now().toString() + Math.random().toString(36).substring(7),
                title: "New Diagram",
                elements: [],
                appState: {},
                isNew: true
              })}
            >
              <PlusIcon className="w-4 h-4" />
              Add Diagram
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="h-full max-w-7xl mx-auto pb-12 space-y-12">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight text-gradient-hero">System Design</h2>
        <p className="text-foreground-muted mt-1">Buat diagram arsitektur dengan Excalidraw dan tautkan desain UI/UX.</p>
      </div>

      <div className="flex flex-col gap-6">
        <DiagramSection 
        title="Context Diagram" 
        description="High-level overview of the system and its environment."
        field="contextDiagrams"
        items={design.contextDiagrams}
      />
        <DiagramSection 
          title="Usecase Diagram" 
          description="Actors and their interactions with the system."
          field="usecaseDiagrams"
          items={design.usecaseDiagrams}
        />
       <DiagramSection 
          title="UI/UX Design" 
          description="Link to Figma or draw UI wireframes with Excalidraw."
          field="uiuxDiagrams"
          items={design.uiuxDiagrams}
        >
          <div className="space-y-4 w-full h-full flex flex-col">
            <div>
              <label className="text-sm font-medium text-foreground-muted mb-2 block">Figma Link</label>
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-4 w-4 text-foreground-muted/50" />
                  </div>
                  <input
                    type="url"
                    value={figmaUrl}
                    onChange={(e) => setFigmaUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && figmaUrl !== (project?.figmaDesign || "")) {
                        saveChanges({ figmaDesign: figmaUrl });
                        e.currentTarget.blur();
                      }
                    }}
                    placeholder="https://www.figma.com/file/..."
                    className="block w-full pl-10 bg-white/5 border border-white/10 rounded-lg py-2.5 text-foreground text-sm focus:ring-1 focus:ring-accent focus:border-accent transition-colors"
                  />
                </div>
                {figmaUrl !== (project?.figmaDesign || "") && (
                  <button 
                    onClick={() => saveChanges({ figmaDesign: figmaUrl })}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg text-sm font-medium transition-colors"
                  >
                    <CheckIcon className="w-4 h-4" />
                    Save
                  </button>
                )}
              </div>
            </div>
            
            {project?.figmaDesign && project.figmaDesign.includes("figma.com") && (
              <div className="mt-4 flex-1 min-h-[300px] w-full rounded-lg overflow-hidden border border-white/10 shadow-xl relative bg-[#1E1E1E] flex items-center justify-center">
                <iframe 
                  style={{ border: "1px solid rgba(0, 0, 0, 0.1)" }}
                  width="100%" 
                  height="100%" 
                  src={`https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(project.figmaDesign)}`} 
                  allowFullScreen
                  className="absolute inset-0"
                />
              </div>
            )}
          </div>
        </DiagramSection>

        <DiagramSection 
          title="Entity Relationship Diagram (ERD)" 
          description="Database schema and data relationships."
          field="erds"
          items={design.erds}
        />

        <ApiDesignTable projectId={projectId} />
        <RbacMatrix projectId={projectId} />
        <TechSpecsTable projectId={projectId} />
      </div>

      {activeDiagram && (
        <ExcalidrawModal
          title={activeDiagram.title}
          initialElements={activeDiagram.elements}
          initialAppState={activeDiagram.appState}
          onSave={handleSaveDiagram}
          onClose={() => setActiveDiagram(null)}
        />
      )}
    </div>
  );
}
