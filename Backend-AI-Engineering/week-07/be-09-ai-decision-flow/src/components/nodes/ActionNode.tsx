'use client';

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { CheckCircle, Flag, Loader2 } from 'lucide-react';
import { ActionNodeData } from '@/types/flow';

export function ActionNode({
  data,
  selected,
}: {
  id: string;
  data: ActionNodeData;
  selected?: boolean;
}) {
  const status = data.executionStatus || 'idle';
  const isCompleted = status === 'completed';
  const isRunning = status === 'running';
  const isSkipped = status === 'skipped';

  return (
    <div
      className={`relative rounded-xl border bg-slate-900/95 backdrop-blur-md text-slate-100 shadow-xl transition-all duration-300 w-64 ${
        isCompleted
          ? 'border-emerald-500 ring-4 ring-emerald-500/30 shadow-emerald-500/20'
          : isRunning
          ? 'border-indigo-500 ring-2 ring-indigo-500/30 animate-pulse'
          : selected
          ? 'border-indigo-400 ring-2 ring-indigo-400/40'
          : 'border-slate-800 hover:border-slate-700'
      } ${isSkipped ? 'opacity-40 filter grayscale' : ''}`}
    >
      {/* Target handle at the top */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        className="!w-3.5 !h-3.5 !bg-slate-400 !border-2 !border-slate-950 transition-transform hover:!scale-125"
      />

      <div className="p-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
              isCompleted
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-violet-500/20 text-violet-400 border-violet-500/30'
            }`}>
              {isRunning ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
              ) : isCompleted ? (
                <CheckCircle className="h-3.5 w-3.5" />
              ) : (
                <Flag className="h-3.5 w-3.5" />
              )}
            </div>
            <span className="font-semibold text-xs tracking-wide text-slate-200 truncate">
              {data.label || 'Action Target'}
            </span>
          </div>

          {isCompleted && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
              RESOLVED
            </span>
          )}
        </div>

        <div className="rounded-lg bg-slate-950/60 border border-slate-800/80 p-2 text-xs text-slate-300">
          <span className="text-[10px] uppercase font-bold text-violet-400 block mb-0.5">Terminal Action</span>
          <p className="leading-snug">{data.actionType || data.label}</p>
        </div>
      </div>
    </div>
  );
}
