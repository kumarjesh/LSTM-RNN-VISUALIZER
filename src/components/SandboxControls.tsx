import React from 'react';
import { OverrideValues, StepCalculation } from '../types/lstm';
import { Sliders, RotateCcw, Zap } from 'lucide-react';

interface SandboxControlsProps {
  currentStep: StepCalculation;
  overrides: OverrideValues;
  onUpdateOverrides: (overrides: OverrideValues) => void;
  onResetOverrides: () => void;
}

export const SandboxControls: React.FC<SandboxControlsProps> = ({
  currentStep,
  overrides,
  onUpdateOverrides,
  onResetOverrides,
}) => {
  const isEnabled = overrides.enabled;

  const currentFt = isEnabled && overrides.ft !== undefined ? overrides.ft : currentStep.ft;
  const currentIt = isEnabled && overrides.it !== undefined ? overrides.it : currentStep.it;
  const currentCt = isEnabled && overrides.cTilde_t !== undefined ? overrides.cTilde_t : currentStep.cTilde_t;
  const currentOt = isEnabled && overrides.ot !== undefined ? overrides.ot : currentStep.ot;

  const handleSliderChange = (key: keyof OverrideValues, val: number) => {
    onUpdateOverrides({
      ...overrides,
      enabled: true,
      [key]: val,
    });
  };

  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'amnesia':
        // Total Forget Gate = 0.0
        onUpdateOverrides({
          enabled: true,
          ft: 0.0,
          it: 0.8,
          cTilde_t: currentStep.cTilde_t,
          ot: currentStep.ot,
        });
        break;
      case 'preservation':
        // Perfect retention: ft = 1.0, it = 0.0
        onUpdateOverrides({
          enabled: true,
          ft: 1.0,
          it: 0.0,
          cTilde_t: currentStep.cTilde_t,
          ot: currentStep.ot,
        });
        break;
      case 'overwrite':
        // Purge old and admit 100% of new candidate
        onUpdateOverrides({
          enabled: true,
          ft: 0.0,
          it: 1.0,
          cTilde_t: currentStep.cTilde_t,
          ot: currentStep.ot,
        });
        break;
      case 'isolate-read':
        // Pure read: ft = 0.95, it = 0.05, ot = 1.0
        onUpdateOverrides({
          enabled: true,
          ft: 0.95,
          it: 0.05,
          cTilde_t: currentStep.cTilde_t,
          ot: 1.0,
        });
        break;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
      {/* Sandbox Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Sandbox Override Deck</span>
              {isEnabled && (
                <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-amber-100 text-amber-900 border border-amber-300">
                  MANUAL ACTIVE
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Force gate valves to test memory persistence vs forgetting
            </p>
          </div>
        </div>

        {isEnabled && (
          <button
            onClick={onResetOverrides}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset to Model</span>
          </button>
        )}
      </div>

      {/* Preset Action Buttons */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
          One-Click Stress Test Scenarios
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => applyPreset('amnesia')}
            className="px-2.5 py-2 rounded-lg bg-amber-50/80 hover:bg-amber-100 text-left border border-amber-200 hover:border-amber-400 transition-all group cursor-pointer"
          >
            <span className="text-xs font-bold text-amber-900 block">
              Total Amnesia
            </span>
            <span className="text-[10px] text-amber-700 block font-mono">f_t = 0.0 (Wipe prior)</span>
          </button>

          <button
            onClick={() => applyPreset('preservation')}
            className="px-2.5 py-2 rounded-lg bg-blue-50/80 hover:bg-blue-100 text-left border border-blue-200 hover:border-blue-400 transition-all group cursor-pointer"
          >
            <span className="text-xs font-bold text-blue-900 block">
              Pure Preservation
            </span>
            <span className="text-[10px] text-blue-700 block font-mono">f_t = 1.0, i_t = 0.0</span>
          </button>

          <button
            onClick={() => applyPreset('overwrite')}
            className="px-2.5 py-2 rounded-lg bg-emerald-50/80 hover:bg-emerald-100 text-left border border-emerald-200 hover:border-emerald-400 transition-all group cursor-pointer"
          >
            <span className="text-xs font-bold text-emerald-900 block">
              Total Overwrite
            </span>
            <span className="text-[10px] text-emerald-700 block font-mono">f_t = 0.0, i_t = 1.0</span>
          </button>

          <button
            onClick={() => applyPreset('isolate-read')}
            className="px-2.5 py-2 rounded-lg bg-pink-50/80 hover:bg-pink-100 text-left border border-pink-200 hover:border-pink-400 transition-all group cursor-pointer"
          >
            <span className="text-xs font-bold text-pink-900 block">
              Max Readout
            </span>
            <span className="text-[10px] text-pink-700 block font-mono">o_t = 1.0 (Full expose)</span>
          </button>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
        {/* Forget Gate Slider */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-900 flex items-center gap-1.5">
              <span>Forget Gate (f_t)</span>
              <span className="text-[11px] font-normal text-slate-500 font-mono">valve</span>
            </span>
            <span className="font-mono text-amber-700 font-extrabold">{currentFt.toFixed(3)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={currentFt}
            onChange={(e) => handleSliderChange('ft', parseFloat(e.target.value))}
            className="w-full accent-amber-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono font-medium">
            <span>0.0 (Wipe all)</span>
            <span>0.5 (Half retain)</span>
            <span>1.0 (Full memory)</span>
          </div>
        </div>

        {/* Input Gate Slider */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-900 flex items-center gap-1.5">
              <span>Input Gate (i_t)</span>
              <span className="text-[11px] font-normal text-slate-500 font-mono">admission</span>
            </span>
            <span className="font-mono text-emerald-700 font-extrabold">{currentIt.toFixed(3)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={currentIt}
            onChange={(e) => handleSliderChange('it', parseFloat(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono font-medium">
            <span>0.0 (Ignore input)</span>
            <span>0.5 (50% admit)</span>
            <span>1.0 (Full admit)</span>
          </div>
        </div>

        {/* Candidate Gate Slider */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-purple-900 flex items-center gap-1.5">
              <span>Candidate Memory (C̃_t)</span>
              <span className="text-[11px] font-normal text-slate-500 font-mono">tanh</span>
            </span>
            <span className="font-mono text-purple-700 font-extrabold">
              {currentCt >= 0 ? `+${currentCt.toFixed(3)}` : currentCt.toFixed(3)}
            </span>
          </div>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.02"
            value={currentCt}
            onChange={(e) => handleSliderChange('cTilde_t', parseFloat(e.target.value))}
            className="w-full accent-purple-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono font-medium">
            <span>-1.0 (Invert signal)</span>
            <span>0.0 (Neutral)</span>
            <span>+1.0 (Max boost)</span>
          </div>
        </div>

        {/* Output Gate Slider */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-pink-900 flex items-center gap-1.5">
              <span>Output Gate (o_t)</span>
              <span className="text-[11px] font-normal text-slate-500 font-mono">squelch</span>
            </span>
            <span className="font-mono text-pink-700 font-extrabold">{currentOt.toFixed(3)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={currentOt}
            onChange={(e) => handleSliderChange('ot', parseFloat(e.target.value))}
            className="w-full accent-pink-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono font-medium">
            <span>0.0 (Silence output)</span>
            <span>0.5 (Half reveal)</span>
            <span>1.0 (Full reveal)</span>
          </div>
        </div>
      </div>

      {/* Immediate Real-time Consequence Display */}
      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
        <div className="flex items-center justify-between text-slate-800 font-mono pb-2 border-b border-slate-200 mb-2">
          <span className="text-slate-600 font-bold text-[11px]">Real-Time Result for Step {currentStep.stepIndex}:</span>
          <div className="flex items-center gap-4">
            <span>
              Updated C_t: <strong className="text-blue-700 font-bold">{currentStep.Ct.toFixed(3)}</strong>
            </span>
            <span>
              Updated h_t: <strong className="text-teal-700 font-bold">{currentStep.ht.toFixed(3)}</strong>
            </span>
          </div>
        </div>
        <p className="text-slate-700 text-[11px] leading-relaxed">
          {isEnabled ? (
            <span className="text-amber-900 font-medium flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              Manual values applied! Prior memory contribution is {(currentFt * currentStep.Ct_prev).toFixed(3)}, new memory added is {(currentIt * currentCt).toFixed(3)}.
            </span>
          ) : (
            <span className="text-slate-600">
              Sliders will override the natural feedforward computation for Step {currentStep.stepIndex}. Move sliders to observe immediate memory modifications.
            </span>
          )}
        </p>
      </div>
    </div>
  );
};
