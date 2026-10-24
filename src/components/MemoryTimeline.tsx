import React from 'react';
import { StepCalculation } from '../types/lstm';
import { Activity } from 'lucide-react';

interface MemoryTimelineProps {
  steps: StepCalculation[];
  currentStepIndex: number;
  onSelectStep: (index: number) => void;
}

export const MemoryTimeline: React.FC<MemoryTimelineProps> = ({
  steps,
  currentStepIndex,
  onSelectStep,
}) => {
  if (!steps || steps.length === 0) return null;

  const width = 800;
  const height = 140;
  const paddingX = 40;
  const paddingY = 25;

  const innerWidth = width - 2 * paddingX;
  const innerHeight = height - 2 * paddingY;

  let minCt = -1.5;
  let maxCt = 1.5;
  steps.forEach((s) => {
    if (s.Ct < minCt) minCt = s.Ct;
    if (s.Ct > maxCt) maxCt = s.Ct;
  });
  const rangeCt = Math.max(0.1, maxCt - minCt);

  const getX = (idx: number) => {
    if (steps.length === 1) return width / 2;
    return paddingX + (idx / (steps.length - 1)) * innerWidth;
  };

  const getY_Ct = (val: number) => {
    const norm = (val - minCt) / rangeCt;
    return height - paddingY - norm * innerHeight;
  };

  const getY_ht = (val: number) => {
    const norm = (val - -1) / 2;
    return height - paddingY - norm * innerHeight;
  };

  const ctPoints = steps.map((s, idx) => `${getX(idx)},${getY_Ct(s.Ct)}`).join(' L ');
  const htPoints = steps.map((s, idx) => `${getX(idx)},${getY_ht(s.ht)}`).join(' L ');
  const ctPath = `M ${ctPoints}`;
  const htPath = `M ${htPoints}`;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Memory Trajectory Across Time Steps
          </h4>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono font-semibold">
          <div className="flex items-center gap-1.5 text-blue-700">
            <span className="w-3.5 h-1 bg-blue-600 rounded" />
            <span>Cell State (C_t)</span>
          </div>
          <div className="flex items-center gap-1.5 text-teal-700">
            <span className="w-3.5 h-1 bg-teal-600 rounded" />
            <span>Hidden State (h_t)</span>
          </div>
        </div>
      </div>

      <div className="relative w-full aspect-[800/140] min-h-[120px] bg-slate-50/60 rounded-lg p-1 border border-slate-100">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          {/* Zero reference line */}
          <line
            x1={paddingX}
            y1={getY_Ct(0)}
            x2={width - paddingX}
            y2={getY_Ct(0)}
            stroke="#CBD5E1"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />

          {/* Lines */}
          <path d={ctPath} fill="none" stroke="#2563EB" strokeWidth="2.5" />
          <path d={htPath} fill="none" stroke="#0D9488" strokeWidth="2" strokeDasharray="5 3" />

          {/* Dots and Labels */}
          {steps.map((s, idx) => {
            const x = getX(idx);
            const yCt = getY_Ct(s.Ct);
            const yHt = getY_ht(s.ht);
            const isSelected = idx === currentStepIndex;

            return (
              <g key={idx} className="cursor-pointer" onClick={() => onSelectStep(idx)}>
                {/* Vertical column highlight */}
                {isSelected && (
                  <line
                    x1={x}
                    y1={paddingY}
                    x2={x}
                    y2={height - 10}
                    stroke="#4F46E5"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                    opacity="0.8"
                  />
                )}

                {/* Ct Dot */}
                <circle
                  cx={x}
                  cy={yCt}
                  r={isSelected ? 6 : 4}
                  fill="#2563EB"
                  stroke="#FFFFFF"
                  strokeWidth={isSelected ? 2.5 : 1.5}
                />

                {/* ht Dot */}
                <circle
                  cx={x}
                  cy={yHt}
                  r={isSelected ? 5 : 3.5}
                  fill="#0D9488"
                  stroke="#FFFFFF"
                  strokeWidth={isSelected ? 2 : 1.5}
                />

                {/* Word Label below */}
                <text
                  x={x}
                  y={height - 4}
                  fill={isSelected ? '#4338CA' : '#475569'}
                  fontSize={isSelected ? '11' : '10'}
                  fontWeight={isSelected ? '800' : '600'}
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {s.token}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono pt-1">
        <span>Current Token: <strong className="text-indigo-700 font-bold">"{steps[currentStepIndex].token}"</strong></span>
        <span>Annotation: <span className="font-sans font-medium text-slate-700">{steps[currentStepIndex].annotation}</span></span>
      </div>
    </div>
  );
};
