"use client";

import { use, useEffect, useState } from "react";
import { useProjectStore, type Project } from "@/store/project-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, TrashIcon, ShieldCheckIcon, ListBulletIcon, XMarkIcon, FolderPlusIcon, InformationCircleIcon, LinkIcon } from "@heroicons/react/24/outline";

type FunctionalGroup = NonNullable<NonNullable<Project['requirements']>['functionalGroups']>[0];
type FunctionalReq = NonNullable<Project['requirements']>['functional'][0];
type NonFunctionalGroup = NonNullable<NonNullable<Project['requirements']>['nonFunctionalGroups']>[0];
type NonFunctionalReq = NonNullable<Project['requirements']>['nonFunctional'][0];
type ExternalInterfaceGroup = NonNullable<NonNullable<Project['requirements']>['externalInterfaceGroups']>[0];
type ExternalInterfaceReq = NonNullable<Project['requirements']>['externalInterface'][0];

export default function RequirementsPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const projectId = params.id;
  const { getProject, updateProject, fetchProjects } = useProjectStore();
  const project = getProject(projectId);

  const [functionalGroups, setFunctionalGroups] = useState<FunctionalGroup[]>([]);
  const [functional, setFunctional] = useState<FunctionalReq[]>([]);
  const [nonFunctionalGroups, setNonFunctionalGroups] = useState<NonFunctionalGroup[]>([]);
  const [nonFunctional, setNonFunctional] = useState<NonFunctionalReq[]>([]);
  const [externalInterfaceGroups, setExternalInterfaceGroups] = useState<ExternalInterfaceGroup[]>([]);
  const [externalInterface, setExternalInterface] = useState<ExternalInterfaceReq[]>([]);
  
  const [detailModal, setDetailModal] = useState<{ type: 'functional' | 'nonFunctional' | 'externalInterface'; id: string } | null>(null);

  useEffect(() => {
    if (!project) {
      fetchProjects();
    } else {
      setFunctionalGroups(project.requirements?.functionalGroups || []);
      setFunctional(project.requirements?.functional || []);
      setNonFunctionalGroups(project.requirements?.nonFunctionalGroups || []);
      setNonFunctional(project.requirements?.nonFunctional || []);
      setExternalInterfaceGroups(project.requirements?.externalInterfaceGroups || []);
      setExternalInterface(project.requirements?.externalInterface || []);
    }
  }, [project, fetchProjects]);

  const saveChanges = async (updates: Partial<NonNullable<Project['requirements']>>) => {
    if (!project) return;
    const currentReqs = project.requirements || { 
      functionalGroups: [], functional: [], 
      nonFunctionalGroups: [], nonFunctional: [], 
      externalInterfaceGroups: [], externalInterface: [] 
    };
    const newReqs = { ...currentReqs, ...updates };
    await updateProject(projectId, { requirements: newReqs });
  };

  // --- Functional Requirements ---
  const addGroup = () => {
    const nextCharCode = functionalGroups.length > 0 
      ? functionalGroups[functionalGroups.length - 1].id.charCodeAt(0) + 1 
      : 65; // 'A'
    const newGroupId = String.fromCharCode(nextCharCode);
    const updated = [...functionalGroups, { id: newGroupId, name: `New Group ${newGroupId}` }];
    setFunctionalGroups(updated);
    saveChanges({ functionalGroups: updated });
  };

  const updateGroupName = (groupId: string, name: string) => {
    const updated = functionalGroups.map(g => g.id === groupId ? { ...g, name } : g);
    setFunctionalGroups(updated);
    saveChanges({ functionalGroups: updated });
  };

  const removeGroup = (groupId: string) => {
    if (!confirm("Are you sure you want to remove this group and all its requirements?")) return;
    const updatedGroups = functionalGroups.filter(g => g.id !== groupId);
    const updatedFunctional = functional.filter(f => f.groupId !== groupId);
    setFunctionalGroups(updatedGroups);
    setFunctional(updatedFunctional);
    saveChanges({ functionalGroups: updatedGroups, functional: updatedFunctional });
  };

  const addFunctionalReq = (groupId?: string) => {
    const groupReqs = functional.filter(r => r.groupId === groupId);
    
    let newId = "";
    if (groupId) {
      const nextNum = groupReqs.length > 0 
        ? Math.max(...groupReqs.map(r => parseInt(r.id.split('-').pop() || "0"))) + 1 
        : 1;
      newId = `FR-${groupId}-${nextNum.toString().padStart(3, '0')}`;
    } else {
      const ungrouped = functional.filter(r => !r.groupId);
      const nextNum = ungrouped.length > 0 
        ? Math.max(...ungrouped.map(r => parseInt(r.id.split('-').pop() || "0"))) + 1 
        : 1;
      newId = `FR-${nextNum.toString().padStart(2, '0')}`;
    }
    
    const newReq: FunctionalReq = { id: newId, groupId, requirement: "" };
    const updated = [...functional, newReq];
    setFunctional(updated);
    saveChanges({ functional: updated });
  };

  const updateFunctionalReq = (id: string, field: string, value: string) => {
    const updated = functional.map(req => req.id === id ? { ...req, [field]: value } : req);
    setFunctional(updated);
    saveChanges({ functional: updated });
  };

  const removeFunctionalReq = (id: string) => {
    const updated = functional.filter(r => r.id !== id);
    setFunctional(updated);
    saveChanges({ functional: updated });
  };

  // --- Non-Functional Requirements ---
  const addNFRGroup = () => {
    const nextCharCode = nonFunctionalGroups.length > 0 
      ? nonFunctionalGroups[nonFunctionalGroups.length - 1].id.charCodeAt(0) + 1 
      : 65; // 'A'
    const newGroupId = String.fromCharCode(nextCharCode);
    const updated = [...nonFunctionalGroups, { id: newGroupId, name: `New Category ${newGroupId}` }];
    setNonFunctionalGroups(updated);
    saveChanges({ nonFunctionalGroups: updated });
  };

  const updateNFRGroupName = (groupId: string, name: string) => {
    const updated = nonFunctionalGroups.map(g => g.id === groupId ? { ...g, name } : g);
    setNonFunctionalGroups(updated);
    saveChanges({ nonFunctionalGroups: updated });
  };

  const removeNFRGroup = (groupId: string) => {
    if (!confirm("Are you sure you want to remove this category and all its requirements?")) return;
    const updatedGroups = nonFunctionalGroups.filter(g => g.id !== groupId);
    const updatedReqs = nonFunctional.filter(f => f.groupId !== groupId);
    setNonFunctionalGroups(updatedGroups);
    setNonFunctional(updatedReqs);
    saveChanges({ nonFunctionalGroups: updatedGroups, nonFunctional: updatedReqs });
  };

  const addNonFunctionalReq = (groupId?: string) => {
    const groupReqs = nonFunctional.filter(r => r.groupId === groupId);
    
    let newId = "";
    if (groupId) {
      const nextNum = groupReqs.length > 0 
        ? Math.max(...groupReqs.map(r => parseInt(r.id.split('-').pop() || "0"))) + 1 
        : 1;
      newId = `NFR-${groupId}-${nextNum.toString().padStart(3, '0')}`;
    } else {
      const ungrouped = nonFunctional.filter(r => !r.groupId);
      const nextNum = ungrouped.length > 0 
        ? Math.max(...ungrouped.map(r => parseInt(r.id.split('-').pop() || "0"))) + 1 
        : 1;
      newId = `NFR-${nextNum.toString().padStart(2, '0')}`;
    }
    
    const newReq: NonFunctionalReq = { id: newId, groupId, requirement: "" };
    const updated = [...nonFunctional, newReq];
    setNonFunctional(updated);
    saveChanges({ nonFunctional: updated });
  };

  const updateNonFunctionalReq = (id: string, field: string, value: string) => {
    const updated = nonFunctional.map(req => req.id === id ? { ...req, [field]: value } : req);
    setNonFunctional(updated);
    saveChanges({ nonFunctional: updated });
  };

  const removeNonFunctionalReq = (id: string) => {
    const updated = nonFunctional.filter(r => r.id !== id);
    setNonFunctional(updated);
    saveChanges({ nonFunctional: updated });
  };

  // --- External Interface Requirements ---
  const addEIRGroup = () => {
    const nextCharCode = externalInterfaceGroups.length > 0 
      ? externalInterfaceGroups[externalInterfaceGroups.length - 1].id.charCodeAt(0) + 1 
      : 65; // 'A'
    const newGroupId = String.fromCharCode(nextCharCode);
    const updated = [...externalInterfaceGroups, { id: newGroupId, name: `New Interface Category ${newGroupId}` }];
    setExternalInterfaceGroups(updated);
    saveChanges({ externalInterfaceGroups: updated });
  };

  const updateEIRGroupName = (groupId: string, name: string) => {
    const updated = externalInterfaceGroups.map(g => g.id === groupId ? { ...g, name } : g);
    setExternalInterfaceGroups(updated);
    saveChanges({ externalInterfaceGroups: updated });
  };

  const removeEIRGroup = (groupId: string) => {
    if (!confirm("Are you sure you want to remove this category and all its requirements?")) return;
    const updatedGroups = externalInterfaceGroups.filter(g => g.id !== groupId);
    const updatedReqs = externalInterface.filter(f => f.groupId !== groupId);
    setExternalInterfaceGroups(updatedGroups);
    setExternalInterface(updatedReqs);
    saveChanges({ externalInterfaceGroups: updatedGroups, externalInterface: updatedReqs });
  };

  const addExternalInterfaceReq = (groupId?: string) => {
    const groupReqs = externalInterface.filter(r => r.groupId === groupId);
    
    let newId = "";
    if (groupId) {
      const nextNum = groupReqs.length > 0 
        ? Math.max(...groupReqs.map(r => parseInt(r.id.split('-').pop() || "0"))) + 1 
        : 1;
      newId = `EIR-${groupId}-${nextNum.toString().padStart(3, '0')}`;
    } else {
      const ungrouped = externalInterface.filter(r => !r.groupId);
      const nextNum = ungrouped.length > 0 
        ? Math.max(...ungrouped.map(r => parseInt(r.id.split('-').pop() || "0"))) + 1 
        : 1;
      newId = `EIR-${nextNum.toString().padStart(2, '0')}`;
    }
    
    const newReq: ExternalInterfaceReq = { id: newId, groupId, requirement: "" };
    const updated = [...externalInterface, newReq];
    setExternalInterface(updated);
    saveChanges({ externalInterface: updated });
  };

  const updateExternalInterfaceReq = (id: string, field: string, value: string) => {
    const updated = externalInterface.map(req => req.id === id ? { ...req, [field]: value } : req);
    setExternalInterface(updated);
    saveChanges({ externalInterface: updated });
  };

  const removeExternalInterfaceReq = (id: string) => {
    const updated = externalInterface.filter(r => r.id !== id);
    setExternalInterface(updated);
    saveChanges({ externalInterface: updated });
  };

  if (!project) return <div className="p-8 text-center text-foreground-muted">Loading project...</div>;

  const activeReq = detailModal ? 
    (detailModal.type === 'functional' ? functional.find(f => f.id === detailModal.id) :
     detailModal.type === 'nonFunctional' ? nonFunctional.find(f => f.id === detailModal.id) :
     externalInterface.find(f => f.id === detailModal.id)) 
    : null;

  return (
    <div className="h-full max-w-8xl mx-auto pb-12 space-y-12">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight text-gradient-hero">Requirements</h2>
        <p className="text-foreground-muted mt-1">Define functional features, system constraints, and interface specifications.</p>
      </div>

      {/* Functional Requirements */}
      <Card className="bg-background-elevated/40 backdrop-blur-sm border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <ListBulletIcon className="w-6 h-6 text-accent" />
            <div>
              <h3 className="text-lg font-medium text-foreground">Functional Requirements</h3>
              <p className="text-sm text-foreground-muted">Features grouped by modules.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => addFunctionalReq()} variant="ghost" size="sm" className="gap-1 text-foreground-muted hover:text-foreground">
              <PlusIcon className="w-4 h-4" /> Ungrouped Row
            </Button>
            <Button onClick={addGroup} variant="secondary" size="sm" className="gap-1">
              <FolderPlusIcon className="w-4 h-4" /> Add Group
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/20 border-b border-white/5 text-foreground-muted">
              <tr>
                <th className="px-4 py-3 font-medium whitespace-nowrap w-32">ID</th>
                <th className="px-4 py-3 font-medium min-w-[200px]">Requirement</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            
            {functionalGroups.length === 0 && functional.length === 0 && (
              <tbody>
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-foreground-muted italic">
                    No functional requirements defined yet. Add a group to get started.
                  </td>
                </tr>
              </tbody>
            )}

            {functionalGroups.map(group => {
              const groupReqs = functional.filter(f => f.groupId === group.id);
              return (
                <tbody key={group.id} className="divide-y divide-white/5">
                  <tr className="bg-white/[0.03] border-t border-white/10 group/header">
                    <td colSpan={2} className="px-4 py-2 font-medium">
                      <input 
                        type="text" 
                        value={group.name}
                        onChange={(e) => updateGroupName(group.id, e.target.value)}
                        className="bg-transparent border-none p-0 focus:ring-0 text-accent font-semibold w-full"
                        placeholder="Group Name"
                      />
                    </td>
                    <td className="px-4 py-2 text-right whitespace-nowrap">
                      <Button onClick={() => addFunctionalReq(group.id)} variant="ghost" size="sm" className="h-7 text-xs gap-1 text-foreground-muted hover:text-foreground mr-2">
                        <PlusIcon className="w-3 h-3" /> Row
                      </Button>
                      <button onClick={() => removeGroup(group.id)} className="text-foreground-muted hover:text-red-400 opacity-0 group-hover/header:opacity-100 transition-opacity p-1 align-middle">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  
                  {groupReqs.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-4 text-center text-foreground-muted/50 italic text-xs">
                        No rows in this group.
                      </td>
                    </tr>
                  )}

                  {groupReqs.map(req => (
                    <tr key={req.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-4 py-3 font-mono text-xs text-foreground-muted pl-6">{req.id}</td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={req.requirement}
                          onChange={(e) => updateFunctionalReq(req.id, 'requirement', e.target.value)}
                          placeholder="e.g. User can login"
                          className="w-full bg-transparent border-none p-0 focus:ring-0 text-foreground text-sm placeholder:text-foreground-muted/50"
                        />
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button onClick={() => setDetailModal({ type: 'functional', id: req.id })} className="text-foreground-muted hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity p-1 mr-1">
                          <InformationCircleIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => removeFunctionalReq(req.id)} className="text-foreground-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              );
            })}

            {/* Render ungrouped items */}
            {functional.filter(f => !f.groupId).length > 0 && (
              <tbody className="divide-y divide-white/5 border-t border-white/10">
                <tr className="bg-white/[0.01]">
                  <td colSpan={3} className="px-4 py-2 font-medium text-foreground-muted text-xs uppercase tracking-wider">
                    Ungrouped
                  </td>
                </tr>
                {functional.filter(f => !f.groupId).map(req => (
                  <tr key={req.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 py-3 font-mono text-xs text-foreground-muted">{req.id}</td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={req.requirement}
                        onChange={(e) => updateFunctionalReq(req.id, 'requirement', e.target.value)}
                        placeholder="e.g. User can login"
                        className="w-full bg-transparent border-none p-0 focus:ring-0 text-foreground text-sm placeholder:text-foreground-muted/50"
                      />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => setDetailModal({ type: 'functional', id: req.id })} className="text-foreground-muted hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity p-1 mr-1">
                        <InformationCircleIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => removeFunctionalReq(req.id)} className="text-foreground-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </Card>

      {/* Non-Functional Requirements */}
      <Card className="bg-background-elevated/40 backdrop-blur-sm border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className="w-6 h-6 text-purple-400" />
            <div>
              <h3 className="text-lg font-medium text-foreground">Non-Functional Requirements</h3>
              <p className="text-sm text-foreground-muted">Performance Requirements, Security Requirements, Reliability and Availability, Usability and Accessibility, Maintainability and Portability, Operational Requirements</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => addNonFunctionalReq()} variant="ghost" size="sm" className="gap-1 text-foreground-muted hover:text-foreground">
              <PlusIcon className="w-4 h-4" /> Ungrouped Row
            </Button>
            <Button onClick={addNFRGroup} variant="secondary" size="sm" className="gap-1">
              <FolderPlusIcon className="w-4 h-4" /> Add Group
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/20 border-b border-white/5 text-foreground-muted">
              <tr>
                <th className="px-4 py-3 font-medium whitespace-nowrap w-32">ID</th>
                <th className="px-4 py-3 font-medium min-w-[200px]">Requirement</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            
            {nonFunctionalGroups.length === 0 && nonFunctional.length === 0 && (
              <tbody>
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-foreground-muted italic">
                    No non-functional requirements defined yet.
                  </td>
                </tr>
              </tbody>
            )}

            {nonFunctionalGroups.map(group => {
              const groupReqs = nonFunctional.filter(f => f.groupId === group.id);
              return (
                <tbody key={group.id} className="divide-y divide-white/5">
                  <tr className="bg-white/[0.03] border-t border-white/10 group/header">
                    <td colSpan={2} className="px-4 py-2 font-medium">
                      <input 
                        type="text" 
                        value={group.name}
                        onChange={(e) => updateNFRGroupName(group.id, e.target.value)}
                        className="bg-transparent border-none p-0 focus:ring-0 text-purple-400 font-semibold w-full"
                        placeholder="Category Name (e.g. Performance)"
                      />
                    </td>
                    <td className="px-4 py-2 text-right whitespace-nowrap">
                      <Button onClick={() => addNonFunctionalReq(group.id)} variant="ghost" size="sm" className="h-7 text-xs gap-1 text-foreground-muted hover:text-foreground mr-2">
                        <PlusIcon className="w-3 h-3" /> Row
                      </Button>
                      <button onClick={() => removeNFRGroup(group.id)} className="text-foreground-muted hover:text-red-400 opacity-0 group-hover/header:opacity-100 transition-opacity p-1 align-middle">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  
                  {groupReqs.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-4 text-center text-foreground-muted/50 italic text-xs">
                        No rows in this category.
                      </td>
                    </tr>
                  )}

                  {groupReqs.map(req => (
                    <tr key={req.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-4 py-3 font-mono text-xs text-foreground-muted pl-6">{req.id}</td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={req.requirement}
                          onChange={(e) => updateNonFunctionalReq(req.id, 'requirement', e.target.value)}
                          placeholder="e.g. Response time < 3s"
                          className="w-full bg-transparent border-none p-0 focus:ring-0 text-foreground text-sm placeholder:text-foreground-muted/50"
                        />
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button onClick={() => setDetailModal({ type: 'nonFunctional', id: req.id })} className="text-foreground-muted hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity p-1 mr-1">
                          <InformationCircleIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => removeNonFunctionalReq(req.id)} className="text-foreground-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              );
            })}

            {/* Render ungrouped items */}
            {nonFunctional.filter(f => !f.groupId).length > 0 && (
              <tbody className="divide-y divide-white/5 border-t border-white/10">
                <tr className="bg-white/[0.01]">
                  <td colSpan={3} className="px-4 py-2 font-medium text-foreground-muted text-xs uppercase tracking-wider">
                    Ungrouped
                  </td>
                </tr>
                {nonFunctional.filter(f => !f.groupId).map(req => (
                  <tr key={req.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 py-3 font-mono text-xs text-foreground-muted">{req.id}</td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={req.requirement}
                        onChange={(e) => updateNonFunctionalReq(req.id, 'requirement', e.target.value)}
                        placeholder="e.g. Response time < 3s"
                        className="w-full bg-transparent border-none p-0 focus:ring-0 text-foreground text-sm placeholder:text-foreground-muted/50"
                      />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => setDetailModal({ type: 'nonFunctional', id: req.id })} className="text-foreground-muted hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity p-1 mr-1">
                        <InformationCircleIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => removeNonFunctionalReq(req.id)} className="text-foreground-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </Card>

      {/* External Interface Requirements */}
      <Card className="bg-background-elevated/40 backdrop-blur-sm border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <LinkIcon className="w-6 h-6 text-sky-400" />
            <div>
              <h3 className="text-lg font-medium text-foreground">External Interface Requirements</h3>
              <p className="text-sm text-foreground-muted">User, hardware, software, and communication interfaces.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => addExternalInterfaceReq()} variant="ghost" size="sm" className="gap-1 text-foreground-muted hover:text-foreground">
              <PlusIcon className="w-4 h-4" /> Ungrouped Row
            </Button>
            <Button onClick={addEIRGroup} variant="secondary" size="sm" className="gap-1">
              <FolderPlusIcon className="w-4 h-4" /> Add Group
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/20 border-b border-white/5 text-foreground-muted">
              <tr>
                <th className="px-4 py-3 font-medium whitespace-nowrap w-32">ID</th>
                <th className="px-4 py-3 font-medium min-w-[200px]">Requirement</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            
            {externalInterfaceGroups.length === 0 && externalInterface.length === 0 && (
              <tbody>
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-foreground-muted italic">
                    No external interface requirements defined yet.
                  </td>
                </tr>
              </tbody>
            )}

            {externalInterfaceGroups.map(group => {
              const groupReqs = externalInterface.filter(f => f.groupId === group.id);
              return (
                <tbody key={group.id} className="divide-y divide-white/5">
                  <tr className="bg-white/[0.03] border-t border-white/10 group/header">
                    <td colSpan={2} className="px-4 py-2 font-medium">
                      <input 
                        type="text" 
                        value={group.name}
                        onChange={(e) => updateEIRGroupName(group.id, e.target.value)}
                        className="bg-transparent border-none p-0 focus:ring-0 text-sky-400 font-semibold w-full"
                        placeholder="Category Name"
                      />
                    </td>
                    <td className="px-4 py-2 text-right whitespace-nowrap">
                      <Button onClick={() => addExternalInterfaceReq(group.id)} variant="ghost" size="sm" className="h-7 text-xs gap-1 text-foreground-muted hover:text-foreground mr-2">
                        <PlusIcon className="w-3 h-3" /> Row
                      </Button>
                      <button onClick={() => removeEIRGroup(group.id)} className="text-foreground-muted hover:text-red-400 opacity-0 group-hover/header:opacity-100 transition-opacity p-1 align-middle">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  
                  {groupReqs.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-4 text-center text-foreground-muted/50 italic text-xs">
                        No rows in this category.
                      </td>
                    </tr>
                  )}

                  {groupReqs.map(req => (
                    <tr key={req.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-4 py-3 font-mono text-xs text-foreground-muted pl-6">{req.id}</td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={req.requirement}
                          onChange={(e) => updateExternalInterfaceReq(req.id, 'requirement', e.target.value)}
                          placeholder="e.g. API Integration with Stripe"
                          className="w-full bg-transparent border-none p-0 focus:ring-0 text-foreground text-sm placeholder:text-foreground-muted/50"
                        />
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button onClick={() => setDetailModal({ type: 'externalInterface', id: req.id })} className="text-foreground-muted hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity p-1 mr-1">
                          <InformationCircleIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => removeExternalInterfaceReq(req.id)} className="text-foreground-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              );
            })}

            {/* Render ungrouped items */}
            {externalInterface.filter(f => !f.groupId).length > 0 && (
              <tbody className="divide-y divide-white/5 border-t border-white/10">
                <tr className="bg-white/[0.01]">
                  <td colSpan={3} className="px-4 py-2 font-medium text-foreground-muted text-xs uppercase tracking-wider">
                    Ungrouped
                  </td>
                </tr>
                {externalInterface.filter(f => !f.groupId).map(req => (
                  <tr key={req.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 py-3 font-mono text-xs text-foreground-muted">{req.id}</td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={req.requirement}
                        onChange={(e) => updateExternalInterfaceReq(req.id, 'requirement', e.target.value)}
                        placeholder="e.g. API Integration with Stripe"
                        className="w-full bg-transparent border-none p-0 focus:ring-0 text-foreground text-sm placeholder:text-foreground-muted/50"
                      />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => setDetailModal({ type: 'externalInterface', id: req.id })} className="text-foreground-muted hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity p-1 mr-1">
                        <InformationCircleIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => removeExternalInterfaceReq(req.id)} className="text-foreground-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </Card>

      {/* Details Modal */}
      {detailModal && activeReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background border border-white/10 rounded-xl p-6 w-full max-w-lg shadow-2xl relative">
            <button onClick={() => setDetailModal(null)} className="absolute top-4 right-4 text-foreground-muted hover:text-foreground transition-colors p-1">
              <XMarkIcon className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-semibold mb-6 text-gradient-hero flex items-center gap-2">
              <InformationCircleIcon className="w-6 h-6 text-accent" />
              Requirement Details
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="text-xs text-foreground-muted font-medium mb-1 block uppercase tracking-wider">ID</label>
                <div className="font-mono text-foreground bg-white/5 inline-block px-2 py-1 rounded text-sm">{activeReq.id}</div>
              </div>
              
              <div>
                <label className="text-xs text-foreground-muted font-medium mb-1 block uppercase tracking-wider">Title / Brief</label>
                <div className="text-foreground font-medium">
                  {activeReq.requirement}
                </div>
              </div>

              <div>
                <label className="text-xs text-foreground-muted font-medium mb-1 block uppercase tracking-wider">Extended Description</label>
                <textarea 
                  value={activeReq.description || ""}
                  onChange={(e) => {
                    if (detailModal.type === 'functional') updateFunctionalReq(activeReq.id, 'description', e.target.value);
                    else if (detailModal.type === 'nonFunctional') updateNonFunctionalReq(activeReq.id, 'description', e.target.value);
                    else updateExternalInterfaceReq(activeReq.id, 'description', e.target.value);
                  }}
                  placeholder="Add more details, acceptance criteria, or notes about this requirement..."
                  className="w-full bg-white/[0.02] border border-white/10 rounded-lg p-3 text-sm text-foreground focus:ring-1 focus:ring-accent min-h-[150px] resize-y focus:outline-none"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setDetailModal(null)} variant="primary">
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
