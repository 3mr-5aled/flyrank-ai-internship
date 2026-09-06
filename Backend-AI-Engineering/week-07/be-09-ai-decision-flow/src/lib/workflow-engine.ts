import { FlowNode, FlowEdge, ExecutionStepLog, WorkflowExecutionResult, DecisionNodeData, ActionNodeData } from '@/types/flow';
import { evaluateNodeDecision } from '@/lib/llm';

export interface TraversalStepHandler {
  (stepIndex: number, stepLog: ExecutionStepLog): Promise<void> | void;
}

/**
 * Traverses a workflow graph dynamically step-by-step based on AI YES/NO decisions.
 * Can be used within Inngest step functions or direct execution.
 */
export async function executeWorkflowCore(params: {
  nodes: FlowNode[];
  edges: FlowEdge[];
  inputText: string;
  runId?: string;
  workflowName?: string;
  stepRunner?: <T>(stepId: string, fn: () => Promise<T>) => Promise<T>;
  onStepProgress?: TraversalStepHandler;
}): Promise<WorkflowExecutionResult> {
  const {
    nodes,
    edges,
    inputText,
    runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    workflowName = 'AI Decision Flow',
    stepRunner = async (_, fn) => await fn(),
    onStepProgress
  } = params;

  const startTime = Date.now();
  const steps: ExecutionStepLog[] = [];
  const path: string[] = [];

  // Create fast lookup maps
  const nodeMap = new Map<string, FlowNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  // Find start node: prefer type 'start', or first node without incoming edges
  const targetNodeIds = new Set(edges.map(e => e.target));
  let currentNode: FlowNode | undefined =
    nodes.find(n => n.type === 'start') ||
    nodes.find(n => !targetNodeIds.has(n.id)) ||
    nodes[0];

  if (!currentNode) {
    throw new Error('Invalid workflow: No nodes found.');
  }

  const visitedNodes = new Set<string>();
  const MAX_STEPS = 25;
  let stepIndex = 0;
  let finalAction: string | undefined;
  let finalNodeId: string | undefined;

  while (currentNode && stepIndex < MAX_STEPS) {
    stepIndex++;
    path.push(currentNode.id);
    const node: FlowNode = currentNode;

    if (visitedNodes.has(node.id)) {
      console.warn(`[executeWorkflowCore] Cycle detected at node ${node.id}. Halting execution.`);
      break;
    }
    visitedNodes.add(node.id);

    // 1. Handle START node
    if (node.type === 'start') {
      const stepLog: ExecutionStepLog = await stepRunner(`step-${stepIndex}-start-${node.id}`, async () => {
        return {
          stepIndex,
          nodeId: node.id,
          nodeLabel: (node.data as { label?: string }).label || 'Workflow Trigger',
          nodeType: 'start',
          prompt: 'Trigger workflow with input context',
          reason: `Input received (${inputText.slice(0, 80)}...)`,
          durationMs: 5,
          timestamp: new Date().toISOString(),
          status: 'completed',
        };
      });

      steps.push(stepLog);
      if (onStepProgress) await onStepProgress(stepIndex, stepLog);

      // Follow outgoing edge
      const outgoingEdge = edges.find(e => e.source === node.id);
      if (!outgoingEdge) break;
      currentNode = nodeMap.get(outgoingEdge.target);
      continue;
    }

    // 2. Handle DECISION node
    if (node.type === 'decision') {
      const decisionData = node.data as DecisionNodeData;
      const prompt = decisionData.prompt || 'Evaluate condition';
      const nodeLabel = decisionData.label || `Decision ${node.id}`;

      const stepLog: ExecutionStepLog = await stepRunner(`step-${stepIndex}-decision-${node.id}`, async () => {
        const stepStart = Date.now();
        const llmResult = await evaluateNodeDecision({
          prompt,
          nodeLabel,
          inputText,
        });

        return {
          stepIndex,
          nodeId: node.id,
          nodeLabel,
          nodeType: 'decision',
          prompt,
          decision: llmResult.decision,
          reason: llmResult.reason,
          rawResponse: llmResult.raw,
          durationMs: Date.now() - stepStart,
          timestamp: new Date().toISOString(),
          status: 'completed',
        };
      });

      steps.push(stepLog);
      if (onStepProgress) await onStepProgress(stepIndex, stepLog);

      // Find outgoing edge matching YES or NO
      const chosenDecision = stepLog.decision as 'YES' | 'NO';
      const outgoingEdges = edges.filter(e => e.source === node.id);

      // Match by sourceHandle ('yes'/'no') or edge data condition ('YES'/'NO')
      let nextEdge = outgoingEdges.find(e => {
        const handle = (e.sourceHandle || '').toLowerCase();
        const cond = (e.data?.condition || '').toUpperCase();
        const label = typeof e.label === 'string' ? e.label.toUpperCase() : '';
        
        if (chosenDecision === 'YES') {
          return handle === 'yes' || cond === 'YES' || label === 'YES';
        } else {
          return handle === 'no' || cond === 'NO' || label === 'NO';
        }
      });

      // Fallback if handles weren't strictly matched
      if (!nextEdge && outgoingEdges.length > 0) {
        nextEdge = chosenDecision === 'YES' ? outgoingEdges[0] : (outgoingEdges[1] || outgoingEdges[0]);
      }

      if (!nextEdge) {
        console.warn(`[executeWorkflowCore] No outgoing edge found for ${chosenDecision} from node ${node.id}`);
        finalNodeId = node.id;
        break;
      }

      currentNode = nodeMap.get(nextEdge.target);
      continue;
    }

    // 3. Handle ACTION / TERMINAL node
    if (node.type === 'action') {
      const actionData = node.data as ActionNodeData;
      const actionLabel = actionData.label || 'Action Executed';
      finalAction = actionData.actionType || actionLabel;
      finalNodeId = node.id;

      const stepLog: ExecutionStepLog = await stepRunner(`step-${stepIndex}-action-${node.id}`, async () => {
        return {
          stepIndex,
          nodeId: node.id,
          nodeLabel: actionLabel,
          nodeType: 'action',
          prompt: `Execute Action: ${finalAction}`,
          decision: 'ACTION',
          reason: `Workflow resolved to action "${finalAction}".`,
          durationMs: 10,
          timestamp: new Date().toISOString(),
          status: 'completed',
        };
      });

      steps.push(stepLog);
      if (onStepProgress) await onStepProgress(stepIndex, stepLog);

      // Terminal node reached
      break;
    }

    // Default fallback
    break;
  }

  const totalDurationMs = Date.now() - startTime;

  return {
    runId,
    workflowName,
    status: 'completed',
    path,
    steps,
    finalNodeId,
    finalAction,
    totalDurationMs,
  };
}
