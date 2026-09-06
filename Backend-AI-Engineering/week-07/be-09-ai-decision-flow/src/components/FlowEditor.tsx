'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  BackgroundVariant,
  useReactFlow,
} from '@xyflow/react';
import confetti from 'canvas-confetti';

import { FlowNode, FlowEdge, ExecutionStepLog, WorkflowExecutionResult } from '@/types/flow';
import { WORKFLOW_PRESETS } from '@/lib/templates';
import { DecisionNode } from '@/components/nodes/DecisionNode';
import { StartNode } from '@/components/nodes/StartNode';
import { ActionNode } from '@/components/nodes/ActionNode';
import { DecisionEdge } from '@/components/edges/DecisionEdge';
import { FlowToolbar } from '@/components/FlowToolbar';
import { InputContextBar } from '@/components/InputContextBar';
import { ExecutionLogsPanel } from '@/components/ExecutionLogsPanel';

const STORAGE_KEY = 'ai_decision_flow_active_v1';

export function FlowEditor() {
  const initialPreset = WORKFLOW_PRESETS[0];

  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>(initialPreset.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>(initialPreset.edges);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialPreset.id);
  const [inputText, setInputText] = useState<string>(initialPreset.sampleInput);
  
  const [isRunning, setIsRunning] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<ExecutionStepLog[]>([]);
  const [executionResult, setExecutionResult] = useState<WorkflowExecutionResult | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showLogsPanel, setShowLogsPanel] = useState(true);

  const { fitView, setCenter, getNode } = useReactFlow();

  // Define custom node and edge types
  const nodeTypes = useMemo(
    () => ({
      start: StartNode,
      decision: DecisionNode,
      action: ActionNode,
    }),
    []
  );

  const edgeTypes = useMemo(
    () => ({
      decisionEdge: DecisionEdge,
    }),
    []
  );

  // Load preset workflow
  const handleSelectPreset = useCallback((presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = WORKFLOW_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      // Reset execution states
      const cleanNodes = preset.nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          executionStatus: 'idle',
          lastDecision: undefined,
          lastReason: undefined,
          durationMs: undefined,
        },
      })) as FlowNode[];

      const cleanEdges = preset.edges.map((e) => ({
        ...e,
        data: {
          ...e.data,
          condition: e.data?.condition || 'YES',
          isActive: false,
        },
      })) as FlowEdge[];

      setNodes(cleanNodes);
      setEdges(cleanEdges);
      setInputText(preset.sampleInput);
      setExecutionLogs([]);
      setExecutionResult(null);

      setTimeout(() => fitView({ padding: 0.2 }), 80);
    }
  }, [setNodes, setEdges, fitView]);

  // Handle connection between handles
  const onConnect = useCallback(
    (params: Connection) => {
      const isYesHandle = params.sourceHandle === 'yes';
      const isNoHandle = params.sourceHandle === 'no';
      const condition: 'YES' | 'NO' = isNoHandle ? 'NO' : 'YES';

      const newEdge: FlowEdge = {
        id: `e-${params.source}-${params.sourceHandle || 'out'}-${params.target}`,
        source: params.source,
        sourceHandle: params.sourceHandle,
        target: params.target,
        targetHandle: params.targetHandle,
        type: 'decisionEdge',
        data: {
          condition,
          isActive: false,
        },
        label: isYesHandle ? 'YES' : isNoHandle ? 'NO' : undefined,
      };

      setEdges((eds) => addEdge(newEdge, eds) as FlowEdge[]);
    },
    [setEdges]
  );

  // Add a new decision node
  const handleAddDecisionNode = useCallback(() => {
    const id = `decision-${Date.now().toString().slice(-4)}`;
    const newNode: FlowNode = {
      id,
      type: 'decision',
      position: {
        x: 200 + Math.random() * 80,
        y: 200 + Math.random() * 80,
      },
      data: {
        label: 'Custom Decision',
        prompt: 'Does this message require immediate escalation?',
        category: 'Custom',
        executionStatus: 'idle',
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setSelectedPresetId('custom');
  }, [setNodes]);

  // Add a new action node
  const handleAddActionNode = useCallback(() => {
    const id = `action-${Date.now().toString().slice(-4)}`;
    const newNode: FlowNode = {
      id,
      type: 'action',
      position: {
        x: 240 + Math.random() * 80,
        y: 400 + Math.random() * 80,
      },
      data: {
        label: 'Custom Action',
        actionType: 'Trigger Custom Webhook or Notification',
        executionStatus: 'idle',
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setSelectedPresetId('custom');
  }, [setNodes]);

  // Save workflow to localStorage
  const handleSaveWorkflow = useCallback(() => {
    try {
      const payload = {
        nodes,
        edges,
        inputText,
        selectedPresetId,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [nodes, edges, inputText, selectedPresetId]);

  // Reset workflow
  const handleResetWorkflow = useCallback(() => {
    if (confirm('Are you sure you want to reset the current workflow?')) {
      handleSelectPreset(selectedPresetId !== 'custom' ? selectedPresetId : 'customer-support-triage');
    }
  }, [handleSelectPreset, selectedPresetId]);

  // Export JSON
  const handleExportJson = useCallback(() => {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      workflowName: selectedPresetId,
      inputContext: { text: inputText },
      nodes,
      edges,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-decision-flow-${selectedPresetId}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges, inputText, selectedPresetId]);

  // Import JSON
  const handleImportJson = useCallback(
    (importedNodes: FlowNode[], importedEdges: FlowEdge[], importedInput?: string) => {
      setNodes(importedNodes);
      setEdges(importedEdges);
      if (importedInput) setInputText(importedInput);
      setSelectedPresetId('custom');
      setExecutionLogs([]);
      setExecutionResult(null);
      setTimeout(() => fitView({ padding: 0.2 }), 100);
    },
    [setNodes, setEdges, fitView]
  );

  // Center canvas on node from log panel
  const handleSelectNodeFromLog = useCallback(
    (nodeId: string) => {
      const node = getNode(nodeId);
      if (node) {
        setCenter(node.position.x + 120, node.position.y + 60, {
          zoom: 1.1,
          duration: 600,
        });
      }
    },
    [getNode, setCenter]
  );

  // Execute workflow end-to-end through API and animate each step
  const handleRunWorkflow = useCallback(async () => {
    if (!inputText.trim()) {
      alert('Please enter an input context message to evaluate.');
      return;
    }

    setIsRunning(true);
    setExecutionLogs([]);
    setExecutionResult(null);

    // Reset all node statuses and deactivate all edges
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          executionStatus: 'idle',
          lastDecision: undefined,
          lastReason: undefined,
          durationMs: undefined,
        },
      }))
    );

    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        data: {
          ...e.data,
          condition: e.data?.condition || 'YES',
          isActive: false,
        },
      }))
    );

    try {
      const response = await fetch('/api/workflow/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowName: selectedPresetId,
          nodes,
          edges,
          inputContext: { text: inputText },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Execution failed');
      }

      const result: WorkflowExecutionResult = await response.json();

      // Step-by-step visual animation through the traversed path
      const accumulatedLogs: ExecutionStepLog[] = [];

      for (let i = 0; i < result.steps.length; i++) {
        const step = result.steps[i];
        accumulatedLogs.push(step);
        setExecutionLogs([...accumulatedLogs]);

        // 1. Mark node as running
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id === step.nodeId) {
              return {
                ...n,
                data: {
                  ...n.data,
                  executionStatus: 'running',
                },
              };
            }
            return n;
          })
        );

        // Center on the current evaluating node
        handleSelectNodeFromLog(step.nodeId);

        // Simulated visual delay for human observability
        await new Promise((r) => setTimeout(r, 650));

        // 2. Mark node as completed with decision
        const nextStatus =
          step.nodeType === 'action' || step.nodeType === 'start'
            ? 'completed'
            : step.decision === 'YES'
            ? 'passed-yes'
            : 'passed-no';

        setNodes((nds) =>
          nds.map((n) => {
            if (n.id === step.nodeId) {
              return {
                ...n,
                data: {
                  ...n.data,
                  executionStatus: nextStatus,
                  lastDecision: step.decision === 'YES' || step.decision === 'NO' ? step.decision : undefined,
                  lastReason: step.reason,
                  durationMs: step.durationMs,
                },
              };
            }
            return n;
          })
        );

        // 3. Activate the edge connecting to next node
        if (i < result.steps.length - 1) {
          const nextStep = result.steps[i + 1];
          setEdges((eds) =>
            eds.map((e) => {
              if (e.source === step.nodeId && e.target === nextStep.nodeId) {
                return {
                  ...e,
                  data: {
                    ...e.data,
                    condition: e.data?.condition || 'YES',
                    isActive: true,
                  },
                };
              }
              return e;
            })
          );
        }
      }

      // Mark unvisited nodes as skipped
      const visitedNodeIds = new Set(result.path);
      setNodes((nds) =>
        nds.map((n) => {
          if (!visitedNodeIds.has(n.id)) {
            return {
              ...n,
              data: {
                ...n.data,
                executionStatus: 'skipped',
              },
            };
          }
          return n;
        })
      );

      setExecutionResult(result);

      // Celebrate successful workflow completion!
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Workflow execution error: ${msg}`);
    } finally {
      setIsRunning(false);
    }
  }, [
    inputText,
    selectedPresetId,
    nodes,
    edges,
    setNodes,
    setEdges,
    handleSelectNodeFromLog,
  ]);

  // Initial auto-fit
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.2 });
    }, 150);
    return () => clearTimeout(timer);
  }, [fitView]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 select-none">
      {/* Top Main Toolbar */}
      <FlowToolbar
        onAddDecisionNode={handleAddDecisionNode}
        onAddActionNode={handleAddActionNode}
        onSelectPreset={handleSelectPreset}
        selectedPresetId={selectedPresetId}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onSaveWorkflow={handleSaveWorkflow}
        onResetWorkflow={handleResetWorkflow}
        onRunWorkflow={handleRunWorkflow}
        isRunning={isRunning}
        savedSuccess={savedSuccess}
      />

      {/* Input Message Testing Bar */}
      <InputContextBar
        inputText={inputText}
        onChangeInputText={setInputText}
        onRunWorkflow={handleRunWorkflow}
        isRunning={isRunning}
        sampleInput={WORKFLOW_PRESETS.find((p) => p.id === selectedPresetId)?.sampleInput}
      />

      {/* Canvas & Logs Grid */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Canvas Area */}
        <div className="flex-1 h-[60vh] lg:h-full relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.2}
            maxZoom={1.8}
            className="bg-slate-950"
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1.5}
              color="#1e293b"
            />
            <Controls className="!bg-slate-900 !border-slate-800" />
            <MiniMap
              nodeStrokeColor="#475569"
              nodeColor="#1e293b"
              maskColor="rgba(11, 15, 25, 0.75)"
              className="!bg-slate-950 !border !border-slate-800/80 rounded-lg hidden sm:block"
            />
          </ReactFlow>

          {/* Interactive Legend in bottom left */}
          <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg text-[11px] text-slate-300 shadow-lg">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span>YES Path</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-400"></span>
              <span>NO Path</span>
            </div>
            <div className="h-3 w-px bg-slate-700"></div>
            <span className="text-slate-500 font-mono text-[10px]">Connect YES/NO ports to branch</span>
          </div>

          {/* Toggle Logs Button (Mobile / Desktop) */}
          <button
            onClick={() => setShowLogsPanel(!showLogsPanel)}
            className="absolute top-4 right-4 z-10 px-2.5 py-1 rounded-md bg-slate-900/90 backdrop-blur-md border border-slate-800 text-xs text-slate-300 hover:text-white shadow-md hover:bg-slate-800 transition-colors"
          >
            {showLogsPanel ? 'Hide Logs' : 'Show Logs'}
          </button>
        </div>

        {/* Execution Logs Drawer / Right Panel */}
        {showLogsPanel && (
          <div className="w-full lg:w-[380px] xl:w-[420px] h-[40vh] lg:h-full shrink-0 shadow-2xl z-10">
            <ExecutionLogsPanel
              logs={executionLogs}
              result={executionResult}
              isRunning={isRunning}
              onClear={() => {
                setExecutionLogs([]);
                setExecutionResult(null);
              }}
              onSelectNode={handleSelectNodeFromLog}
            />
          </div>
        )}
      </div>
    </div>
  );
}
