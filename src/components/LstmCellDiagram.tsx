import React from 'react';
import { GateType, StepCalculation } from '../types/lstm';

interface LstmCellDiagramProps {
  currentStep: StepCalculation;
  selectedGate: GateType;
  onSelectGate: (gate: GateType) => void;
  isOverridden: boolean;
}

export const LstmCellDiagram: React.FC<LstmCellDiagramProps> = ({
  currentStep,
  selectedGate,
  onSelectGate,
  isOverridden,
}) => {
  const { ft, it, cTilde_t, ot, Ct, Ct_prev, ht, ht_prev, xt, token, retainedMemory, newMemory, tanhCt } = currentStep;

  const fmt = (n: number, digits = 2) => (n >= 0 ? `+${n.toFixed(digits)}` : n.toFixed(digits));

  return (
    <div className="relative w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* Schematic Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200 animate-pulse" />
          <span className="font-mono text-slate-800 font-bold uppercase tracking-wider">
            Interactive LSTM Cell Schematic
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600 font-medium">
            Token: <span className="font-mono text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">"{token}"</span> (x_t = {fmt(xt)})
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono">
          {isOverridden && (
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-xs">
              SANDBOX OVERRIDE ACTIVE
            </span>
          )}
          <span className="text-slate-500 text-[11px]">Click any component to inspect formulas</span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full aspect-[16/10] min-h-[460px] max-h-[640px] p-2 flex items-center justify-center select-none bg-slate-50/50">
        <svg
          viewBox="0 0 940 580"
          className="w-full h-full max-h-full transition-all duration-300"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Soft shadow filters */}
            <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0F172A" floodOpacity="0.08" />
            </filter>

            <filter id="brightSelectGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#4F46E5" floodOpacity="0.4" />
            </filter>

            {/* Bright Markers */}
            <marker id="arrow-blue" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#2563EB" />
            </marker>
            <marker id="arrow-amber" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#D97706" />
            </marker>
            <marker id="arrow-emerald" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#059669" />
            </marker>
            <marker id="arrow-purple" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#7C3AED" />
            </marker>
            <marker id="arrow-teal" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#0D9488" />
            </marker>
            <marker id="arrow-pink" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#DB2777" />
            </marker>
            <marker id="arrow-slate" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#475569" />
            </marker>

            {/* Flow Animations */}
            <style>
              {`
                @keyframes conveyorMove {
                  from { stroke-dashoffset: 40; }
                  to { stroke-dashoffset: 0; }
                }
                @keyframes pulseData {
                  0% { transform: scale(0.98); opacity: 0.9; }
                  50% { transform: scale(1.02); opacity: 1; }
                  100% { transform: scale(0.98); opacity: 0.9; }
                }
                .conveyor-belt-anim {
                  animation: conveyorMove 1.6s linear infinite;
                }
                .data-flow-anim {
                  animation: conveyorMove 2.2s linear infinite;
                }
                .pulse-node {
                  animation: pulseData 2.4s ease-in-out infinite;
                }
              `}
            </style>
          </defs>

          {/* Cell Outer Boundary Box */}
          <rect
            x="130"
            y="50"
            width="700"
            height="460"
            rx="24"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            filter="url(#softShadow)"
          />
          <text x="150" y="78" fill="#64748B" fontSize="12" fontWeight="700" fontFamily="monospace">
            LSTM CELL UNIT (t)
          </text>

          {/* ============================================================== */}
          {/* 1. LONG-TERM MEMORY LINE (CELL STATE, C_t) - CONVEYOR BELT    */}
          {/* ============================================================== */}
          <g
            className="cursor-pointer group"
            onClick={() => onSelectGate('cell_state')}
          >
            {/* Conveyor Belt Background Track */}
            <rect
              x="30"
              y="102"
              width="880"
              height="36"
              rx="18"
              fill={selectedGate === 'cell_state' ? '#DBEAFE' : '#EFF6FF'}
              stroke={selectedGate === 'cell_state' ? '#2563EB' : '#3B82F6'}
              strokeWidth={selectedGate === 'cell_state' ? '2.5' : '1.5'}
              filter={selectedGate === 'cell_state' ? 'url(#brightSelectGlow)' : 'url(#softShadow)'}
              className="transition-all"
            />

            {/* Animated Conveyor Track Ridges */}
            <line
              x1="35"
              y1="120"
              x2="905"
              y2="120"
              stroke="#2563EB"
              strokeWidth="4"
              strokeDasharray="8 8"
              className="conveyor-belt-anim"
              opacity="0.85"
            />

            {/* Left Conveyor Roller Pin */}
            <circle cx="48" cy="120" r="12" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5" />
            <circle cx="48" cy="120" r="4" fill="#2563EB" />

            {/* Right Conveyor Roller Pin */}
            <circle cx="892" cy="120" r="12" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5" />
            <circle cx="892" cy="120" r="4" fill="#2563EB" />

            {/* Inflow Label: C_{t-1} */}
            <g transform="translate(15, 85)">
              <rect x="0" y="0" width="85" height="28" rx="6" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="1.5" filter="url(#softShadow)" />
              <text x="42" y="18" fill="#1E40AF" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="monospace">
                C_(t-1): {fmt(Ct_prev)}
              </text>
            </g>

            {/* Outflow Label: C_t */}
            <g transform="translate(835, 85)">
              <rect x="0" y="0" width="85" height="28" rx="6" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" filter="url(#softShadow)" />
              <text x="42" y="18" fill="#1D4ED8" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="monospace">
                C_t: {fmt(Ct)}
              </text>
            </g>

            {/* Long-Term Memory Title Banner */}
            <rect x="390" y="72" width="180" height="22" rx="4" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="1" />
            <text x="480" y="87" fill="#1D4ED8" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="monospace" letterSpacing="0.05em">
              LONG-TERM MEMORY LINE (C_t)
            </text>
          </g>

          {/* ============================================================== */}
          {/* 2. RECURRENT INPUTS & CONCATENATION BUS                       */}
          {/* ============================================================== */}
          {/* h_{t-1} Input Wire from left */}
          <path
            d="M 30 460 L 190 460"
            fill="none"
            stroke="#0D9488"
            strokeWidth="3"
            strokeDasharray="6 4"
            className="data-flow-anim"
            markerEnd="url(#arrow-teal)"
          />
          <g transform="translate(15, 480)">
            <rect x="0" y="0" width="85" height="26" rx="6" fill="#FFFFFF" stroke="#0D9488" strokeWidth="1.5" filter="url(#softShadow)" />
            <text x="42" y="17" fill="#0F766E" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="monospace">
              h_(t-1): {fmt(ht_prev)}
            </text>
          </g>

          {/* x_t Input Wire from bottom */}
          <path
            d="M 190 550 L 190 465"
            fill="none"
            stroke="#0284C7"
            strokeWidth="3"
            strokeDasharray="6 4"
            className="data-flow-anim"
            markerEnd="url(#arrow-slate)"
          />
          <g transform="translate(145, 545)">
            <rect x="0" y="0" width="90" height="28" rx="6" fill="#0284C7" stroke="#0369A1" strokeWidth="1.5" filter="url(#softShadow)" />
            <text x="45" y="18" fill="#FFFFFF" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="monospace">
              x_t: "{token}"
            </text>
          </g>

          {/* Vector Concatenation Junction Node [h_{t-1}, x_t] */}
          <g
            className="cursor-pointer"
            onClick={() => onSelectGate('input_vector')}
          >
            <circle
              cx="190"
              cy="460"
              r="22"
              fill="#FFFFFF"
              stroke={selectedGate === 'input_vector' ? '#0284C7' : '#0D9488'}
              strokeWidth={selectedGate === 'input_vector' ? '3' : '2'}
              filter="url(#softShadow)"
            />
            <text x="190" y="463" fill="#0F766E" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="monospace">
              [h, x]
            </text>
            <text x="190" y="495" fill="#475569" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">
              CONCAT
            </text>
          </g>

          {/* Distribution Trunk Line from Concatenation node to all gates */}
          <path
            d="M 212 460 L 720 460"
            fill="none"
            stroke="#64748B"
            strokeWidth="3"
          />

          {/* Feed lines rising up into gates */}
          <path
            d="M 270 460 L 270 365"
            fill="none"
            stroke="#D97706"
            strokeWidth="2.5"
            markerEnd="url(#arrow-amber)"
          />
          <path
            d="M 400 460 L 400 365"
            fill="none"
            stroke="#059669"
            strokeWidth="2.5"
            markerEnd="url(#arrow-emerald)"
          />
          <path
            d="M 540 460 L 540 365"
            fill="none"
            stroke="#7C3AED"
            strokeWidth="2.5"
            markerEnd="url(#arrow-purple)"
          />
          <path
            d="M 720 460 L 720 365"
            fill="none"
            stroke="#DB2777"
            strokeWidth="2.5"
            markerEnd="url(#arrow-pink)"
          />

          {/* ============================================================== */}
          {/* 3. FORGET GATE (f_t)                                          */}
          {/* ============================================================== */}
          <g
            className="cursor-pointer group"
            onClick={() => onSelectGate('forget_gate')}
          >
            {/* Box */}
            <rect
              x="235"
              y="300"
              width="70"
              height="65"
              rx="12"
              fill={selectedGate === 'forget_gate' ? '#FEF3C7' : '#FFFBEB'}
              stroke="#D97706"
              strokeWidth={selectedGate === 'forget_gate' ? '3' : '1.5'}
              filter={selectedGate === 'forget_gate' ? 'url(#brightSelectGlow)' : 'url(#softShadow)'}
              className="transition-all"
            />
            {/* Sigmoid Symbol inside */}
            <text x="270" y="328" fill="#B45309" fontSize="22" fontWeight="bold" textAnchor="middle" fontStyle="italic" fontFamily="serif">
              σ
            </text>
            <text x="270" y="348" fill="#92400E" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">
              FORGET
            </text>
            {/* Gate Output Badge */}
            <rect x="235" y="270" width="70" height="22" rx="4" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />
            <text x="270" y="285" fill="#92400E" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="monospace">
              f_t: {ft.toFixed(2)}
            </text>

            {/* Line from Forget Gate up to Conveyor Multiplier */}
            <path
              d="M 270 270 L 270 148"
              fill="none"
              stroke="#D97706"
              strokeWidth="2.5"
              strokeDasharray="4 3"
              className="data-flow-anim"
              markerEnd="url(#arrow-amber)"
            />

            {/* FORGET VALVE MULTIPLIER NODE ON THE CONVEYOR BELT */}
            <circle
              cx="270"
              cy="120"
              r="18"
              fill="#FFFFFF"
              stroke="#D97706"
              strokeWidth="2.5"
              filter={selectedGate === 'forget_gate' ? 'url(#brightSelectGlow)' : 'url(#softShadow)'}
            />
            <text x="270" y="126" fill="#B45309" fontSize="18" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              ×
            </text>
            {/* Valve Label */}
            <text x="270" y="95" fill="#B45309" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">
              VALVE: {(ft * 100).toFixed(0)}%
            </text>
          </g>

          {/* Intermediate value on conveyor after forget multiplication */}
          <g transform="translate(305, 126)">
            <text x="0" y="16" fill="#1E40AF" fontSize="9" fontWeight="700" fontFamily="monospace">
              {fmt(retainedMemory)}
            </text>
          </g>

          {/* ============================================================== */}
          {/* 4. INPUT GATE (i_t) & CANDIDATE GATE (C_tilde_t)              */}
          {/* ============================================================== */}
          {/* INPUT GATE BOX */}
          <g
            className="cursor-pointer group"
            onClick={() => onSelectGate('input_gate')}
          >
            <rect
              x="365"
              y="300"
              width="70"
              height="65"
              rx="12"
              fill={selectedGate === 'input_gate' ? '#D1FAE5' : '#ECFDF5'}
              stroke="#059669"
              strokeWidth={selectedGate === 'input_gate' ? '3' : '1.5'}
              filter={selectedGate === 'input_gate' ? 'url(#brightSelectGlow)' : 'url(#softShadow)'}
              className="transition-all"
            />
            <text x="400" y="328" fill="#047857" fontSize="22" fontWeight="bold" textAnchor="middle" fontStyle="italic" fontFamily="serif">
              σ
            </text>
            <text x="400" y="348" fill="#065F46" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">
              INPUT
            </text>
            {/* Gate Output Badge */}
            <rect x="365" y="270" width="70" height="22" rx="4" fill="#D1FAE5" stroke="#059669" strokeWidth="1" />
            <text x="400" y="285" fill="#065F46" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="monospace">
              i_t: {it.toFixed(2)}
            </text>
          </g>

          {/* CANDIDATE GATE BOX */}
          <g
            className="cursor-pointer group"
            onClick={() => onSelectGate('candidate_gate')}
          >
            <rect
              x="505"
              y="300"
              width="70"
              height="65"
              rx="12"
              fill={selectedGate === 'candidate_gate' ? '#EDE9FE' : '#F5F3FF'}
              stroke="#7C3AED"
              strokeWidth={selectedGate === 'candidate_gate' ? '3' : '1.5'}
              filter={selectedGate === 'candidate_gate' ? 'url(#brightSelectGlow)' : 'url(#softShadow)'}
              className="transition-all"
            />
            <text x="540" y="328" fill="#6D28D9" fontSize="16" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              tanh
            </text>
            <text x="540" y="348" fill="#5B21B6" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">
              CANDIDATE
            </text>
            {/* Gate Output Badge */}
            <rect x="505" y="270" width="70" height="22" rx="4" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="1" />
            <text x="540" y="285" fill="#5B21B6" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="monospace">
              C̃_t: {fmt(cTilde_t)}
            </text>
          </g>

          {/* Lines merging from Input Gate and Candidate Gate into intermediate multiplier */}
          <path
            d="M 400 270 L 400 220 L 452 220"
            fill="none"
            stroke="#059669"
            strokeWidth="2.5"
            strokeDasharray="4 3"
            className="data-flow-anim"
          />
          <path
            d="M 540 270 L 540 220 L 488 220"
            fill="none"
            stroke="#7C3AED"
            strokeWidth="2.5"
            strokeDasharray="4 3"
            className="data-flow-anim"
          />

          {/* New Information Multiplier (i_t * C_tilde_t) */}
          <g
            className="cursor-pointer"
            onClick={() => onSelectGate('input_gate')}
          >
            <circle
              cx="470"
              cy="220"
              r="17"
              fill="#FFFFFF"
              stroke="#059669"
              strokeWidth="2"
              filter="url(#softShadow)"
            />
            <text x="470" y="226" fill="#047857" fontSize="18" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              ×
            </text>
            <text x="470" y="196" fill="#047857" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">
              NEW: {fmt(newMemory)}
            </text>
          </g>

          {/* Line flowing from New Information Multiplier up into Memory Addition Hub */}
          <path
            d="M 470 203 L 470 160 L 502 140"
            fill="none"
            stroke="#059669"
            strokeWidth="2.5"
            markerEnd="url(#arrow-emerald)"
          />

          {/* ============================================================== */}
          {/* 5. MEMORY CELL ADDITION HUB (THE CENTRAL BLENDER)             */}
          {/* ============================================================== */}
          <g
            className="cursor-pointer group"
            onClick={() => onSelectGate('cell_state')}
          >
            <circle
              cx="520"
              cy="120"
              r="20"
              fill="#DBEAFE"
              stroke={selectedGate === 'cell_state' ? '#1D4ED8' : '#2563EB'}
              strokeWidth={selectedGate === 'cell_state' ? '3.5' : '2'}
              filter={selectedGate === 'cell_state' ? 'url(#brightSelectGlow)' : 'url(#softShadow)'}
              className="pulse-node"
            />
            <text x="520" y="127" fill="#1E40AF" fontSize="22" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              +
            </text>
            <text x="520" y="93" fill="#1D4ED8" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">
              BLEND: (f×C) + (i×C̃)
            </text>
          </g>

          {/* ============================================================== */}
          {/* 6. OUTPUT GATE (o_t) & HIDDEN STATE OUTPUT (h_t)              */}
          {/* ============================================================== */}
          {/* OUTPUT GATE BOX */}
          <g
            className="cursor-pointer group"
            onClick={() => onSelectGate('output_gate')}
          >
            <rect
              x="685"
              y="300"
              width="70"
              height="65"
              rx="12"
              fill={selectedGate === 'output_gate' ? '#FCE7F3' : '#FDF2F8'}
              stroke="#DB2777"
              strokeWidth={selectedGate === 'output_gate' ? '3' : '1.5'}
              filter={selectedGate === 'output_gate' ? 'url(#brightSelectGlow)' : 'url(#softShadow)'}
              className="transition-all"
            />
            <text x="720" y="328" fill="#BE185D" fontSize="22" fontWeight="bold" textAnchor="middle" fontStyle="italic" fontFamily="serif">
              σ
            </text>
            <text x="720" y="348" fill="#9D174D" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">
              OUTPUT
            </text>
            {/* Gate Output Badge */}
            <rect x="685" y="270" width="70" height="22" rx="4" fill="#FCE7F3" stroke="#DB2777" strokeWidth="1" />
            <text x="720" y="285" fill="#9D174D" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="monospace">
              o_t: {ot.toFixed(2)}
            </text>
          </g>

          {/* Cell state tap line dropping down to tanh before multiplying with o_t */}
          <path
            d="M 660 120 L 660 210 L 780 210"
            fill="none"
            stroke="#2563EB"
            strokeWidth="2.5"
            strokeDasharray="4 3"
            className="data-flow-anim"
          />

          {/* tanh Squasher Box on Cell State */}
          <g>
            <rect
              x="780"
              y="185"
              width="60"
              height="50"
              rx="10"
              fill="#EFF6FF"
              stroke="#2563EB"
              strokeWidth="1.5"
              filter="url(#softShadow)"
            />
            <text x="810" y="210" fill="#1D4ED8" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              tanh
            </text>
            <text x="810" y="226" fill="#1E40AF" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">
              {fmt(tanhCt)}
            </text>
          </g>

          {/* Wire from tanh(C_t) down to hidden state multiplier */}
          <path
            d="M 810 235 L 810 300"
            fill="none"
            stroke="#2563EB"
            strokeWidth="2"
          />

          {/* Wire from o_t across into hidden state multiplier */}
          <path
            d="M 755 330 L 792 330"
            fill="none"
            stroke="#DB2777"
            strokeWidth="2.5"
            markerEnd="url(#arrow-slate)"
          />

          {/* Hidden State Multiplier (o_t * tanh(C_t)) */}
          <g
            className="cursor-pointer group"
            onClick={() => onSelectGate('hidden_state')}
          >
            <circle
              cx="810"
              cy="330"
              r="18"
              fill="#FFFFFF"
              stroke={selectedGate === 'hidden_state' ? '#0F766E' : '#0D9488'}
              strokeWidth={selectedGate === 'hidden_state' ? '3' : '2'}
              filter={selectedGate === 'hidden_state' ? 'url(#brightSelectGlow)' : 'url(#softShadow)'}
            />
            <text x="810" y="336" fill="#0D9488" fontSize="18" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              ×
            </text>
            <text x="810" y="365" fill="#0F766E" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">
              FILTER
            </text>
          </g>

          {/* Hidden State Outflow & Recurrent Loop (h_t) */}
          <g
            className="cursor-pointer"
            onClick={() => onSelectGate('hidden_state')}
          >
            {/* Step t+1 exit wire */}
            <path
              d="M 828 330 L 905 330"
              fill="none"
              stroke="#0D9488"
              strokeWidth="3.5"
              markerEnd="url(#arrow-teal)"
            />

            {/* Hidden state value badge */}
            <rect x="835" y="340" width="85" height="28" rx="6" fill="#CCFBF1" stroke="#0D9488" strokeWidth="1.5" filter="url(#softShadow)" />
            <text x="877" y="358" fill="#115E59" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="monospace">
              h_t: {fmt(ht)}
            </text>

            {/* Recurrent loop wire looping down towards next time step */}
            <path
              d="M 865 330 L 865 490 L 740 490"
              fill="none"
              stroke="#0D9488"
              strokeWidth="2"
              strokeDasharray="5 5"
              className="data-flow-anim"
            />
            <text x="850" y="482" fill="#0F766E" fontSize="9" fontWeight="700" textAnchor="end" fontFamily="monospace">
              FEEDBACK TO t+1 ↻
            </text>

            {/* Prediction Output y_t Wire rising upwards */}
            <path
              d="M 810 312 L 810 260 L 860 260"
              fill="none"
              stroke="#0D9488"
              strokeWidth="2.5"
              strokeDasharray="4 3"
              markerEnd="url(#arrow-teal)"
            />
            <rect x="855" y="246" width="65" height="24" rx="4" fill="#CCFBF1" stroke="#0D9488" strokeWidth="1" filter="url(#softShadow)" />
            <text x="887" y="262" fill="#115E59" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="monospace">
              y_t (out)
            </text>
          </g>
        </svg>
      </div>

      {/* Schematic Interactive Legend Footer */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => onSelectGate('cell_state')}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
              selectedGate === 'cell_state' ? 'text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-blue-200" />
            <span>Cell State (C_t)</span>
          </button>
          <button
            onClick={() => onSelectGate('forget_gate')}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
              selectedGate === 'forget_gate' ? 'text-amber-700 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200" />
            <span>Forget Gate (f_t)</span>
          </button>
          <button
            onClick={() => onSelectGate('input_gate')}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
              selectedGate === 'input_gate' ? 'text-emerald-700 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 ring-2 ring-emerald-200" />
            <span>Input Gate (i_t)</span>
          </button>
          <button
            onClick={() => onSelectGate('candidate_gate')}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
              selectedGate === 'candidate_gate' ? 'text-purple-700 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 ring-2 ring-purple-200" />
            <span>Candidate Gate (C̃_t)</span>
          </button>
          <button
            onClick={() => onSelectGate('output_gate')}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
              selectedGate === 'output_gate' ? 'text-pink-700 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-pink-600 ring-2 ring-pink-200" />
            <span>Output Gate (o_t)</span>
          </button>
          <button
            onClick={() => onSelectGate('hidden_state')}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
              selectedGate === 'hidden_state' ? 'text-teal-700 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 ring-2 ring-teal-200" />
            <span>Hidden State (h_t)</span>
          </button>
        </div>

        <div className="text-slate-600 font-mono text-[11px]">
          Cell Update: <span className="text-blue-700 font-bold">{fmt(Ct)}</span> = ({fmt(ft)} × {fmt(Ct_prev)}) + ({fmt(it)} × {fmt(cTilde_t)})
        </div>
      </div>
    </div>
  );
};
