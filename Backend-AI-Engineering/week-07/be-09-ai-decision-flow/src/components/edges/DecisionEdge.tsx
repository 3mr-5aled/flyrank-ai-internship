'use client';

import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';
import { DecisionEdgeData } from '@/types/flow';

export function DecisionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeData = data as DecisionEdgeData | undefined;
  const isYes = edgeData?.condition === 'YES';
  const isActive = Boolean(edgeData?.isActive);

  const strokeColor = isActive
    ? isYes ? '#10b981' : '#f43f5e'
    : isYes ? '#059669' : '#e11d48';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        className={isActive ? 'edge-flow-active' : ''}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth: isActive ? 3 : 2,
          opacity: isActive ? 1 : 0.7,
          filter: isActive ? `drop-shadow(0 0 6px ${strokeColor})` : undefined,
          transition: 'all 0.3s ease',
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-sm border transition-all duration-300 ${
              isYes
                ? isActive
                  ? 'bg-emerald-500 text-white border-emerald-300 ring-2 ring-emerald-400/50 shadow-emerald-500/50'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                : isActive
                ? 'bg-rose-500 text-white border-rose-300 ring-2 ring-rose-400/50 shadow-rose-500/50'
                : 'bg-rose-950/80 text-rose-300 border-rose-700/60'
            }`}
          >
            {isYes ? 'YES' : 'NO'}
          </span>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
