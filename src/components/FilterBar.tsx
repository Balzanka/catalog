import React from 'react';
import { 
  SlidersHorizontal, 
  Heart, 
  ArrowUpDown, 
  LayoutGrid, 
  List, 
  Tag as TagIcon,
  X
} from 'lucide-react';
import { CategoryType } from '../types';

export type SortOption = 'newest' | 'rating_desc' | 'title_asc' | 'title_desc' | 'year_desc' | 'year_asc';
export type StatusFilterOption = 'all' | 'completed' | 'in_progress' | 'to_do';

interface FilterBarProps {
  activeCategory: CategoryType | 'all';
  statusFilter: StatusFilterOption;
  onStatusFilterChange: (status: StatusFilterOption) => void;
  favoritesOnly: boolean;
  onToggleFavorites: () => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  availableTags: string[];
  totalFilteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  activeCategory,
  statusFilter,
  onStatusFilterChange,
  favoritesOnly,
  onToggleFavorites,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  selectedTag,
  onSelectTag,
  availableTags,
  totalFilteredCount,
}) => {
  return (
    <div className="bg-slate-900/40 border-b border-slate-800/60 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Status filter pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => onStatusFilterChange('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'all'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Všetky stavy
            </button>
            <button
              onClick={() => onStatusFilterChange('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'completed'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Dokončené
            </button>
            <button
              onClick={() => onStatusFilterChange('in_progress')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'in_progress'
                  ? 'bg-sky-950/80 text-sky-300 border border-sky-700/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Aktuálne rozpracované
            </button>
            <button
              onClick={() => onStatusFilterChange('to_do')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'to_do'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-700/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              V pláne (Chcem)
            </button>

            {/* Favorites toggle */}
            <button
              onClick={onToggleFavorites}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                favoritesOnly
                  ? 'bg-pink-950/80 text-pink-300 border border-pink-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-pink-400 text-pink-400' : ''}`} />
              <span>Iba obľúbené</span>
            </button>
          </div>

          {/* Right controls: Sorting, Tags, Grid/List view */}
          <div className="flex items-center gap-2">
            
            {/* Tag filter dropdown if tags exist */}
            {availableTags.length > 0 && (
              <div className="relative">
                <select
                  value={selectedTag || ''}
                  onChange={(e) => onSelectTag(e.target.value || null)}
                  className="px-2.5 py-1.5 pr-7 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer appearance-none"
                >
                  <option value="">Všetky štítky</option>
                  {availableTags.map((tag) => (
                    <option key={tag} value={tag}>
                      #{tag}
                    </option>
                  ))}
                </select>
                <TagIcon className="w-3 h-3 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}

            {/* Sort selector */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                aria-label="Zoradiť podľa"
                className="px-2.5 py-1.5 pr-7 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer appearance-none"
              >
                <option value="newest">Najnovšie pridané</option>
                <option value="rating_desc">Najvyššie hodnotenie</option>
                <option value="title_asc">Názov (A - Z)</option>
                <option value="title_desc">Názov (Z - A)</option>
                <option value="year_desc">Rok vydania (od najnovšieho)</option>
                <option value="year_asc">Rok vydania (od najstaršieho)</option>
              </select>
              <ArrowUpDown className="w-3 h-3 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Mriežkové zobrazenie"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  viewMode === 'list'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Zoznamové zobrazenie"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Selected tag pill banner */}
        {selectedTag && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/40 text-xs text-slate-400">
            <span>Filtrované podľa štítku:</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
              #{selectedTag}
              <button
                onClick={() => onSelectTag(null)}
                className="hover:text-white p-0.5"
                title="Zrušiť filter štítku"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          </div>
        )}

      </div>
    </div>
  );
};
