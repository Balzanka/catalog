import React from 'react';
import { 
  Plus, 
  BarChart3, 
  Download, 
  RotateCcw, 
  Search, 
  FolderHeart,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAddModal: () => void;
  onOpenStatsModal: () => void;
  onOpenBackupModal: () => void;
  onResetData: () => void;
  totalItemsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenStatsModal,
  onOpenBackupModal,
  onResetData,
  totalItemsCount,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo & title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
                <FolderHeart className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-white">
                    Môj Katalóg
                  </h1>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                    {totalItemsCount} {totalItemsCount === 1 ? 'položka' : totalItemsCount >= 2 && totalItemsCount <= 4 ? 'položky' : 'položiek'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Evidencia s prepojením na <span className="text-red-400 font-medium">ČSFD</span>, <span className="text-amber-400 font-medium">IMDb</span>, <span className="text-sky-400 font-medium">Wikipédiu</span> a <span className="text-cyan-400 font-medium">Steam</span>
                </p>
              </div>
            </div>

            {/* Mobile Add CTA */}
            <button
              onClick={onOpenAddModal}
              className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Pridať</span>
            </button>
          </div>

          {/* Search bar & Action tools */}
          <div className="flex items-center gap-2.5 flex-1 md:max-w-xl md:justify-end">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Hľadať podľa názvu, autora, žánru, značiek..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-1 py-0.5"
                  title="Vymazať vyhľadávanie"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={onOpenStatsModal}
                title="Prehľad a štatistiky zbierky"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs font-medium"
              >
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Štatistiky</span>
              </button>

              <button
                onClick={onOpenBackupModal}
                title="Zálohovanie a import"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs font-medium"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Záloha</span>
              </button>

              {/* Desktop primary Add CTA */}
              <button
                onClick={onOpenAddModal}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Pridať položku</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
