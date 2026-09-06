import { type Node, type Edge } from '@xyflow/react';

export type NodeExecutionStatus =
  | 'idle'
  | 'pending'
  | 'running'
  | 'passed-yes'
  | 'passed-no'
  | 'completed'
  | 'skipped'
  | 'failed';

export interface DecisionNodeData {
  label: string;
  prompt: string;
  category?: string;
  executionStatus?: NodeExecutionStatus;
  lastDecision?: 'YES' | 'NO';
  lastReason?: string;
  durationMs?: number;
  [key: string]: unknown;
}

export interface StartNodeData {
  label: string;
  description?: string;
  executionStatus?: NodeExecutionStatus;
  [key: string]: unknown;
}

export interface ActionNodeData {
  label: string;
  actionType: string;
  description?: string;
  executionStatus?: NodeExecutionStatus;
  executedAt?: string;
  [key: string]: unknown;
}

export type CustomNodeType = 'start' | 'decision' | 'action';

export type FlowNode = Node<DecisionNodeData | StartNodeData | ActionNodeData, CustomNodeType>;

export interface DecisionEdgeData {
  condition: 'YES' | 'NO';
  isActive?: boolean;
  [key: string]: unknown;
}

export type FlowEdge = Edge<DecisionEdgeData>;

export interface ExecutionStepLog {
  stepIndex: number;
  nodeId: string;
  nodeLabel: string;
  nodeType: CustomNodeType;
  prompt?: string;
  decision?: 'YES' | 'NO' | 'ACTION';
  reason?: string;
  rawResponse?: string;
  durationMs: number;
  timestamp: string;
  status: 'running' | 'completed' | 'failed' | 'skipped';
}

export interface WorkflowExecutionPayload {
  workflowId?: string;
  workflowName?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  inputContext: {
    text: string;
    metadata?: Record<string, unknown>;
  };
}

export interface WorkflowExecutionResult {
  runId: string;
  workflowName?: string;
  status: 'completed' | 'failed';
  path: string[];
  steps: ExecutionStepLog[];
  finalNodeId?: string;
  finalAction?: string;
  totalDurationMs: number;
  error?: string;
}

export interface WorkflowPreset {
  id: string;
  name: string;
  description: string;
  sampleInput: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}
