"use client";

import { use, useEffect, useState, useRef } from "react";
import { useProjectStore, type Project } from "@/store/project-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PhotoIcon, LinkIcon, ArrowUpTrayIcon, XMarkIcon, ArrowsPointingOutIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { RbacMatrix } from "./components/rbac-matrix";
import { ApiDesignTable } from "./components/api-design";
import { TechSpecsTable } from "./components/tech-specs";

type DiagramItem = { id: string; title: string; url: string };
type DesignField = 'contextDiagrams' | 'usecaseDiagrams' | 'erds';

const convertToWebP = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Could not get canvas context"));
        // Fill white background to prevent transparent images turning black
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Canvas to Blob failed"));
          },
          "image/webp",
          0.8
        );
      };
      img.onerror = () => reject(new Error("Image load failed"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  });
};

export default function DesignPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const projectId = params.id;
  const { getProject, updateProject, fetchProjects } = useProjectStore();
  const project = getProject(projectId);

  const [figmaUrl, setFigmaUrl] = useState("");
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  
  useEffect(() => {
    if (!project) {
      fetchProjects();
    } else {
      setFigmaUrl(project.figmaDesign || "");
    }
  }, [project, fetchProjects]);

  const saveChanges = async (updates: Partial<Project>) => {
    if (!project) return;
    await updateProject(projectId, updates);
  };

  const handleFigmaBlur = () => {
    if (project?.figmaDesign !== figmaUrl) {
      saveChanges({ figmaDesign: figmaUrl });
    }
  };

  const handleFileUpload = async (field: DesignField, file: File) => {
    setIsUploading(field);
    try {
      const getBaseName = (filename: string) => {
        const lastDotIdx = filename.lastIndexOf('.');
        return lastDotIdx !== -1 ? filename.substring(0, lastDotIdx) : filename;
      };

      const webpBlob = await convertToWebP(file);
      const originalName = getBaseName(file.name) || 'image';
      const webpFile = new File([webpBlob], `${originalName}.webp`, { type: "image/webp" });

      const formData = new FormData();
      formData.append("file", webpFile);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const { url } = await res.json();
        const currentDesign = project?.design || {};
        const currentItems = currentDesign[field] || [];
        
        const newItem: DiagramItem = {
          id: Date.now().toString() + Math.random().toString(36).substring(7),
          title: originalName || "Untitled Diagram",
          url
        };

        await saveChanges({ design: { ...currentDesign, [field]: [...currentItems, newItem] } });
      } else {
        alert("Upload failed server side.");
      }
    } catch (e) {
      console.error("Upload error:", e);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(null);
    }
  };

  const handleRemoveImage = (field: DesignField, id: string) => {
    if (!confirm("Remove this diagram?")) return;
    const currentDesign = project?.design || {};
    const currentItems = currentDesign[field] || [];
    saveChanges({ design: { ...currentDesign, [field]: currentItems.filter(item => item.id !== id) } });
  };

  const updateImageTitle = (field: DesignField, id: string, newTitle: string) => {
    const currentDesign = project?.design || {};
    const currentItems = currentDesign[field] || [];
    saveChanges({ 
      design: { 
        ...currentDesign, 
        [field]: currentItems.map(item => item.id === id ? { ...item, title: newTitle } : item) 
      } 
    });
  };

  if (!project) return <div className="p-8 text-center text-foreground-muted">Loading project...</div>;

  const design = project.design || {};

  const ImageUploadCard = ({ 
    title, 
    description, 
    field, 
    items = [] 
  }: { 
    title: string, 
    description: string, 
    field: DesignField,
    items?: DiagramItem[]
  }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
      <Card className="bg-background-elevated/40 backdrop-blur-sm border-white/5 overflow-hidden flex flex-col h-full">
        <div className="p-5 border-b border-white/5 bg-white/[0.01]">
          <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
            <PhotoIcon className="w-5 h-5 text-accent" />
            {title}
          </h3>
          <p className="text-sm text-foreground-muted mt-1">{description}</p>
        </div>
        
        <div className="p-6 flex-1 flex flex-col bg-black/10 gap-6">
          {items.length > 0 && (
            <div className="flex overflow-x-auto gap-6 pb-4 snap-x items-stretch custom-scrollbar">
              {items.map(item => (
                <div key={item.id} className="min-w-[320px] w-[320px] flex-shrink-0 snap-center relative group rounded-lg border border-white/10 shadow-2xl bg-black/20 overflow-hidden flex flex-col">
                  <div className="p-3 border-b border-white/10 bg-white/5 flex gap-2">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateImageTitle(field, item.id, e.target.value)}
                      placeholder="Enter diagram title..."
                      className="w-full bg-transparent border-none p-0 focus:ring-0 text-foreground text-sm font-medium"
                    />
                    <button 
                      onClick={() => handleRemoveImage(field, item.id)}
                      className="text-foreground-muted hover:text-red-400 p-1"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="relative w-full flex-1 flex items-center justify-center p-4 group/image">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.url} alt={item.title} className="max-w-full max-h-[300px] object-contain rounded" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center gap-4 rounded">
                      <button 
                        onClick={() => setPreviewImage({ url: item.url, title: item.title })}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-md transition-colors"
                        title="Fullscreen Preview"
                      >
                        <ArrowsPointingOutIcon className="w-5 h-5" />
                      </button>
                      <a 
                        href={item.url} 
                        download={`${item.title}.webp`} 
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-md transition-colors"
                        title="Download Image"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center w-full mt-auto pt-4 border-t border-white/5 border-dashed">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(field, file);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            />
            <Button 
              variant="secondary" 
              className="gap-2 mx-auto"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading === field}
            >
              {isUploading === field ? (
                <span className="animate-pulse flex items-center gap-2">Uploading & Converting...</span>
              ) : (
                <>
                  <ArrowUpTrayIcon className="w-4 h-4" />
                  Add Image
                </>
              )}
            </Button>
            <p className="text-xs text-foreground-muted/60 mt-4">Upload images (will be converted to WebP automatically)</p>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="h-full max-w-7xl mx-auto pb-12 space-y-12">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight text-gradient-hero">System Design</h2>
        <p className="text-foreground-muted mt-1">Upload architectural diagrams and link UI/UX designs.</p>
      </div>

      <div className="flex flex-col gap-6">
        <ImageUploadCard 
          title="Context Diagram" 
          description="High-level overview of the system and its environment."
          field="contextDiagrams"
          items={design.contextDiagrams}
        />
        
        <ImageUploadCard 
          title="Usecase Diagram" 
          description="Actors and their interactions with the system."
          field="usecaseDiagrams"
          items={design.usecaseDiagrams}
        />

        <ImageUploadCard 
          title="Entity Relationship Diagram (ERD)" 
          description="Database schema and data relationships."
          field="erds"
          items={design.erds}
        />

        <RbacMatrix projectId={projectId} />
        
        <ApiDesignTable projectId={projectId} />

        <Card className="bg-background-elevated/40 backdrop-blur-sm border-white/5 overflow-hidden flex flex-col h-full mt-6">
          <div className="p-5 border-b border-white/5 bg-white/[0.01]">
            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-purple-400" />
              UI/UX Design
            </h3>
            <p className="text-sm text-foreground-muted mt-1">Link to Figma or other design files.</p>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center bg-black/10">
            <div className="space-y-4 w-full h-full flex flex-col">
              <div>
                <label className="text-sm font-medium text-foreground-muted mb-2 block">Figma Link</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-4 w-4 text-foreground-muted/50" />
                  </div>
                  <input
                    type="url"
                    value={figmaUrl}
                    onChange={(e) => setFigmaUrl(e.target.value)}
                    onBlur={handleFigmaBlur}
                    placeholder="https://www.figma.com/file/..."
                    className="block w-full pl-10 bg-white/5 border border-white/10 rounded-lg py-2.5 text-foreground text-sm focus:ring-1 focus:ring-accent focus:border-accent transition-colors"
                  />
                </div>
              </div>
              
              {figmaUrl && figmaUrl.includes("figma.com") ? (
                <div className="mt-4 flex-1 min-h-[300px] w-full rounded-lg overflow-hidden border border-white/10 shadow-xl relative bg-[#1E1E1E] flex items-center justify-center">
                  <iframe 
                    style={{ border: "1px solid rgba(0, 0, 0, 0.1)" }}
                    width="100%" 
                    height="100%" 
                    src={`https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(figmaUrl)}`} 
                    allowFullScreen
                    className="absolute inset-0"
                  />
                </div>
              ) : (
                <div className="flex-1 min-h-[200px] border border-white/5 border-dashed rounded-lg flex items-center justify-center text-foreground-muted/50 text-sm">
                  Enter a valid Figma link to preview
                </div>
              )}
            </div>
          </div>
        </Card>

        <TechSpecsTable projectId={projectId} />
      </div>

      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 md:p-8 backdrop-blur-sm transition-all"
          onClick={() => setPreviewImage(null)}
        >
          <div className="absolute top-4 right-4 md:top-6 md:right-6 flex gap-4">
            <a 
              href={previewImage.url} 
              download={`${previewImage.title}.webp`} 
              onClick={(e) => e.stopPropagation()}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 flex items-center gap-2 rounded-lg backdrop-blur-md transition-colors text-sm font-medium"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Download WebP
            </a>
            <button 
              onClick={() => setPreviewImage(null)}
              className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg backdrop-blur-md transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={previewImage.url} 
            alt={previewImage.title} 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" 
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
}
