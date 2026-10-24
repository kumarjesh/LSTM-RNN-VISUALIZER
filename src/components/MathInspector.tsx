import React from 'react';
import { GateType, StepCalculation, LstmWeights } from '../types/lstm';
import { Info, Sparkles, SlidersHorizontal, Calculator } from 'lucide-react';

interface MathInspectorProps {
  selectedGate: GateType;
  currentStep: StepCalculation;
  weights: LstmWeights;
  onOpenSandbox: () => void;
  onOpenGlossary: (topic?: string) => void;
}

export const MathInspector: React.FC<MathInspectorProps> = ({
  selectedGate,
  currentStep,
  weights,
  onOpenSandbox,
  onOpenGlossary,
}) => {
  const { ft, it, cTilde_t, ot, Ct, Ct_prev, ht, ht_prev, xt, token, retainedMemory, newMemory, tanhCt, zf, zi, zc, zo } =
    currentStep;

  const fmt = (n: number, digits = 3) => (n >= 0 ? `+${n.toFixed(digits)}` : n.toFixed(digits));

  // Gate-specific educational content mapping
  const gateInfo = React.useMemo(() => {
    switch (selectedGate) {
      case 'forget_gate':
        return {
          title: 'The Forget Gate',
          symbol: 'f_t',
          range: '0.0 to 1.0',
          activation: 'Sigmoid (σ)',
          color: 'amber',
          colorClasses: {
            badge: 'bg-amber-100 text-amber-900 border-amber-300',
            border: 'border-amber-300',
            accent: 'text-amber-700',
            bg: 'bg-amber-500',
          },
          formulaLatex: 'f_t = \\sigma(W_f \\cdot [h_{t-1}, x_t] + b_f)',
          formulaClean: 'f_t = σ(W_f · [h_(t-1), x_t] + b_f)',
          description:
            'Acts as a valve on the conveyor belt. It inspects the previous hidden state (h_(t-1)) and current input (x_t) and outputs numbers between 0 (completely forget) and 1 (completely remember).',
          whyFunction:
            'Sigmoid is strictly required here because its range (0 to 1) acts as a soft binary filter: 0 acts like a closed valve multiplying previous memory by zero, while 1 leaves memory untouched.',
          arithmetic: [
            `Linear combination: z_f = (${weights.Wf_h.toFixed(2)} × ${fmt(ht_prev, 2)}) + (${weights.Wf_x.toFixed(2)} × ${fmt(xt, 2)}) + (${fmt(weights.bf, 2)})`,
            `z_f = ${zf.toFixed(3)}`,
            `Activation: f_t = 1 / (1 + e^(-${zf.toFixed(3)})) = ${ft.toFixed(3)}`,
          ],
          impact: `Multiplies prior cell state C_(t-1) (${fmt(Ct_prev, 2)}) by ${ft.toFixed(2)} → Retains ${fmt(retainedMemory, 2)} (${(ft * 100).toFixed(1)}%).`,
          value: ft,
          min: 0,
          max: 1,
        };

      case 'input_gate':
        return {
          title: 'The Input Gate',
          symbol: 'i_t',
          range: '0.0 to 1.0',
          activation: 'Sigmoid (σ)',
          color: 'emerald',
          colorClasses: {
            badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
            border: 'border-emerald-300',
            accent: 'text-emerald-700',
            bg: 'bg-emerald-500',
          },
          formulaLatex: 'i_t = \\sigma(W_i \\cdot [h_{t-1}, x_t] + b_i)',
          formulaClean: 'i_t = σ(W_i · [h_(t-1), x_t] + b_i)',
          description:
            'Decides what proportion of the new candidate information gets admitted into the permanent long-term memory line. If i_t is close to 0, current information is discarded as irrelevant.',
          whyFunction:
            'Sigmoid acts as a percentage throttle. In text, it allows words that are irrelevant to long-term memory (like punctuation or stop words) to be scaled down to near 0.',
          arithmetic: [
            `Linear combination: z_i = (${weights.Wi_h.toFixed(2)} × ${fmt(ht_prev, 2)}) + (${weights.Wi_x.toFixed(2)} × ${fmt(xt, 2)}) + (${fmt(weights.bi, 2)})`,
            `z_i = ${zi.toFixed(3)}`,
            `Activation: i_t = 1 / (1 + e^(-${zi.toFixed(3)})) = ${it.toFixed(3)}`,
          ],
          impact: `Throttles candidate memory C̃_t (${fmt(cTilde_t, 2)}) by ${it.toFixed(2)} → Adds ${fmt(newMemory, 2)} into cell state.`,
          value: it,
          min: 0,
          max: 1,
        };

      case 'candidate_gate':
        return {
          title: 'The Candidate Gate (Modulation)',
          symbol: 'C̃_t',
          range: '-1.0 to +1.0',
          activation: 'Hyperbolic Tangent (tanh)',
          color: 'purple',
          colorClasses: {
            badge: 'bg-purple-100 text-purple-900 border-purple-300',
            border: 'border-purple-300',
            accent: 'text-purple-700',
            bg: 'bg-purple-500',
          },
          formulaLatex: '\\tilde{C}_t = \\tanh(W_c \\cdot [h_{t-1}, x_t] + b_c)',
          formulaClean: 'C̃_t = tanh(W_c · [h_(t-1), x_t] + b_c)',
          description:
            'Synthesizes new candidate values from the current observation and past hidden state. This creates the actual data payload that might be added to the cell state.',
          whyFunction:
            'tanh ranges from -1 to +1, which allows the network to either increment (+ values) or decrement (- values) the stored cell state. A sigmoid could only ever add positive numbers!',
          arithmetic: [
            `Linear combination: z_c = (${weights.Wc_h.toFixed(2)} × ${fmt(ht_prev, 2)}) + (${weights.Wc_x.toFixed(2)} × ${fmt(xt, 2)}) + (${fmt(weights.bc, 2)})`,
            `z_c = ${zc.toFixed(3)}`,
            `Activation: C̃_t = tanh(${zc.toFixed(3)}) = ${cTilde_t.toFixed(3)}`,
          ],
          impact: `Represents candidate content for "${token}". It is scaled by input gate i_t (${it.toFixed(2)}) yielding ${fmt(newMemory, 2)}.`,
          value: cTilde_t,
          min: -1,
          max: 1,
        };

      case 'cell_state':
        return {
          title: 'Cell State (Long-Term Memory)',
          symbol: 'C_t',
          range: 'Linear Unbounded (-∞ to +∞)',
          activation: 'Point-wise Linear Combination (f × C + i × C̃)',
          color: 'blue',
          colorClasses: {
            badge: 'bg-blue-100 text-blue-900 border-blue-300',
            border: 'border-blue-300',
            accent: 'text-blue-700',
            bg: 'bg-blue-600',
          },
          formulaLatex: 'C_t = (f_t \\odot C_{t-1}) + (i_t \\odot \\tilde{C}_t)',
          formulaClean: 'C_t = (f_t · C_(t-1)) + (i_t · C̃_t)',
          description:
            'The core conveyor belt of the LSTM. It runs straight down the entire chain with only minor linear interactions, allowing gradients and information to flow unchanged across hundreds of time steps without exploding or vanishing.',
          whyFunction:
            'Notice the (+) addition operator! In standard RNNs, states undergo repeated matrix multiplications W · h, causing gradients to vanish exponentially. The linear (+) highway in LSTM solves the vanishing gradient problem.',
          arithmetic: [
            `1. Retained Old Memory: f_t (${ft.toFixed(2)}) × C_(t-1) (${fmt(Ct_prev, 2)}) = ${fmt(retainedMemory, 3)}`,
            `2. Admitted New Memory: i_t (${it.toFixed(2)}) × C̃_t (${fmt(cTilde_t, 2)}) = ${fmt(newMemory, 3)}`,
            `3. Summation: C_t = ${fmt(retainedMemory, 3)} + (${fmt(newMemory, 3)}) = ${fmt(Ct, 3)}`,
          ],
          impact: `Updated long-term memory for step ${currentStep.stepIndex} ("${token}") is ${fmt(Ct, 3)}.`,
          value: Ct,
          min: -3,
          max: 3,
        };

      case 'output_gate':
        return {
          title: 'The Output Gate',
          symbol: 'o_t',
          range: '0.0 to 1.0',
          activation: 'Sigmoid (σ)',
          color: 'pink',
          colorClasses: {
            badge: 'bg-pink-100 text-pink-900 border-pink-300',
            border: 'border-pink-300',
            accent: 'text-pink-700',
            bg: 'bg-pink-500',
          },
          formulaLatex: 'o_t = \\sigma(W_o \\cdot [h_{t-1}, x_t] + b_o)',
          formulaClean: 'o_t = σ(W_o · [h_(t-1), x_t] + b_o)',
          description:
            'Decides what parts of the long-term memory should be exposed right now in the short-term hidden state. Even if long-term memory stores an entire paragraph, the current step only needs a fraction of it.',
          whyFunction:
            'Sigmoid throttles the squashed cell state between 0% and 100%. For instance, in grammar prediction, cell state may know the subject is plural, but the output gate only emits this signal when a verb is being predicted.',
          arithmetic: [
            `Linear combination: z_o = (${weights.Wo_h.toFixed(2)} × ${fmt(ht_prev, 2)}) + (${weights.Wo_x.toFixed(2)} × ${fmt(xt, 2)}) + (${fmt(weights.bo, 2)})`,
            `z_o = ${zo.toFixed(3)}`,
            `Activation: o_t = 1 / (1 + e^(-${zo.toFixed(3)})) = ${ot.toFixed(3)}`,
          ],
          impact: `Filters squashed memory tanh(C_t) (${fmt(tanhCt, 2)}) by ${ot.toFixed(2)} to produce h_t = ${fmt(ht, 2)}.`,
          value: ot,
          min: 0,
          max: 1,
        };

      case 'hidden_state':
        return {
          title: 'Hidden State (Short-Term Memory)',
          symbol: 'h_t',
          range: '-1.0 to +1.0',
          activation: 'Gated Squelch: o_t ⊙ tanh(C_t)',
          color: 'teal',
          colorClasses: {
            badge: 'bg-teal-100 text-teal-900 border-teal-300',
            border: 'border-teal-300',
            accent: 'text-teal-700',
            bg: 'bg-teal-600',
          },
          formulaLatex: 'h_t = o_t \\odot \\tanh(C_t)',
          formulaClean: 'h_t = o_t · tanh(C_t)',
          description:
            'The active working memory of the LSTM at the current time step. It serves two crucial purposes: (1) It produces the output prediction y_t for the current step, and (2) it feeds into the next step as h_(t-1).',
          whyFunction:
            'Passing C_t through tanh clamps the unbounded cell state into [-1, 1], and multiplying by o_t selectively exposes only the relevant features for the current immediate token.',
          arithmetic: [
            `1. Squashed Cell State: tanh(C_t = ${fmt(Ct, 2)}) = ${fmt(tanhCt, 3)}`,
            `2. Gating: o_t = ${ot.toFixed(3)}`,
            `3. Product: h_t = ${ot.toFixed(3)} × ${fmt(tanhCt, 3)} = ${fmt(ht, 3)}`,
          ],
          impact: `Hidden representation ready to emit output prediction and feed into t+1.`,
          value: ht,
          min: -1,
          max: 1,
        };

      case 'input_vector':
      default:
        return {
          title: 'Input & Feedback Fusion',
          symbol: '[h_(t-1), x_t]',
          range: 'Combined Vector',
          activation: 'Concatenation & Linear Projection',
          color: 'cyan',
          colorClasses: {
            badge: 'bg-cyan-100 text-cyan-900 border-cyan-300',
            border: 'border-cyan-300',
            accent: 'text-cyan-700',
            bg: 'bg-cyan-600',
          },
          formulaLatex: '[h_{t-1}, x_t]',
          formulaClean: 'Vector Concatenation: [h_(t-1), x_t]',
          description:
            'At every step, the LSTM concatenates the previous working memory (h_(t-1)) with the new incoming token observation (x_t) into a joint feature vector.',
          whyFunction:
            'This allows all four internal gates to condition their decisions on BOTH context from the past and fresh information from the present.',
          arithmetic: [
            `Prior hidden context: h_(t-1) = ${fmt(ht_prev, 3)}`,
            `Current token embedding: x_t ("${token}") = ${fmt(xt, 3)}`,
            `Concatenated vector fed simultaneously into W_f, W_i, W_c, W_o`,
          ],
          impact: `Supplies the raw feature representation for all 4 gates.`,
          value: xt,
          min: -1,
          max: 1,
        };
    }
  }, [selectedGate, currentStep, weights]);

  // Compute normalized gauge position
  const normalizedGauge = Math.max(
    0,
    Math.min(100, ((gateInfo.value - gateInfo.min) / (gateInfo.max - gateInfo.min)) * 100)
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl flex flex-col h-full shadow-xs overflow-hidden">
      {/* Inspector Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>{gateInfo.title}</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono border font-bold ${gateInfo.colorClasses.badge}`}>
                {gateInfo.symbol}
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">{gateInfo.activation}</p>
          </div>
        </div>

        <button
          onClick={onOpenSandbox}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
          title="Tweak this gate in Sandbox Mode"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
          <span>Override</span>
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto flex-1 text-slate-700 text-xs">
        {/* Live Value Gauge & Display */}
        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-slate-600 font-semibold font-mono text-[11px]">Computed Step Value</span>
            <span className={`text-base font-extrabold font-mono ${gateInfo.colorClasses.accent}`}>
              {gateInfo.value.toFixed(4)}
            </span>
          </div>

          {/* Visual Gauge Bar */}
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden relative">
            <div
              className={`h-full ${gateInfo.colorClasses.bg} transition-all duration-300`}
              style={{ width: `${normalizedGauge}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1 font-medium">
            <span>Min ({gateInfo.min})</span>
            <span>Range: [{gateInfo.range}]</span>
            <span>Max ({gateInfo.max})</span>
          </div>
        </div>

        {/* Mathematical Equation Card */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-slate-600">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Mathematical Definition
            </span>
            <button
              onClick={() => onOpenGlossary(selectedGate)}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold underline flex items-center gap-1 cursor-pointer"
            >
              <Info className="w-3 h-3" />
              <span>Glossary Guide</span>
            </button>
          </div>

          <div className="p-3 rounded-lg bg-indigo-50/60 font-mono text-center text-sm border border-indigo-200 text-indigo-950 font-bold shadow-xs">
            {gateInfo.formulaClean}
          </div>
        </div>

        {/* Live Arithmetic Substitution */}
        <div className="space-y-1.5">
          <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
            Step {currentStep.stepIndex} Calculation Breakdown
          </span>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2 font-mono text-[11px] text-slate-800">
            {gateInfo.arithmetic.map((line, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-slate-500 font-semibold shrink-0">Step {idx + 1}:</span>
                <span className="break-all">{line}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Plain-English Intuition */}
        <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200 space-y-1.5">
          <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Intuitive Explanation</span>
          </div>
          <p className="text-amber-900 leading-relaxed font-normal">{gateInfo.description}</p>
        </div>

        {/* Why this Activation Function? */}
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
          <span className="text-slate-800 font-bold text-[11px] block">
            Why {gateInfo.activation}?
          </span>
          <p className="text-slate-600 leading-relaxed font-normal">{gateInfo.whyFunction}</p>
        </div>

        {/* Current Step Immediate Impact */}
        <div className="p-3.5 rounded-lg bg-blue-50/60 border border-blue-200 text-blue-950">
          <span className="text-blue-900 font-bold block mb-1">Impact on Memory:</span>
          <span className="font-medium">{gateInfo.impact}</span>
        </div>
      </div>
    </div>
  );
};
