'use client';

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { PlayCircle, CheckCircle } from 'lucide-react';
import { StartNodeData } from '@/types/flow';

export function StartNode({
  data,
  selected,
}: {
  id: string;
  data: StartNodeData;
  selected?: boolean;
}) {
  const isCompleted = data.executionStatus === 'completed';

  return (
    <div
      className={`relative rounded-xl border bg-slate-900/95 backdrop-blur-md text-slate-100 shadow-xl transition-all duration-300 w-60 ${
        isCompleted
          ? 'border-emerald-500 ring-2 ring-emerald-500/30'
          : selected
          ? 'border-indigo-400 ring-2 ring-indigo-400/40'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-center gap-2.5 p-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <PlayCircle className="h-4 w-4" />
        </div>
        <div className="overflow-hidden">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-xs tracking-wide text-slate-200">
              {data.label || 'Start Trigger'}
            </span>
            {isCompleted && <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />}
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            {data.description || 'Workflow entry point'}
          </p>
        </div>
      </div>

      {/* Outgoing source handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        className="!w-3.5 !h-3.5 !bg-emerald-400 !border-2 !border-slate-950 transition-transform hover:!scale-125"
      />
    </div>
  );
}
