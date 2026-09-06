'use client';

import React, { useRef } from 'react';
import {
  Play,
  Plus,
  Download,
  Upload,
  Save,
  RotateCcw,
  Sparkles,
  Layers,
  Activity,
  Check,
} from 'lucide-react';
import { WORKFLOW_PRESETS } from '@/lib/templates';
import { FlowNode, FlowEdge } from '@/types/flow';

interface FlowToolbarProps {
  onAddDecisionNode: () => void;
  onAddActionNode: () => void;
  onSelectPreset: (presetId: string) => void;
  selectedPresetId: string;
  onExportJson: () => void;
  onImportJson: (nodes: FlowNode[], edges: FlowEdge[], inputText?: string) => void;
  onSaveWorkflow: () => void;
  onResetWorkflow: () => void;
  onRunWorkflow: () => void;
  isRunning: boolean;
  savedSuccess?: boolean;
}

export function FlowToolbar({
  onAddDecisionNode,
  onAddActionNode,
  onSelectPreset,
  selectedPresetId,
  onExportJson,
  onImportJson,
  onSaveWorkflow,
  onResetWorkflow,
  onRunWorkflow,
  isRunning,
  savedSuccess,
}: FlowToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.nodes && parsed.edges) {
          onImportJson(parsed.nodes, parsed.edges, parsed.inputContext?.text || parsed.sampleInput);
        } else {
          alert('Invalid workflow JSON file format.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 z-20">
      {/* Brand & Preset Selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/20 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold text-slate-100 tracking-tight">AI Decision Flow</h1>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                BE-09
              </span>
            </div>
            <p className="text-[10px] text-slate-400">React Flow + Inngest Orchestrator</p>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block" />

        {/* Preset Selector */}
        <div className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-slate-400 hidden sm:inline" />
          <select
            value={selectedPresetId}
            onChange={(e) => onSelectPreset(e.target.value)}
            className="rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            {WORKFLOW_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                Template: {p.name}
              </option>
            ))}
            <option value="custom">Custom Workflow</option>
          </select>
        </div>
      </div>

      {/* Node Editing & Tool Buttons */}
      <div className="flex items-center flex-wrap gap-2">
        <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={onAddDecisionNode}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
            title="Add a binary YES/NO decision node"
          >
            <Plus className="h-3.5 w-3.5 text-indigo-400" />
            <span>Decision Node</span>
          </button>
          <button
            onClick={onAddActionNode}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
            title="Add a terminal action node"
          >
            <Plus className="h-3.5 w-3.5 text-violet-400" />
            <span>Action Node</span>
          </button>
        </div>

        {/* File / Storage controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={onSaveWorkflow}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors border ${
              savedSuccess
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
            }`}
            title="Save workflow to browser local storage"
          >
            {savedSuccess ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Save className="h-3.5 w-3.5" />}
            <span className="hidden md:inline">{savedSuccess ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={onExportJson}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white transition-colors"
            title="Export workflow to JSON file"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Export</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white transition-colors"
            title="Import workflow from JSON file"
          >
            <Upload className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Import</span>
          </button>

          <button
            onClick={onResetWorkflow}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-rose-400 transition-colors"
            title="Reset current workflow"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Primary Run Workflow Button */}
        <button
          onClick={onRunWorkflow}
          disabled={isRunning}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold text-white shadow-lg transition-all ${
            isRunning
              ? 'bg-indigo-600/50 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {isRunning ? (
            <>
              <Activity className="h-4 w-4 animate-spin" />
              <span>Inngest Running...</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Run AI Workflow</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
