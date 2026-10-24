import React from 'react';
import { BookOpen, GitCompare, RotateCcw, Sliders } from 'lucide-react';

interface HeaderProps {
  onOpenGlossary: () => void;
  onOpenComparison: () => void;
  onScrollToSandbox: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenGlossary,
  onOpenComparison,
  onScrollToSandbox,
  onReset,
}) => {
  return (
    <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-slate-200/90 shrink-0 sticky top-0 z-40 shadow-xs">
      {/* Zone 1: Brand Wordmark (Single text element) */}
      <a
        href="/"
        className="text-base font-bold tracking-tight text-slate-900 hover:text-indigo-600 transition-colors flex items-center gap-2.5"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-xs shadow-indigo-600/50" />
        <span className="font-sans">LSTM Interactive Visualizer</span>
      </a>

      {/* Zone 2: 4-6 Clean Text Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
        <a href="#schematic" className="hover:text-indigo-600 transition-colors">
          Cell Architecture
        </a>
        <a href="#inspector" className="hover:text-indigo-600 transition-colors">
          Live Inspector
        </a>
        <button
          onClick={onScrollToSandbox}
          className="hover:text-indigo-600 transition-colors text-left cursor-pointer"
        >
          Sandbox Sliders
        </button>
        <button
          onClick={onOpenComparison}
          className="hover:text-indigo-600 transition-colors text-left cursor-pointer"
        >
          RNN vs LSTM
        </button>
        <button
          onClick={onOpenGlossary}
          className="hover:text-indigo-600 transition-colors text-left cursor-pointer"
        >
          Glossary
        </button>
      </nav>

      {/* Zone 3: 1-2 Primary Actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onReset}
          className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Reset sequence to beginning"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        <button
          onClick={onOpenGlossary}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/20 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Glossary Guide</span>
        </button>
      </div>
    </header>
  );
};
