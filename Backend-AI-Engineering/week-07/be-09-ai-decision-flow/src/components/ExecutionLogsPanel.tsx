'use client';

import React from 'react';
import { ExecutionStepLog, WorkflowExecutionResult } from '@/types/flow';
import { Terminal, CheckCircle2, XCircle, Clock, Zap, AlertCircle } from 'lucide-react';

interface ExecutionLogsPanelProps {
  logs: ExecutionStepLog[];
  result?: WorkflowExecutionResult | null;
  isRunning: boolean;
  onClear: () => void;
  onSelectNode?: (nodeId: string) => void;
}

export function ExecutionLogsPanel({
  logs,
  result,
  isRunning,
  onClear,
  onSelectNode,
}: ExecutionLogsPanelProps) {
  return (
    <div className="flex flex-col h-full bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800/80 text-slate-200">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Terminal className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Inngest Execution Steps & Logs
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {logs.length > 0 && (
            <button
              onClick={onClear}
              className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors px-2 py-0.5 rounded hover:bg-slate-800"
            >
              Clear
            </button>
          )}
          <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
            {logs.length} step{logs.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Summary Banner if executed */}
      {result && (
        <div className="px-4 py-2.5 bg-indigo-950/20 border-b border-indigo-900/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-slate-300">Total Run Time:</span>
            <span className="font-mono text-indigo-300 font-bold">{result.totalDurationMs}ms</span>
          </div>
          {result.finalAction && (
            <span className="text-[11px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium truncate max-w-[200px]">
              {result.finalAction}
            </span>
          )}
        </div>
      )}

      {/* Step Logs List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 font-sans">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-6 text-slate-500">
            <Terminal className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-xs font-medium">No execution steps yet</p>
            <p className="text-[11px] text-slate-600 mt-1 max-w-[240px]">
              Click &quot;Run Workflow&quot; to execute the decision graph through Inngest &amp; AI models.
            </p>
          </div>
        ) : (
          logs.map((step) => {
            const isYes = step.decision === 'YES';
            const isNo = step.decision === 'NO';
            const isAction = step.decision === 'ACTION';

            return (
              <div
                key={`${step.stepIndex}-${step.nodeId}`}
                onClick={() => onSelectNode && onSelectNode(step.nodeId)}
                className="group rounded-lg border border-slate-800/90 bg-slate-900/50 p-3 hover:border-slate-700 transition-all cursor-pointer shadow-sm hover:shadow"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-mono text-slate-300 font-bold">
                      {step.stepIndex}
                    </span>
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                      {step.nodeLabel}
                    </span>
                  </div>

                  {/* Decision chip */}
                  {isYes && (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="h-3 w-3" />
                      YES
                    </span>
                  )}
                  {isNo && (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      <XCircle className="h-3 w-3" />
                      NO
                    </span>
                  )}
                  {isAction && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      ACTION
                    </span>
                  )}
                </div>

                {/* Prompt info */}
                {step.prompt && (
                  <div className="text-[11px] text-slate-400 bg-slate-950/60 rounded px-2 py-1 mb-1.5 border border-slate-900">
                    <span className="text-slate-500 font-semibold block text-[10px]">EVALUATED PROMPT:</span>
                    <p className="line-clamp-2 italic text-slate-300">&quot;{step.prompt}&quot;</p>
                  </div>
                )}

                {/* AI Rationale */}
                {step.reason && (
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    <strong className="text-slate-400 font-medium">Rationale: </strong>
                    {step.reason}
                  </p>
                )}

                {/* Footer metadata */}
                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/50 text-[10px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {step.durationMs}ms
                  </span>
                  <span>{new Date(step.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            );
          })
        )}

        {isRunning && (
          <div className="rounded-lg border border-indigo-500/40 bg-indigo-950/20 p-3 flex items-center gap-2.5 animate-pulse text-xs text-indigo-300">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
            </span>
            <span>Running next Inngest step...</span>
          </div>
        )}
      </div>
    </div>
  );
}
