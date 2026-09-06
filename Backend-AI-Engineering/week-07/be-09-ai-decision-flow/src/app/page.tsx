'use client';

import dynamic from 'next/dynamic';
import { ReactFlowProvider } from '@xyflow/react';

// Dynamically import FlowEditor with SSR disabled to ensure client-only canvas rendering
const FlowEditor = dynamic(
  () => import('@/components/FlowEditor').then((mod) => mod.FlowEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <span className="text-xs font-medium tracking-wide">Loading AI Decision Flow Engine...</span>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  return (
    <main className="h-screen w-screen overflow-hidden">
      <ReactFlowProvider>
        <FlowEditor />
      </ReactFlowProvider>
    </main>
  );
}
