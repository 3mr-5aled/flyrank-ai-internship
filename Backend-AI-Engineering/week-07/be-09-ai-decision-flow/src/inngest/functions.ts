import { inngest } from './client';
import { executeWorkflowCore } from '@/lib/workflow-engine';
import { WorkflowExecutionPayload } from '@/types/flow';

/**
 * Inngest function that executes an AI decision workflow step-by-step.
 * Each node in the graph is mapped to a durable, retryable Inngest step (step.run).
 */
export const executeWorkflowFunction = inngest.createFunction(
  {
    id: 'execute-ai-decision-flow',
    name: 'Execute AI Decision Workflow',
    retries: 2,
    triggers: [{ event: 'flow/workflow.execute' }],
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async ({ event, step }: { event: any; step: any }) => {
    const payload = event.data as WorkflowExecutionPayload;

    if (!payload.nodes || payload.nodes.length === 0) {
      throw new Error('No nodes provided in workflow execution payload.');
    }

    // Wrap graph traversal with Inngest's step.run for durability & visual observability
    const result = await executeWorkflowCore({
      nodes: payload.nodes,
      edges: payload.edges,
      inputText: payload.inputContext?.text || '',
      runId: payload.workflowId,
      workflowName: payload.workflowName,
      stepRunner: async (stepId, fn) => {
        return await step.run(stepId, fn);
      },
    });

    return result;
  }
);

export const inngestFunctions = [executeWorkflowFunction];
