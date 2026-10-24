import React from 'react';
import { X, GitCompare, CheckCircle2, XCircle } from 'lucide-react';

interface RnnComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RnnComparisonModal: React.FC<RnnComparisonModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Architectural Evolution: Vanilla RNN vs. LSTM
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Why LSTMs conquered long-term dependencies and replaced standard recurrent units
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          {/* Side by side comparison cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Vanilla RNN Card */}
            <div className="p-5 rounded-xl bg-red-50/50 border border-red-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-red-900">Vanilla RNN (1986)</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-100 text-red-800 border border-red-200">
                  Single Recurrent Loop
                </span>
              </div>

              <div className="p-3 rounded-lg bg-white font-mono text-center text-red-950 font-bold text-xs border border-red-200 shadow-2xs">
                h_t = tanh(W_hh · h_(t-1) + W_xh · x_t + b)
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2 text-slate-700">
                  <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-red-950">Vanishing Gradient:</strong> Gradients must pass through repeated matrix multiplications (W^T)^k. As sequence length k increases, gradients shrink to 0 exponentially.
                  </span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-red-950">Short Context Window:</strong> In practice, vanilla RNNs forget information after only 5 to 10 time steps.
                  </span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-red-950">No Selective Erase:</strong> Every new token completely overwrites the hidden state via non-linear tanh squashing.
                  </span>
                </div>
              </div>
            </div>

            {/* LSTM Card */}
            <div className="p-5 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-emerald-900">LSTM (Hochreiter & Schmidhuber, 1997)</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Dual-Track Gated Highway
                </span>
              </div>

              <div className="p-3 rounded-lg bg-white font-mono text-center text-emerald-950 font-bold text-xs border border-emerald-200 shadow-2xs">
                C_t = (f_t ⊙ C_(t-1)) + (i_t ⊙ C̃_t)
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-emerald-950">Constant Error Carousel:</strong> The linear additive highway (+) allows backpropagated gradients to travel across 100+ steps without exponential decay.
                  </span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-emerald-950">Fine-Grained Gate Control:</strong> Three distinct sigmoid gates (Forget, Input, Output) allow independent control of reading, writing, and erasing memories.
                  </span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-emerald-950">Separation of State:</strong> Long-term memory (Cell State C_t) is decoupled from active working output (Hidden State h_t).
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mathematical Proof Comparison */}
          <div className="p-4.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Mathematical Backpropagation Gradient Flow
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700 font-mono text-[11px]">
              <div className="p-3.5 bg-white rounded-lg border border-slate-200 space-y-1 shadow-2xs">
                <span className="text-red-700 font-bold block">Vanilla RNN Gradient:</span>
                <p className="font-semibold text-slate-900">∂h_T / ∂h_1 = ∏ (W_hh^T · diag(1 - tanh²(...)))</p>
                <p className="text-slate-500 text-[10px]">Matrix powers W^k lead to exponential vanishing if largest eigenvalue &lt; 1.</p>
              </div>

              <div className="p-3.5 bg-white rounded-lg border border-slate-200 space-y-1 shadow-2xs">
                <span className="text-emerald-700 font-bold block">LSTM Gradient Highway:</span>
                <p className="font-semibold text-slate-900">∂C_T / ∂C_1 ≈ ∏ f_t</p>
                <p className="text-slate-500 text-[10px]">No weight matrix multiplication! If forget gates f_t ≈ 1, gradient flow is 1.0 (constant).</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-900 text-white transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
