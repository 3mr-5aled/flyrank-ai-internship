import { NextRequest, NextResponse } from 'next/server';
import { inngest } from '@/inngest/client';
import { executeWorkflowCore } from '@/lib/workflow-engine';
import { WorkflowExecutionPayload } from '@/types/flow';

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as WorkflowExecutionPayload;

    if (!payload.nodes || !Array.isArray(payload.nodes) || payload.nodes.length === 0) {
      return NextResponse.json(
        { error: 'Invalid payload: nodes array is required.' },
        { status: 400 }
      );
    }

    const workflowId = payload.workflowId || `wf_${Date.now()}`;
    const enrichedPayload: WorkflowExecutionPayload = {
      ...payload,
      workflowId,
      workflowName: payload.workflowName || 'AI Decision Flow',
    };

    // 1. Dispatch event to Inngest for background durability & Dev Server visualization
    try {
      await inngest.send({
        name: 'flow/workflow.execute',
        data: enrichedPayload,
      });
    } catch (inngestErr) {
      console.warn('[Inngest Send Warning]:', inngestErr);
      // Non-blocking: continue direct execution even if Inngest server is offline
    }

    // 2. Execute directly so the frontend gets the immediate interactive result and step logs
    const executionResult = await executeWorkflowCore({
      nodes: enrichedPayload.nodes,
      edges: enrichedPayload.edges,
      inputText: enrichedPayload.inputContext?.text || '',
      runId: workflowId,
      workflowName: enrichedPayload.workflowName,
    });

    return NextResponse.json(executionResult, { status: 200 });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error('[workflow/execute] Execution error:', errMessage);
    return NextResponse.json(
      { error: errMessage, status: 'failed' },
      { status: 500 }
    );
  }
}
