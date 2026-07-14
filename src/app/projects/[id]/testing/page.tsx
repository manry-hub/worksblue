"use client";

import { use, useEffect, useState } from "react";
import { useProjectStore, type Project } from "@/store/project-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, TrashIcon, BeakerIcon, ListBulletIcon, FolderIcon } from "@heroicons/react/24/outline";

type TestCase = NonNullable<Project['testCases']>[0];
type RequirementItem = { id: string, type: 'FR' | 'NFR', title: string };

function RequirementSelector({ unusedRequirements, onSelect }: { unusedRequirements: RequirementItem[], onSelect: (id: string) => void }) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  
  const filtered = unusedRequirements.filter(req => 
    req.id.toLowerCase().includes(search.toLowerCase()) || 
    req.title.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div className="relative">
      <input 
        type="text"
        placeholder="Search requirement..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => setIsOpen(true)}
        className="w-[350px] bg-black/40 border border-white/10 text-sm focus:ring-1 focus:ring-accent rounded px-3 py-2 text-foreground placeholder:text-white/20"
      />
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full right-0 mt-1 w-[400px] max-h-[300px] overflow-y-auto bg-[#1a1a1a] border border-white/10 rounded-md shadow-2xl z-50">
            <div className="p-1">
              {filtered.length === 0 ? (
                <div className="p-3 text-xs text-foreground-muted text-center">No requirements found</div>
              ) : (
                filtered.map(req => (
                  <button
                    key={req.id}
                    className="w-full text-left p-2 text-sm hover:bg-white/10 rounded flex items-center gap-3 transition-colors"
                    onClick={() => {
                      onSelect(req.id);
                      setIsOpen(false);
                      setSearch("");
                    }}
                  >
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${req.type === 'FR' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                      {req.id}
                    </span>
                    <span className="truncate text-foreground/90">{req.title}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function TestingPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const projectId = params.id;
  const { getProject, updateProject, fetchProjects } = useProjectStore();
  const project = getProject(projectId);

  const [isGrouped, setIsGrouped] = useState(true);
  const [previewCase, setPreviewCase] = useState<TestCase | null>(null);

  useEffect(() => {
    if (!project) {
      fetchProjects();
    }
  }, [project, fetchProjects]);

  if (!project) return <div className="p-8 text-center text-foreground-muted">Loading project...</div>;

  const testCases = project.testCases || [];
  
  // Extract all requirements for grouping
  const allRequirements: RequirementItem[] = [
    ...(project.requirements?.functional || []).map(r => ({ id: r.id, type: 'FR' as const, title: r.requirement })),
    ...(project.requirements?.nonFunctional || []).map(r => ({ id: r.id, type: 'NFR' as const, title: r.requirement }))
  ];

  const saveChanges = async (updates: Partial<Project>) => {
    await updateProject(projectId, updates);
  };

  const addTestCase = (requirementId?: string) => {
    const nextNum = testCases.length + 1;
    const newId = `TC-${Date.now().toString().substring(7)}`;
    const newCase: TestCase = {
      id: newId,
      requirementId,
      testCaseId: `TC-${String(nextNum).padStart(3, '0')}`,
      testSteps: "",
      inputData: "",
      expectedResult: "",
      actualResult: "",
      executionStatus: "Pending",
      notes: ""
    };
    saveChanges({ testCases: [...testCases, newCase] });
  };

  const updateTestCase = <K extends keyof TestCase>(id: string, field: K, value: TestCase[K]) => {
    const updated = testCases.map(tc => tc.id === id ? { ...tc, [field]: value } : tc);
    saveChanges({ testCases: updated });
  };

  const removeTestCase = (id: string) => {
    const updated = testCases.filter(tc => tc.id !== id);
    saveChanges({ testCases: updated });
  };

  const handleTextareaResize = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  const renderTable = (groupId?: string, items: TestCase[] = []) => {
    if (items.length === 0 && !groupId && isGrouped) return null;

    return (
      <div className="overflow-x-auto rounded-lg border border-white/5 mt-4">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/5 text-foreground-muted border-b border-white/5">
            <tr>
              <th className="px-3 py-3 font-medium w-24">Test Case ID</th>
              <th className="px-3 py-3 font-medium min-w-[200px]">Test Steps</th>
              <th className="px-3 py-3 font-medium min-w-[150px]">Input Data</th>
              <th className="px-3 py-3 font-medium min-w-[150px]">Expected Res</th>
              <th className="px-3 py-3 font-medium min-w-[150px]">Actual Res</th>
              <th className="px-3 py-3 font-medium w-36">Execution Status</th>
              <th className="px-3 py-3 font-medium min-w-[150px]">Notes</th>
              <th className="px-3 py-3 font-medium w-20 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.map(item => (
              <tr key={item.id} className="bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <td className="p-2 align-top">
                  <input
                    type="text"
                    value={item.testCaseId}
                    onChange={(e) => updateTestCase(item.id, 'testCaseId', e.target.value)}
                    placeholder="TC-001"
                    className="w-full bg-transparent border-none text-foreground font-mono text-xs focus:ring-1 focus:ring-accent rounded px-2 py-1.5"
                  />
                </td>
                <td className="p-2 align-top">
                  <textarea
                    value={item.testSteps}
                    onChange={(e) => updateTestCase(item.id, 'testSteps', e.target.value)}
                    onInput={handleTextareaResize}
                    placeholder="1. Go to login..."
                    className="w-full bg-transparent border-none text-foreground text-sm focus:ring-1 focus:ring-accent rounded px-2 py-1.5 resize-none overflow-hidden min-h-[38px] custom-scrollbar"
                  />
                </td>
                <td className="p-2 align-top">
                  <textarea
                    value={item.inputData}
                    onChange={(e) => updateTestCase(item.id, 'inputData', e.target.value)}
                    onInput={handleTextareaResize}
                    placeholder="user / pass"
                    className="w-full bg-transparent border-none text-foreground text-sm focus:ring-1 focus:ring-accent rounded px-2 py-1.5 resize-none overflow-hidden min-h-[38px] custom-scrollbar"
                  />
                </td>
                <td className="p-2 align-top">
                  <textarea
                    value={item.expectedResult}
                    onChange={(e) => updateTestCase(item.id, 'expectedResult', e.target.value)}
                    onInput={handleTextareaResize}
                    placeholder="Login success"
                    className="w-full bg-transparent border-none text-foreground text-sm focus:ring-1 focus:ring-accent rounded px-2 py-1.5 resize-none overflow-hidden min-h-[38px] custom-scrollbar"
                  />
                </td>
                <td className="p-2 align-top">
                  <textarea
                    value={item.actualResult}
                    onChange={(e) => updateTestCase(item.id, 'actualResult', e.target.value)}
                    onInput={handleTextareaResize}
                    placeholder="Actual outcome"
                    className="w-full bg-transparent border-none text-foreground text-sm focus:ring-1 focus:ring-accent rounded px-2 py-1.5 resize-none overflow-hidden min-h-[38px] custom-scrollbar"
                  />
                </td>
                <td className="p-2 align-top">
                  <select
                    value={item.executionStatus}
                    onChange={(e) => updateTestCase(item.id, 'executionStatus', e.target.value as TestCase['executionStatus'])}
                    className={`w-full bg-white/5 border border-white/10 text-xs focus:ring-1 focus:ring-accent rounded px-2 py-2 appearance-none font-medium ${
                      item.executionStatus === 'Passed' ? 'text-green-400' :
                      item.executionStatus === 'Failed' ? 'text-red-400' :
                      'text-yellow-400'
                    }`}
                  >
                    <option value="Pending" className="bg-[#1e1e1e] text-yellow-400">Pending</option>
                    <option value="Passed" className="bg-[#1e1e1e] text-green-400">Passed</option>
                    <option value="Failed" className="bg-[#1e1e1e] text-red-400">Failed</option>
                  </select>
                </td>
                <td className="p-2 align-top">
                  <textarea
                    value={item.notes}
                    onChange={(e) => updateTestCase(item.id, 'notes', e.target.value)}
                    onInput={handleTextareaResize}
                    placeholder="Any notes..."
                    className="w-full bg-transparent border-none text-foreground text-sm focus:ring-1 focus:ring-accent rounded px-2 py-1.5 resize-none overflow-hidden min-h-[38px] custom-scrollbar"
                  />
                </td>
                <td className="p-2 align-top text-center pt-3 flex items-center justify-center gap-1">
                  <button 
                    onClick={() => setPreviewCase(item)}
                    className="text-foreground-muted hover:text-accent p-1.5 rounded hover:bg-white/5 transition-colors"
                    title="Preview Case"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => removeTestCase(item.id)}
                    className="text-foreground-muted hover:text-red-400 p-1.5 rounded hover:bg-white/5 transition-colors"
                    title="Delete Case"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-foreground-muted/50 text-sm">
                  No test cases added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="p-2 bg-white/[0.02] border-t border-white/5">
          <Button variant="ghost" size="sm" onClick={() => addTestCase(groupId)} className="w-full text-xs text-foreground-muted hover:text-foreground">
            <PlusIcon className="w-3.5 h-3.5 mr-1.5" />
            Add Test Case
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full max-w-7xl mx-auto pb-12 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-gradient-hero">Testing & Quality Assurance</h2>
          <p className="text-foreground-muted mt-2">Manage test cases, execution status, and bug fixing tracking.</p>
        </div>
      </div>

      <Card className="bg-background-elevated/40 backdrop-blur-sm border-white/5 overflow-hidden flex flex-col">
        <div className="p-5 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
              <BeakerIcon className="w-5 h-5 text-purple-400" />
              Test Cases Tracker
            </h3>
            <p className="text-sm text-foreground-muted mt-1">Design test steps and log execution results.</p>
          </div>
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setIsGrouped(true)}
              className={`px-3 py-1.5 text-xs font-medium rounded flex items-center gap-2 transition-colors ${isGrouped ? "bg-white/10 text-foreground shadow-sm" : "text-foreground-muted hover:text-foreground hover:bg-white/5"}`}
            >
              <FolderIcon className="w-3.5 h-3.5" />
              Grouped
            </button>
            <button
              onClick={() => setIsGrouped(false)}
              className={`px-3 py-1.5 text-xs font-medium rounded flex items-center gap-2 transition-colors ${!isGrouped ? "bg-white/10 text-foreground shadow-sm" : "text-foreground-muted hover:text-foreground hover:bg-white/5"}`}
            >
              <ListBulletIcon className="w-3.5 h-3.5" />
              Ungrouped
            </button>
          </div>
        </div>
        
        <div className="p-6 bg-black/10 space-y-8">
          {isGrouped ? (
            <>
              {allRequirements.length === 0 && (
                <div className="text-center py-8 text-foreground-muted text-sm border border-dashed border-white/10 rounded-lg">
                  No Functional or Non-Functional requirements defined in the Requirements phase.
                </div>
              )}
              
              {(() => {
                const usedReqIds = new Set(testCases.map(tc => tc.requirementId).filter(Boolean));
                const usedRequirements = allRequirements.filter(req => usedReqIds.has(req.id));
                const unusedRequirements = allRequirements.filter(req => !usedReqIds.has(req.id));

                return (
                  <>
                    {usedRequirements.map(req => {
                      const reqTestCases = testCases.filter(tc => tc.requirementId === req.id);
                      return (
                        <div key={req.id} className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className={`px-2 py-0.5 text-xs font-bold rounded ${req.type === 'FR' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                              {req.id}
                            </div>
                            <h4 className="text-sm font-medium text-foreground">{req.title}</h4>
                          </div>
                          {renderTable(req.id, reqTestCases)}
                        </div>
                      );
                    })}

                    {unusedRequirements.length > 0 && (
                      <div className="mt-8 border-t border-white/5 pt-6 flex items-center justify-between bg-white/[0.02] p-4 rounded-lg relative">
                        <div className="text-sm text-foreground-muted">Start testing a new requirement:</div>
                        <RequirementSelector 
                          unusedRequirements={unusedRequirements}
                          onSelect={addTestCase}
                        />
                      </div>
                    )}
                  </>
                );
              })()}
              
              {/* Ungrouped Test Cases */}
              {testCases.filter(tc => !tc.requirementId).length > 0 && (
                <div className="space-y-3 pt-6 border-t border-white/5 mt-8">
                  <h4 className="text-sm font-medium text-foreground-muted flex items-center gap-2">
                    Ungrouped Test Cases
                  </h4>
                  {renderTable(undefined, testCases.filter(tc => !tc.requirementId))}
                </div>
              )}
            </>
          ) : (
            // Flat List View
            renderTable(undefined, testCases)
          )}
        </div>
      </Card>

      {/* Preview Modal */}
      {previewCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f0f11] border border-white/10 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-foreground flex items-center gap-3">
                <BeakerIcon className="w-6 h-6 text-accent" />
                Preview: {previewCase.testCaseId || "Untitled Case"}
              </h3>
              <button 
                onClick={() => setPreviewCase(null)}
                className="p-2 rounded-lg hover:bg-white/10 text-foreground-muted hover:text-foreground transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {previewCase.requirementId && (
                <div>
                  <div className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1">Requirement Link</div>
                  <div className="bg-white/5 px-3 py-2 rounded border border-white/5 text-sm">
                    {allRequirements.find(r => r.id === previewCase.requirementId)?.title || previewCase.requirementId}
                  </div>
                </div>
              )}
              
              <div>
                <div className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1">Test Steps</div>
                <div className="bg-white/5 px-3 py-2 rounded border border-white/5 text-sm whitespace-pre-wrap min-h-[60px]">
                  {previewCase.testSteps || <span className="text-white/20 italic">No steps defined</span>}
                </div>
              </div>
              
              <div>
                <div className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1">Input Data</div>
                <div className="bg-white/5 px-3 py-2 rounded border border-white/5 text-sm whitespace-pre-wrap">
                  {previewCase.inputData || <span className="text-white/20 italic">None</span>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1">Expected Result</div>
                  <div className="bg-white/5 px-3 py-2 rounded border border-white/5 text-sm whitespace-pre-wrap">
                    {previewCase.expectedResult || <span className="text-white/20 italic">None</span>}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1">Actual Result</div>
                  <div className="bg-white/5 px-3 py-2 rounded border border-white/5 text-sm whitespace-pre-wrap">
                    {previewCase.actualResult || <span className="text-white/20 italic">None</span>}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1">Status</div>
                  <div className={`px-3 py-2 rounded font-medium border inline-flex text-sm ${
                    previewCase.executionStatus === 'Passed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    previewCase.executionStatus === 'Failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                  }`}>
                    {previewCase.executionStatus}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1">Notes</div>
                  <div className="bg-white/5 px-3 py-2 rounded border border-white/5 text-sm whitespace-pre-wrap">
                    {previewCase.notes || <span className="text-white/20 italic">None</span>}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-5 border-t border-white/10 bg-black/20 flex justify-end">
              <Button onClick={() => setPreviewCase(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
