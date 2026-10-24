import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GateType, OverrideValues } from './types/lstm';
import { PRESET_SEQUENCES, computeFullSequence } from './lib/lstmModel';
import { Header } from './components/Header';
import { LstmCellDiagram } from './components/LstmCellDiagram';
import { MathInspector } from './components/MathInspector';
import { SandboxControls } from './components/SandboxControls';
import { SimulationControls } from './components/SimulationControls';
import { MemoryTimeline } from './components/MemoryTimeline';
import { GlossaryModal } from './components/GlossaryModal';
import { RnnComparisonModal } from './components/RnnComparisonModal';
import { Layers } from 'lucide-react';

export default function App() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('clouds-sky');
  const [customTokens, setCustomTokens] = useState<string[] | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [selectedGate, setSelectedGate] = useState<GateType>('forget_gate');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [glossaryTopic, setGlossaryTopic] = useState<string | undefined>(undefined);
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);

  // Manual sandbox overrides
  const [overrides, setOverrides] = useState<OverrideValues>({
    enabled: false,
  });

  const sandboxRef = useRef<HTMLDivElement>(null);

  // Find active preset
  const activePreset = useMemo(() => {
    return PRESET_SEQUENCES.find((p) => p.id === selectedPresetId) || PRESET_SEQUENCES[0];
  }, [selectedPresetId]);

  // Determine current active token list
  const tokens = useMemo(() => {
    if (selectedPresetId === 'custom' && customTokens) {
      return customTokens;
    }
    return activePreset.tokens;
  }, [selectedPresetId, customTokens, activePreset]);

  // Keep weights aligned with preset
  const weights = activePreset.defaultWeights;

  // Calculate full sequence steps
  const steps = useMemo(() => {
    return computeFullSequence(tokens, weights, currentStepIndex, overrides);
  }, [tokens, weights, currentStepIndex, overrides]);

  const currentStep = steps[currentStepIndex] || steps[0];

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = Math.max(300, 1800 / playbackSpeed);
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= tokens.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, tokens.length, playbackSpeed]);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setOverrides({ enabled: false });
  };

  const handleSetCustomTokens = (newTokens: string[]) => {
    setCustomTokens(newTokens);
    setSelectedPresetId('custom');
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setOverrides({ enabled: false });
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setOverrides({ enabled: false });
  };

  const handleScrollToSandbox = () => {
    sandboxRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenGlossaryWithTopic = (gate?: GateType | string) => {
    let topicId = 'sigmoid';
    if (gate === 'forget_gate' || gate === 'input_gate' || gate === 'output_gate') {
      topicId = 'sigmoid';
    } else if (gate === 'candidate_gate') {
      topicId = 'tanh';
    } else if (gate === 'cell_state') {
      topicId = 'cell_vs_hidden';
    } else if (gate === 'hidden_state') {
      topicId = 'hadamard';
    } else if (gate === 'input_vector') {
      topicId = 'concatenation';
    }
    setGlossaryTopic(topicId);
    setIsGlossaryOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Universal 3-Zone Top Bar */}
      <Header
        onOpenGlossary={() => {
          setGlossaryTopic(undefined);
          setIsGlossaryOpen(true);
        }}
        onOpenComparison={() => setIsComparisonOpen(true)}
        onScrollToSandbox={handleScrollToSandbox}
        onReset={handleReset}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Context Kicker (Anti-AI Slop: clean typographic metadata, NO pills) */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono font-medium">
            <span>Neural Architecture</span>
            <span aria-hidden="true">·</span>
            <span>Hochreiter & Schmidhuber (1997)</span>
            <span aria-hidden="true">·</span>
            <span>Recurrent Sequence Modeling</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-bold">Constant Error Carousel Active</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            LSTM Cell Mechanics & Sequence Dynamics
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
            Long Short-Term Memory networks solve vanishing gradients through an additive conveyor belt (Cell State{' '}
            <span className="font-mono text-blue-700 font-bold">C_t</span>) guarded by three independent sigmoid valves. Step through sequences below or force gate overrides in the sandbox.
          </p>
        </div>

        {/* Step-by-Step Simulation Toolbar */}
        <SimulationControls
          presets={PRESET_SEQUENCES}
          selectedPresetId={selectedPresetId}
          onSelectPreset={handleSelectPreset}
          tokens={tokens}
          currentStepIndex={currentStepIndex}
          onStepChange={(idx) => {
            setCurrentStepIndex(idx);
            setIsPlaying(false);
          }}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          playbackSpeed={playbackSpeed}
          onChangeSpeed={setPlaybackSpeed}
          onSetCustomTokens={handleSetCustomTokens}
        />

        {/* Two-Zone Primary Workstation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Zone: Interactive Schematic Diagram & Timeline (7 cols) */}
          <div className="lg:col-span-7 space-y-6" id="schematic">
            <LstmCellDiagram
              currentStep={currentStep}
              selectedGate={selectedGate}
              onSelectGate={(gate) => setSelectedGate(gate)}
              isOverridden={overrides.enabled}
            />

            <MemoryTimeline
              steps={steps}
              currentStepIndex={currentStepIndex}
              onSelectStep={(idx) => {
                setCurrentStepIndex(idx);
                setIsPlaying(false);
              }}
            />
          </div>

          {/* Right Zone: Live Math Inspector & Sandbox Overrides (5 cols) */}
          <div className="lg:col-span-5 space-y-6" id="inspector">
            <MathInspector
              selectedGate={selectedGate}
              currentStep={currentStep}
              weights={weights}
              onOpenSandbox={handleScrollToSandbox}
              onOpenGlossary={handleOpenGlossaryWithTopic}
            />

            <div ref={sandboxRef} id="sandbox">
              <SandboxControls
                currentStep={currentStep}
                overrides={overrides}
                onUpdateOverrides={setOverrides}
                onResetOverrides={() => setOverrides({ enabled: false })}
              />
            </div>
          </div>
        </div>

        {/* Concept Architecture Notes Footer */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h4 className="text-slate-900 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Core Mathematical Invariants</span>
            </h4>
            <button
              onClick={() => setIsComparisonOpen(true)}
              className="text-indigo-600 hover:text-indigo-800 font-semibold underline font-mono text-[11px] cursor-pointer"
            >
              Why not Vanilla RNN? Read Comparison →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-[11px]">
            <div className="p-3.5 bg-amber-50/60 rounded-lg border border-amber-200 space-y-1">
              <span className="text-amber-900 font-bold block">1. The Forget Valve (f_t)</span>
              <p className="text-amber-800 font-sans">
                f_t ∈ [0, 1]. When f_t = 1, memory is preserved 100%. When f_t = 0, past context is flushed cleanly.
              </p>
            </div>

            <div className="p-3.5 bg-blue-50/60 rounded-lg border border-blue-200 space-y-1">
              <span className="text-blue-900 font-bold block">2. The Additive Highway (C_t)</span>
              <p className="text-blue-800 font-sans">
                C_t = f_t ⊙ C_(t-1) + i_t ⊙ C̃_t. Because updates are added (+) instead of multiplied (×W), gradients don't vanish.
              </p>
            </div>

            <div className="p-3.5 bg-teal-50/60 rounded-lg border border-teal-200 space-y-1">
              <span className="text-teal-900 font-bold block">3. Selective Output (h_t)</span>
              <p className="text-teal-800 font-sans">
                h_t = o_t ⊙ tanh(C_t). The cell state can store comprehensive multi-sentence context while only exposing immediate tokens.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Educational Modals */}
      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        initialTopic={glossaryTopic}
      />

      <RnnComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
      />
    </div>
  );
}
