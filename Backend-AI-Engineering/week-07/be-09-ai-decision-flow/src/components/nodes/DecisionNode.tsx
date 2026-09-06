'use client';

import React, { useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Sparkles, CheckCircle2, XCircle, Loader2, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { DecisionNodeData } from '@/types/flow';

export function DecisionNode({
  id,
  data,
  selected,
}: {
  id: string;
  data: DecisionNodeData;
  selected?: boolean;
}) {
  const { updateNodeData } = useReactFlow();
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [localPrompt, setLocalPrompt] = useState(data.prompt || '');
  const [isExpanded, setIsExpanded] = useState(true);

  const status = data.executionStatus || 'idle';
  const isRunning = status === 'running';
  const isPassedYes = status === 'passed-yes';
  const isPassedNo = status === 'passed-no';
  const isSkipped = status === 'skipped';
  const isFailed = status === 'failed';

  const handlePromptBlur = () => {
    setIsEditingPrompt(false);
    updateNodeData(id, { prompt: localPrompt });
  };

  return (
    <div
      className={`group relative rounded-xl border bg-slate-900/95 backdrop-blur-md text-slate-100 shadow-xl transition-all duration-300 w-72 ${
        isRunning
          ? 'border-indigo-500 ring-4 ring-indigo-500/30 shadow-indigo-500/20'
          : isPassedYes
          ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-emerald-500/10'
          : isPassedNo
          ? 'border-rose-500 ring-2 ring-rose-500/30 shadow-rose-500/10'
          : isFailed
          ? 'border-red-500 ring-2 ring-red-500/40 shadow-red-500/20'
          : selected
          ? 'border-indigo-400 ring-2 ring-indigo-400/40'
          : 'border-slate-800 hover:border-slate-700'
      } ${isSkipped ? 'opacity-40 filter grayscale' : ''}`}
    >
      {/* Target input handle at the top */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        className="!w-3.5 !h-3.5 !bg-slate-400 !border-2 !border-slate-900 transition-transform hover:!scale-125"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 px-3.5 py-2.5 bg-slate-950/40 rounded-t-xl">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="font-semibold text-xs tracking-wide text-slate-200 truncate">
            {data.label || 'Decision Node'}
          </span>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isRunning && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-500/20 text-indigo-300 animate-pulse">
              <Loader2 className="h-3 w-3 animate-spin" />
              evaluating
            </span>
          )}
          {isPassedYes && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-3 w-3" />
              YES
            </span>
          )}
          {isPassedNo && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <XCircle className="h-3 w-3" />
              NO
            </span>
          )}
          {isFailed && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400">
              ERROR
            </span>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-slate-200 transition-colors p-0.5"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Node Body: Prompt Editor & Reason */}
      {isExpanded && (
        <div className="p-3 space-y-2.5">
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                Prompt / Question:
              </span>
              {!isEditingPrompt ? (
                <button
                  onClick={() => setIsEditingPrompt(true)}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                >
                  Edit
                </button>
              ) : (
                <button
                  onClick={handlePromptBlur}
                  className="text-[10px] text-emerald-400 font-semibold"
                >
                  Save
                </button>
              )}
            </div>

            {isEditingPrompt ? (
              <textarea
                value={localPrompt}
                onChange={(e) => setLocalPrompt(e.target.value)}
                onBlur={handlePromptBlur}
                autoFocus
                rows={3}
                className="w-full rounded-lg bg-slate-950 border border-indigo-500/50 p-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-400 font-mono resize-none nodrag"
                placeholder="Ask a binary YES/NO decision question..."
              />
            ) : (
              <div
                onClick={() => setIsEditingPrompt(true)}
                className="rounded-lg bg-slate-950/60 border border-slate-800/80 p-2 text-xs text-slate-300 hover:border-slate-700 cursor-pointer min-h-[48px] line-clamp-3 leading-relaxed transition-colors"
                title="Click to edit prompt"
              >
                {data.prompt || <span className="text-slate-500 italic">No prompt defined. Click to edit.</span>}
              </div>
            )}
          </div>

          {/* AI Result & Rationale preview when executed */}
          {data.lastReason && (
            <div className="rounded-lg bg-slate-950/70 border border-slate-800/60 p-2 text-[11px] text-slate-300">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                <span className="font-semibold text-slate-300">AI Rationale:</span>
                {data.durationMs && <span>{data.durationMs}ms</span>}
              </div>
              <p className="text-slate-300 leading-snug">{data.lastReason}</p>
            </div>
          )}
        </div>
      )}

      {/* Bottom Branching Output Handles */}
      <div className="relative flex items-center justify-between px-6 py-2 border-t border-slate-800/80 bg-slate-950/40 rounded-b-xl">
        {/* YES branch handle */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-emerald-400 tracking-wider">YES</span>
        </div>
        <Handle
          type="source"
          position={Position.Bottom}
          id="yes"
          style={{ left: '28%' }}
          className="!w-3.5 !h-3.5 !bg-emerald-500 !border-2 !border-slate-950 transition-transform hover:!scale-125 cursor-crosshair"
        />

        {/* NO branch handle */}
        <Handle
          type="source"
          position={Position.Bottom}
          id="no"
          style={{ left: '72%' }}
          className="!w-3.5 !h-3.5 !bg-rose-500 !border-2 !border-slate-950 transition-transform hover:!scale-125 cursor-crosshair"
        />
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-rose-400 tracking-wider">NO</span>
        </div>
      </div>
    </div>
  );
}
