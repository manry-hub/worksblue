"use client";

import React, { useState } from "react";
import Link from "next/link";
import ArrowRightIcon from "@heroicons/react/24/outline/ArrowRightIcon";
import FolderIcon from "@heroicons/react/24/outline/FolderIcon";
import DocumentTextIcon from "@heroicons/react/24/outline/DocumentTextIcon";
import ClockIcon from "@heroicons/react/24/outline/ClockIcon";
import ViewColumnsIcon from "@heroicons/react/24/outline/ViewColumnsIcon";
import BeakerIcon from "@heroicons/react/24/outline/BeakerIcon";
import PencilSquareIcon from "@heroicons/react/24/outline/PencilSquareIcon";
import ChevronDownIcon from "@heroicons/react/24/outline/ChevronDownIcon";
import CheckIcon from "@heroicons/react/24/outline/CheckIcon";
import ArrowLongRightIcon from "@heroicons/react/24/outline/ArrowLongRightIcon";
import LightBulbIcon from "@heroicons/react/24/outline/LightBulbIcon";
import RocketLaunchIcon from "@heroicons/react/24/outline/RocketLaunchIcon";
import PlayIcon from "@heroicons/react/20/solid/PlayIcon";

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-blue-600/30 selection:text-white relative overflow-x-hidden">
      
      {/* 1. Sticky Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#000000]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-white rounded-sm" />
            </div>
            <span className="font-semibold tracking-tight text-white">Worksblue</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="hidden md:flex text-sm font-medium text-white hover:text-white/80 transition-colors"
            >
              Log in
            </Link>
            <Link 
              href="/dashboard"
              className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex flex-col items-center pt-32 w-full">
        
        {/* 2. Hero Section */}
        <section className="relative w-full max-w-7xl mx-auto px-6 pt-10 pb-20 flex flex-col items-center text-center">
          {/* Ambient Glow */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

          <h1 className="relative z-10 text-5xl md:text-7xl lg:text-[80px] font-medium tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 leading-[1.05] mb-6 max-w-5xl mx-auto">
            One Workspace for Your Entire Software Development Lifecycle
          </h1>
          <p className="relative z-10 text-lg md:text-xl text-white/50 max-w-3xl mb-10 tracking-tight leading-relaxed">
            Worksblue unites planning, sprint tracking, issue management, requirements, and architecture design. Stop switching tabs and start shipping faster.
          </p>
          <div className="relative z-10 flex flex-row items-center gap-4 mb-20">
            <Link 
              href="/dashboard"
              className="group flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-500 transition-all focus:ring-4 focus:ring-blue-600/20 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
            >
              Start Free
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <button className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-white/10 bg-white/5 text-white font-medium hover:bg-white/10 transition-colors">
              <PlayIcon className="w-4 h-4 text-white/60" />
              View Demo
            </button>
          </div>

          {/* Hero Mockup Dashboard */}
          <div className="relative w-full max-w-5xl h-[400px] md:h-[600px] rounded-t-2xl md:rounded-t-3xl border border-white/10 bg-[#0A0A0A] overflow-hidden shadow-2xl flex flex-col z-10">
            {/* Window controls */}
            <div className="h-10 border-b border-white/5 bg-black/40 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-white/10" />
              <div className="w-3 h-3 rounded-full bg-white/10" />
              <div className="w-3 h-3 rounded-full bg-white/10" />
            </div>
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar */}
              <div className="w-48 md:w-64 border-r border-white/5 bg-black/20 p-4 flex flex-col gap-2">
                <div className="h-8 rounded bg-white/5 w-full mb-4" />
                <div className="h-6 rounded bg-white/5 w-3/4" />
                <div className="h-6 rounded bg-blue-600/20 text-blue-500 w-5/6 flex items-center px-2 text-xs">Sprints</div>
                <div className="h-6 rounded bg-white/5 w-4/5" />
              </div>
              {/* Main Content */}
              <div className="flex-1 p-6 flex flex-col gap-4">
                <div className="h-10 rounded bg-white/5 w-1/3 mb-4" />
                <div className="grid grid-cols-3 gap-4 flex-1">
                  {[1,2,3].map(i => (
                    <div key={i} className="rounded-lg border border-white/5 bg-black/40 p-4 flex flex-col gap-3">
                      <div className="h-4 rounded bg-white/10 w-1/2" />
                      <div className="h-20 rounded border border-white/5 bg-white/[0.02]" />
                      <div className="h-20 rounded border border-white/5 bg-white/[0.02]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Gradient Overlay for bottom fade */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#000000] to-transparent pointer-events-none" />
          </div>
        </section>

        {/* 3. Social Proof */}
        <section className="w-full border-y border-white/5 bg-[#050505] py-10 flex flex-col items-center px-6">
          <p className="text-sm font-medium tracking-wide text-white/40 mb-8">Trusted by modern software teams</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale">
            {/* Placeholders for logos */}
            <div className="flex items-center gap-2 font-bold text-xl"><div className="w-6 h-6 bg-white rounded-full" /> ACME Corp</div>
            <div className="flex items-center gap-2 font-bold text-xl italic">TechSynergy</div>
            <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">NEXUS</div>
            <div className="flex items-center gap-2 font-bold text-xl uppercase">Quantum</div>
            <div className="flex items-center gap-2 font-bold text-xl">Globex</div>
          </div>
        </section>

        {/* 4. Problem -> Solution */}
        <section className="w-full max-w-7xl mx-auto px-6 py-32">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 p-10 rounded-3xl border border-white/5 bg-[#0A0A0A] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ViewColumnsIcon className="w-32 h-32 text-red-500" />
              </div>
              <h3 className="text-red-400 font-medium tracking-wide text-sm uppercase">The Problem</h3>
              <h2 className="text-3xl font-medium tracking-tight">Too many tools. Lost context.</h2>
              <ul className="space-y-4 text-white/50 tracking-tight">
                <li className="flex items-start gap-3"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500/50 flex-shrink-0"/> Constant context switching drains productivity.</li>
                <li className="flex items-start gap-3"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500/50 flex-shrink-0"/> Requirements are disconnected from actual tasks.</li>
                <li className="flex items-start gap-3"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500/50 flex-shrink-0"/> Designs live in another app entirely.</li>
                <li className="flex items-start gap-3"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500/50 flex-shrink-0"/> Sprints get out of sync with product vision.</li>
              </ul>
            </div>

            <div className="space-y-6 p-10 rounded-3xl border border-blue-500/20 bg-blue-900/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <CheckIcon className="w-32 h-32 text-blue-500" />
              </div>
              <h3 className="text-blue-400 font-medium tracking-wide text-sm uppercase relative z-10">The Worksblue Solution</h3>
              <h2 className="text-3xl font-medium tracking-tight relative z-10">A single, unified workspace.</h2>
              <ul className="space-y-4 text-white/70 tracking-tight relative z-10">
                <li className="flex items-start gap-3"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"/> Everything in one tightly integrated workspace.</li>
                <li className="flex items-start gap-3"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"/> Requirements linked directly to issues.</li>
                <li className="flex items-start gap-3"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"/> Integrated architecture and wireframe design.</li>
                <li className="flex items-start gap-3"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"/> Sprints and Kanban boards perfectly synced.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 5. Features Section */}
        <section id="features" className="w-full max-w-7xl mx-auto px-6 py-24">
          <div className="relative w-full rounded-[3rem] border border-white/10 bg-[#050505] overflow-hidden flex flex-col items-center px-6 py-24 shadow-2xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[200px] bg-blue-500/10 blur-[100px] pointer-events-none" />
            <div className="relative z-10 text-center mb-16 max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tighter text-white mb-4">Powerful features, zero clutter.</h2>
            <p className="text-lg text-white/50 tracking-tight">Everything you need to build software efficiently, beautifully designed.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {[
              { icon: FolderIcon, title: "Project Workspace", desc: "Centralized hubs for your distinct projects and cross-functional teams." },
              { icon: DocumentTextIcon, title: "Requirements Tracking", desc: "Write, organize, and link functional and non-functional requirements to issues." },
              { icon: ClockIcon, title: "Sprint Management", desc: "Plan, estimate, and execute sprints with complete visibility into capacity." },
              { icon: ViewColumnsIcon, title: "Kanban Boards", desc: "Highly responsive drag-and-drop boards to track issue progression instantly." },
              { icon: BeakerIcon, title: "Test Case Management", desc: "Define inputs, expected results, and track execution status without another tool." },
              { icon: PencilSquareIcon, title: "Excalidraw Whiteboard", desc: "Native integration for brainstorming, drawing diagrams, and system architecture." }
            ].map((feat, i) => (
              <div key={i} className="p-8 rounded-3xl border border-white/5 bg-[#0A0A0A] hover:bg-[#0F0F11] transition-colors group">
                <feat.icon className="w-6 h-6 text-white/40 mb-6 group-hover:text-blue-400 transition-colors" />
                <h3 className="text-lg font-medium tracking-tight text-white mb-2">{feat.title}</h3>
                <p className="text-white/50 text-sm tracking-tight leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
          </div>
        </section>

        {/* 6. Workflow Section */}
        <section id="workflow" className="w-full border-y border-white/5 bg-[#000000] py-32 px-6 overflow-hidden relative">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto flex flex-col items-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tighter text-white mb-6">The Worksblue Workflow</h2>
            <p className="text-lg text-white/50 tracking-tight mb-20 text-center max-w-2xl">From the first spark of an idea to the final release, everything happens in one continuous motion.</p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-2 w-full max-w-6xl">
              {[
                { name: 'Idea', icon: LightBulbIcon },
                { name: 'Requirements', icon: DocumentTextIcon },
                { name: 'Design', icon: PencilSquareIcon },
                { name: 'Sprint', icon: ClockIcon },
                { name: 'Release', icon: RocketLaunchIcon }
              ].map((step, idx, arr) => (
                <React.Fragment key={step.name}>
                  <div className="flex-1 w-50 md:w-auto p-6 md:p-8 rounded-3xl border border-white/10 bg-[#0A0A0A]/80 backdrop-blur-md text-center shadow-2xl relative group hover:border-blue-500/50 hover:bg-[#0F0F12] transition-all duration-300 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none" />
                    
                    <div className="w-12 h-12 mx-auto mb-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-blue-500/30 group-hover:bg-blue-500/10 transition-colors">
                      <step.icon className="w-6 h-6 text-white/40 group-hover:text-blue-400 transition-colors" />
                    </div>
                    
                    <span className="text-[10px] font-bold text-white/30 tracking-widest uppercase mb-2 block group-hover:text-blue-500/70 transition-colors">Step 0{idx + 1}</span>
                    <span className="text-lg font-medium text-white/80 group-hover:text-white transition-colors tracking-tight">{step.name}</span>
                  </div>
                  {idx < arr.length - 1 && (
                    <div className="hidden md:flex items-center justify-center w-12 flex-shrink-0">
                      <ArrowLongRightIcon className="w-8 h-8 text-white/10" />
                    </div>
                  )}
                  {idx < arr.length - 1 && (
                    <div className="w-[1px] h-8 bg-white/10 md:hidden my-2" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Architecture & Design Section */}
        <section id="architecture" className="w-full max-w-7xl mx-auto px-6 py-32 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tighter text-white">Visualize your architecture.</h2>
            <p className="text-lg text-white/50 tracking-tight leading-relaxed">
              Design systems where you manage them. With native Excalidraw integration, your diagrams live alongside your code requirements.
            </p>
            <ul className="space-y-4">
              {[
                "Context diagrams",
                "Entity Relationship Diagrams (ERD)",
                "Use case diagrams",
                "UI wireframes",
                "API & RBAC documentation"
              ].map(item => (
                <li key={item} className="flex items-center gap-3 text-white/80 tracking-tight">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex-1 w-full">
            {/* Excalidraw Mockup */}
            <div className="w-full aspect-[4/3] rounded-3xl border border-white/10 bg-[#121212] p-4 flex flex-col shadow-2xl relative overflow-hidden">
              <div className="absolute top-4 left-4 flex gap-2">
                <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center"><div className="w-4 h-4 border border-white/40" /></div>
                <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center"><div className="w-4 h-4 rounded-full border border-white/40" /></div>
                <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center"><ArrowRightIcon className="w-4 h-4 text-white/40" /></div>
              </div>
              <div className="flex-1 relative flex items-center justify-center mt-12">
                {/* Mock Diagram elements */}
                <div className="absolute top-1/4 left-1/4 w-32 h-20 border-2 border-blue-400 bg-blue-400/10 rounded-lg flex items-center justify-center text-xs font-medium text-blue-300">Client</div>
                <div className="absolute bottom-1/4 right-1/4 w-32 h-20 border-2 border-purple-400 bg-purple-400/10 rounded-lg flex items-center justify-center text-xs font-medium text-purple-300">Database</div>
                
                {/* Mock arrows */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: "drop-shadow(0 0 2px rgba(255,255,255,0.2))" }}>
                  <path d="M 35% 35% Q 50% 30% 65% 65%" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrow)" />
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255,255,255,0.4)" />
                    </marker>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Agile Section */}
        <section className="w-full max-w-7xl mx-auto px-6 py-20 flex flex-col items-center">
          <div className="text-center mb-16 max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tighter text-white mb-4">Sprint seamlessly.</h2>
            <p className="text-lg text-white/50 tracking-tight">Fluid drag-and-drop interfaces with built-in WIP limits.</p>
          </div>

          <div className="w-full max-w-4xl p-6 rounded-3xl border border-white/10 bg-[#0A0A0A] shadow-2xl overflow-x-auto custom-scrollbar">
            <div className="flex gap-4 min-w-[800px]">
              {[
                { name: "Todo", limit: null, count: 5, color: "bg-gray-500" },
                { name: "In Progress", limit: 3, count: 2, color: "bg-blue-500" },
                { name: "Review", limit: 2, count: 3, color: "bg-yellow-500", over: true },
                { name: "Done", limit: null, count: 12, color: "bg-green-500" },
              ].map(col => (
                <div key={col.name} className="flex-1 flex flex-col gap-3">
                  <div className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${col.color}`} />
                      <span className="text-sm font-medium text-white">{col.name}</span>
                    </div>
                    <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${col.over ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/60'}`}>
                      {col.count}{col.limit ? ` / ${col.limit}` : ''}
                    </div>
                  </div>
                  {/* Mock Cards */}
                  <div className="flex flex-col gap-2 min-h-[200px] p-2 rounded-xl bg-black/50 border border-white/5">
                    {Array.from({length: Math.min(col.count, 3)}).map((_, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-white/10 bg-[#141414] shadow-sm cursor-grab hover:border-white/20 transition-colors">
                        <div className="text-xs text-white/40 mb-1">WRK-10{idx}</div>
                        <div className="text-sm text-white/80 font-medium">Update authentication flow</div>
                      </div>
                    ))}
                    {col.name === "Todo" && (
                      <div className="mt-2 py-2 border border-dashed border-white/20 rounded-lg flex items-center justify-center text-white/30 text-sm">
                        Drop here
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. Why Teams Choose Worksblue */}
        <section className="w-full border-y border-white/5 bg-[#030303] py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-medium tracking-tight text-white/60 text-center mb-16 uppercase text-sm">Why modern teams choose Worksblue</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/5">
              {[
                { stat: "40%", label: "Less Context Switching" },
                { stat: "2x", label: "Faster Sprint Planning" },
                { stat: "100%", label: "Linked Requirements" },
                { stat: "PWA", label: "Mobile Ready" }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center text-center px-4">
                  <span className="text-5xl md:text-6xl font-medium tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 mb-2">{item.stat}</span>
                  <span className="text-sm text-white/50 tracking-tight font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 10. Pricing Section */}
        <section id="pricing" className="w-full max-w-7xl mx-auto px-6 py-32 flex flex-col items-center">
          <div className="text-center mb-16 max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tighter text-white mb-4">Simple, transparent pricing.</h2>
            <p className="text-lg text-white/50 tracking-tight">Start for free, upgrade when you need more power.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 w-full max-w-5xl">
            {/* Free */}
            <div className="p-8 rounded-3xl border border-white/10 bg-[#0A0A0A] flex flex-col">
              <h3 className="text-lg font-medium text-white mb-2">Free</h3>
              <p className="text-white/50 text-sm mb-6">For individuals and small teams starting out.</p>
              <div className="text-4xl font-medium tracking-tighter text-white mb-8">$0<span className="text-lg text-white/30">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-white/80"><CheckIcon className="w-4 h-4 text-white/40" /> Up to 3 projects</li>
                <li className="flex items-center gap-3 text-sm text-white/80"><CheckIcon className="w-4 h-4 text-white/40" /> Basic Kanban boards</li>
                <li className="flex items-center gap-3 text-sm text-white/80"><CheckIcon className="w-4 h-4 text-white/40" /> Excalidraw integration</li>
              </ul>
              <button className="w-full py-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium transition-colors">Start Free</button>
            </div>

            {/* Pro */}
            <div className="p-8 rounded-3xl border border-blue-500/30 bg-blue-500/5 flex flex-col relative overflow-hidden shadow-[0_0_30px_rgba(37,99,235,0.1)]">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-blue-400">Pro</h3>
                <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] uppercase font-bold tracking-wider">Popular</span>
              </div>
              <p className="text-white/50 text-sm mb-6">For growing teams that need complete control.</p>
              <div className="text-4xl font-medium tracking-tighter text-white mb-8">$12<span className="text-lg text-white/30">/user/mo</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-white"><CheckIcon className="w-4 h-4 text-blue-500" /> Unlimited projects</li>
                <li className="flex items-center gap-3 text-sm text-white"><CheckIcon className="w-4 h-4 text-blue-500" /> Advanced Sprint Management</li>
                <li className="flex items-center gap-3 text-sm text-white"><CheckIcon className="w-4 h-4 text-blue-500" /> Test Case Tracking</li>
                <li className="flex items-center gap-3 text-sm text-white"><CheckIcon className="w-4 h-4 text-blue-500" /> Role-based access control</li>
              </ul>
              <button className="w-full py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors">Upgrade to Pro</button>
            </div>

            {/* Enterprise */}
            <div className="p-8 rounded-3xl border border-white/10 bg-[#0A0A0A] flex flex-col">
              <h3 className="text-lg font-medium text-white mb-2">Enterprise</h3>
              <p className="text-white/50 text-sm mb-6">For large organizations with custom security needs.</p>
              <div className="text-4xl font-medium tracking-tighter text-white mb-8">Custom</div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-white/80"><CheckIcon className="w-4 h-4 text-white/40" /> SSO & SAML</li>
                <li className="flex items-center gap-3 text-sm text-white/80"><CheckIcon className="w-4 h-4 text-white/40" /> Self-hosting options</li>
                <li className="flex items-center gap-3 text-sm text-white/80"><CheckIcon className="w-4 h-4 text-white/40" /> Dedicated success manager</li>
                <li className="flex items-center gap-3 text-sm text-white/80"><CheckIcon className="w-4 h-4 text-white/40" /> Custom SLAs</li>
              </ul>
              <button className="w-full py-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium transition-colors">Contact Us</button>
            </div>
          </div>
        </section>

        {/* 11. FAQ */}
        <section id="faq" className="w-full max-w-3xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-medium tracking-tighter text-white mb-10 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "Apakah Worksblue mendukung Scrum/Kanban?", a: "Ya, Worksblue mendukung penuh metodologi Agile dengan fitur Sprint planning, estimasi poin, dan papan Kanban interaktif yang bisa disesuaikan." },
              { q: "Apakah bisa self-hosted?", a: "Saat ini opsi self-hosted tersedia eksklusif untuk paket Enterprise. Silakan hubungi tim sales kami untuk informasi lebih lanjut." },
              { q: "Apakah ada integrasi GitHub?", a: "Ya, Anda dapat menautkan issue/task di Worksblue langsung ke commit dan pull request di GitHub secara otomatis." },
              { q: "Apakah data aman?", a: "Keamanan adalah prioritas utama kami. Semua data dienkripsi (at rest & in transit), dan kami memiliki backup otomatis yang tersimpan di server terpisah." },
              { q: "Apakah tersedia mode offline/PWA?", a: "Tentu! Worksblue dirancang sebagai Progressive Web App (PWA) sehingga Anda bisa menginstalnya layaknya aplikasi native dan beberapa fitur tetap bisa diakses offline." }
            ].map((faq, idx) => (
              <div key={idx} className="border border-white/10 rounded-2xl bg-[#0A0A0A] overflow-hidden">
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-white/[0.02] transition-colors focus:outline-none"
                >
                  <span className="font-medium text-white/90">{faq.q}</span>
                  <ChevronDownIcon className={`w-5 h-5 text-white/40 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openFaq === idx ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p className="text-white/50 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 12. Final CTA */}
        <section className="w-full max-w-7xl mx-auto px-6 py-32">
          <div className="relative w-full rounded-[3rem] border border-white/10 bg-[#050505] overflow-hidden flex flex-col items-center text-center px-6 py-24 md:py-32 shadow-2xl">
            {/* Subtle Top Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[200px] bg-blue-500/20 blur-[100px] pointer-events-none" />
            
            <h2 className="relative z-10 text-4xl md:text-6xl font-medium tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-6 max-w-3xl leading-tight">
              Build Better Software with Less Tool Switching
            </h2>
            <p className="relative z-10 text-lg text-white/40 mb-10 max-w-xl tracking-tight">
              Join modern engineering teams who have already streamlined their entire workflow inside a single workspace.
            </p>
            <Link 
              href="/dashboard"
              className="relative z-10 px-8 py-3.5 rounded-full bg-white text-black font-medium hover:bg-gray-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              Start Free Today
            </Link>
          </div>
        </section>

      </main>

      {/* 13. Footer */}
      <footer className="w-full border-t border-white/10 bg-[#000000] pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-white rounded-sm" />
              </div>
              <span className="font-semibold tracking-tight text-white">Worksblue</span>
            </div>
            <p className="text-sm text-white/40 max-w-xs">The unified workspace for modern software development teams.</p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-white/50">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-6">Resources</h4>
            <ul className="space-y-4 text-sm text-white/50">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-white/50">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy & Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40 tracking-tight">
            &copy; 2026 Worksblue. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-white/40">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
