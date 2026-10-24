import React, { useState } from 'react';
import { StepCalculation, PresetSequence } from '../types/lstm';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  PlusCircle,
  BookOpen,
} from 'lucide-react';

interface SimulationControlsProps {
  presets: PresetSequence[];
  selectedPresetId: string;
  onSelectPreset: (presetId: string) => void;
  tokens: string[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  onSetCustomTokens: (tokens: string[]) => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  presets,
  selectedPresetId,
  onSelectPreset,
  tokens,
  currentStepIndex,
  onStepChange,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onChangeSpeed,
  onSetCustomTokens,
}) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customInputText, setCustomInputText] = useState('');

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInputText.trim()) return;
    const splitTokens = customInputText
      .trim()
      .split(/\s+/)
      .filter((t) => t.length > 0);
    if (splitTokens.length > 0) {
      onSetCustomTokens(splitTokens);
      setShowCustomModal(false);
      setCustomInputText('');
    }
  };

  const selectedPreset = presets.find((p) => p.id === selectedPresetId);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
      {/* Top Row: Preset Selection & Custom Sentence */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
            Educational Sequence Scenario
          </label>
          <div className="flex items-center gap-2">
            <select
              value={selectedPresetId}
              onChange={(e) => onSelectPreset(e.target.value)}
              className="bg-white text-slate-800 text-xs rounded-lg px-3 py-2 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold shadow-2xs"
            >
              {presets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
              {selectedPresetId === 'custom' && <option value="custom">Custom Sequence</option>}
            </select>

            <button
              onClick={() => setShowCustomModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors whitespace-nowrap cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span>Custom Text</span>
            </button>
          </div>
        </div>

        {selectedPreset && (
          <div className="sm:max-w-md text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-slate-800 font-semibold block">{selectedPreset.description}</span>
            <span className="text-[11px] text-indigo-700 font-mono font-medium mt-0.5 block">
              Focus: {selectedPreset.educationalFocus}
            </span>
          </div>
        )}
      </div>

      {/* Middle: Sequence Word Tokens Scrubber */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
            Sequence Timeline (Time Step t = {currentStepIndex})
          </span>
          <span className="text-slate-500 font-mono text-[11px] font-medium">
            {currentStepIndex + 1} of {tokens.length} tokens
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-2 px-1 scrollbar-thin">
          {tokens.map((tok, idx) => {
            const isCurrent = idx === currentStepIndex;
            const isPast = idx < currentStepIndex;
            return (
              <button
                key={idx}
                onClick={() => onStepChange(idx)}
                className={`px-3 py-2 rounded-lg text-xs font-mono transition-all flex flex-col items-center min-w-[56px] border cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/30 scale-105 font-bold z-10'
                    : isPast
                    ? 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200 font-semibold'
                    : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'
                }`}
              >
                <span className={`text-[10px] mb-0.5 ${isCurrent ? 'text-indigo-200' : 'text-slate-400'}`}>t={idx}</span>
                <span className="truncate max-w-[80px]">"{tok}"</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom: Playback Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Playback Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onStepChange(0)}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-300 cursor-pointer"
            title="Reset to beginning (t=0)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => onStepChange(Math.max(0, currentStepIndex - 1))}
            disabled={currentStepIndex === 0}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none text-slate-700 transition-colors border border-slate-300 cursor-pointer"
            title="Previous step (t-1)"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Play Simulation</span>
              </>
            )}
          </button>

          <button
            onClick={() => onStepChange(Math.min(tokens.length - 1, currentStepIndex + 1))}
            disabled={currentStepIndex === tokens.length - 1}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none text-slate-700 transition-colors border border-slate-300 cursor-pointer"
            title="Next step (t+1)"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-300 text-xs">
          <span className="text-[11px] text-slate-600 px-2 font-mono font-medium">Speed:</span>
          {[0.5, 1.0, 2.0].map((spd) => (
            <button
              key={spd}
              onClick={() => onChangeSpeed(spd)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                playbackSpeed === spd
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Modal for Custom Sequence Input */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>Input Custom Sequence</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Enter any sentence or sequence of words (separated by spaces). The LSTM will tokenize and
              calculate step-by-step gate dynamics for each word.
            </p>
            <form onSubmit={handleApplyCustom} className="space-y-4">
              <input
                type="text"
                value={customInputText}
                onChange={(e) => setCustomInputText(e.target.value)}
                placeholder="e.g. Alice went to Paris where she spoke French"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                autoFocus
              />
              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!customInputText.trim()}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold transition-colors cursor-pointer"
                >
                  Load Sequence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
