'use client';

import React from 'react';
import { MessageSquareText, Lightbulb } from 'lucide-react';

interface InputContextBarProps {
  inputText: string;
  onChangeInputText: (text: string) => void;
  onRunWorkflow: () => void;
  isRunning: boolean;
  sampleInput?: string;
}

export function InputContextBar({
  inputText,
  onChangeInputText,
  onRunWorkflow,
  isRunning,
  sampleInput,
}: InputContextBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isRunning && inputText.trim()) {
      onRunWorkflow();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 px-4 py-2 bg-slate-900/90 border-b border-slate-800/80">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 shrink-0">
        <MessageSquareText className="h-4 w-4 text-indigo-400" />
        <span>Workflow Input Context:</span>
      </div>

      <div className="relative flex-1">
        <input
          type="text"
          value={inputText}
          onChange={(e) => onChangeInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter ticket text, user query, or request payload to evaluate..."
          className="w-full rounded-lg bg-slate-950 border border-slate-700/80 px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-sans"
        />
      </div>

      {sampleInput && sampleInput !== inputText && (
        <button
          onClick={() => onChangeInputText(sampleInput)}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-indigo-300 hover:text-indigo-200 bg-indigo-950/40 border border-indigo-900/50 hover:bg-indigo-900/40 transition-colors shrink-0"
          title="Load template sample text"
        >
          <Lightbulb className="h-3 w-3 text-amber-400" />
          <span>Use Sample Text</span>
        </button>
      )}
    </div>
  );
}
