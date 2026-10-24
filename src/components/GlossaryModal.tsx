import React, { useState } from 'react';
import { X, BookOpen, Zap } from 'lucide-react';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
}

interface GlossaryEntry {
  id: string;
  term: string;
  symbol: string;
  category: 'Function' | 'Operation' | 'Architecture' | 'Theory';
  formula?: string;
  summary: string;
  analogy: string;
  deepDive: string;
}

const GLOSSARY_ENTRIES: GlossaryEntry[] = [
  {
    id: 'sigmoid',
    term: 'Sigmoid Activation Function',
    symbol: 'σ(z)',
    category: 'Function',
    formula: 'σ(z) = 1 / (1 + e^(-z))',
    summary: 'A smooth non-linear squashing function that maps any real number into the range [0, 1].',
    analogy: 'A water valve or dimmer switch: 0 means completely closed/shut off, 1 means 100% open, and 0.5 means half-open.',
    deepDive:
      'In LSTMs, sigmoid is chosen specifically for the three gates (Forget, Input, and Output). Because its output is bounded strictly between 0 and 1, multiplying a signal by a sigmoid output acts as a soft percentage throttle.',
  },
  {
    id: 'tanh',
    term: 'Hyperbolic Tangent Function',
    symbol: 'tanh(z)',
    category: 'Function',
    formula: 'tanh(z) = (e^z - e^(-z)) / (e^z + e^(-z))',
    summary: 'A zero-centered S-shaped curve that maps any input into the range [-1.0, +1.0].',
    analogy: 'A steering wheel that can turn left (-1), stay neutral (0), or turn right (+1).',
    deepDive:
      'tanh is used in the Candidate Gate (C̃_t) and before the hidden state output. Because it ranges between -1 and +1, it allows the network to both increase (+ values) and decrease (- values) the stored cell state. A sigmoid could never subtract from memory!',
  },
  {
    id: 'hadamard',
    term: 'Element-wise Multiplication (Hadamard Product)',
    symbol: 'A ⊙ B',
    category: 'Operation',
    formula: '(A ⊙ B)_i = A_i × B_i',
    summary: 'Multiplying two vectors entry-by-entry rather than taking a matrix dot product.',
    analogy: 'Applying sunglasses to your eyes: each lens filters the light passing straight through that exact lens.',
    deepDive:
      'When the Forget Gate vector f_t multiplies the prior Cell State C_(t-1), each memory neuron is individually scaled by its own gate valve without mixing across different neuron dimensions.',
  },
  {
    id: 'pointwise_add',
    term: 'Point-wise Addition',
    symbol: 'A ⊕ B',
    category: 'Operation',
    formula: 'C_t = (f_t ⊙ C_(t-1)) + (i_t ⊙ C̃_t)',
    summary: 'Element-by-element summation of the retained old memory and the new admitted candidate memory.',
    analogy: 'Dropping a new deposit into an existing bank account balance.',
    deepDive:
      'The linear addition (+) is the secret to solving the Vanishing Gradient problem. Unlike standard RNNs which repeatedly multiply weight matrices W across time, addition preserves gradients during backpropagation.',
  },
  {
    id: 'concatenation',
    term: 'Vector Concatenation',
    symbol: '[h_(t-1), x_t]',
    category: 'Operation',
    formula: '[h_(t-1), x_t] = [h_1, ..., h_m, x_1, ..., x_n]^T',
    summary: 'Stacking the previous hidden state vector and the current input vector end-to-end into a single combined vector.',
    analogy: 'Merging yesterday’s diary entry with today’s weather report so you can decide what to wear.',
    deepDive:
      'Concatenating allows all four gates to evaluate the full contextual picture: what just happened (h_(t-1)) combined with what is happening right now (x_t).',
  },
  {
    id: 'cell_vs_hidden',
    term: 'Cell State (C_t) vs Hidden State (h_t)',
    symbol: 'C_t vs h_t',
    category: 'Architecture',
    summary: 'The difference between long-term conveyor belt memory and short-term working memory.',
    analogy: 'Cell State is your subconscious long-term memory; Hidden State is the specific thought currently in your conscious working mind.',
    deepDive:
      'Cell State (C_t) travels undisturbed across time with only linear additions and subtractions. Hidden State (h_t) is filtered via the Output Gate (o_t ⊙ tanh(C_t)) to expose only what is needed for the immediate token prediction.',
  },
  {
    id: 'vanishing_gradient',
    term: 'The Vanishing Gradient Problem',
    symbol: '∂L / ∂h_0 → 0',
    category: 'Theory',
    formula: '∂C_t / ∂C_(t-1) = f_t',
    summary: 'In vanilla RNNs, repeated matrix multiplications during Backpropagation Through Time (BPTT) cause gradients to shrink exponentially to zero.',
    analogy: 'Making a photocopy of a photocopy 50 times until the image fades into blank white paper.',
    deepDive:
      'In LSTM, the gradient error carousel flows through the linear cell state: ∂C_t / ∂C_(t-1) = f_t. If f_t ≈ 1, the gradient flows backward completely unimpeded across 100+ steps without exponential decay!',
  },
];

export const GlossaryModal: React.FC<GlossaryModalProps> = ({
  isOpen,
  onClose,
  initialTopic,
}) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    initialTopic || GLOSSARY_ENTRIES[0].id
  );

  if (!isOpen) return null;

  const currentEntry =
    GLOSSARY_ENTRIES.find((e) => e.id === selectedTopicId) || GLOSSARY_ENTRIES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                LSTM Mathematical & Architectural Glossary
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Intuitive breakdowns of key sequence modeling concepts
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

        {/* Body: Split Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3">
          {/* Left Column: Topics List */}
          <div className="border-r border-slate-200 overflow-y-auto p-3 space-y-1 bg-slate-50/70">
            {GLOSSARY_ENTRIES.map((entry) => {
              const isSelected = entry.id === selectedTopicId;
              return (
                <button
                  key={entry.id}
                  onClick={() => setSelectedTopicId(entry.id)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex flex-col gap-0.5 border cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-bold shadow-2xs'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{entry.term}</span>
                    <span className="font-mono text-[10px] text-slate-500">{entry.symbol}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{entry.category}</span>
                </button>
              );
            })}
          </div>

          {/* Right Column: Deep Dive Display */}
          <div className="col-span-2 overflow-y-auto p-6 space-y-5 bg-white text-slate-700 text-xs">
            {/* Title & Badge */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {currentEntry.category}
                </span>
                <span className="font-mono text-slate-500 font-bold">{currentEntry.symbol}</span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">{currentEntry.term}</h3>
            </div>

            {/* Formula Block */}
            {currentEntry.formula && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-indigo-950 text-sm text-center font-bold">
                {currentEntry.formula}
              </div>
            )}

            {/* Quick Summary */}
            <div className="space-y-1">
              <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                Summary
              </h4>
              <p className="text-slate-700 leading-relaxed text-xs font-normal">{currentEntry.summary}</p>
            </div>

            {/* Intuitive Real-World Analogy */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>Intuitive Analogy</span>
              </div>
              <p className="text-amber-950 leading-relaxed text-xs">{currentEntry.analogy}</p>
            </div>

            {/* Deep Technical Explanation */}
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                Mathematical & Architectural Significance
              </h4>
              <p className="text-slate-700 leading-relaxed text-xs font-normal">{currentEntry.deepDive}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-900 text-white transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
