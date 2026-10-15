import React from 'react';
import { CategoryType } from '../types';
import { CATEGORIES } from '../utils/categories';
import { 
  Film, 
  Tv, 
  Music, 
  BookOpen, 
  Gamepad2, 
  StickyNote, 
  Layers 
} from 'lucide-react';

interface CategoryNavProps {
  activeCategory: CategoryType | 'all';
  onSelectCategory: (cat: CategoryType | 'all') => void;
  categoryCounts: Record<CategoryType | 'all', number>;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  activeCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  const getIcon = (cat: CategoryType | 'all') => {
    switch (cat) {
      case 'all': return <Layers className="w-4 h-4" />;
      case 'movies': return <Film className="w-4 h-4" />;
      case 'tv_series': return <Tv className="w-4 h-4" />;
      case 'music': return <Music className="w-4 h-4" />;
      case 'books': return <BookOpen className="w-4 h-4" />;
      case 'games': return <Gamepad2 className="w-4 h-4" />;
      case 'notes': return <StickyNote className="w-4 h-4" />;
    }
  };

  const navItems: Array<{ id: CategoryType | 'all'; label: string; sourceHint?: string }> = [
    { id: 'all', label: 'Všetko' },
    { id: 'movies', label: 'Filmy', sourceHint: 'ČSFD & IMDb' },
    { id: 'tv_series', label: 'Seriály', sourceHint: 'ČSFD & IMDb' },
    { id: 'music', label: 'Hudba', sourceHint: 'Wikipédia' },
    { id: 'books', label: 'Knihy', sourceHint: 'Wikipédia' },
    { id: 'games', label: 'Hry', sourceHint: 'Steam' },
    { id: 'notes', label: 'Poznámky' },
  ];

  return (
    <div className="border-b border-slate-800 bg-slate-900/60 sticky top-[69px] z-20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeCategory === item.id;
            const count = categoryCounts[item.id] || 0;
            return (
              <button
                key={item.id}
                onClick={() => onSelectCategory(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-400'}>
                  {getIcon(item.id)}
                </span>
                <span>{item.label}</span>
                
                {/* Count badge */}
                <span
                  className={`text-[11px] font-mono px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                  }`}
                >
                  {count}
                </span>

                {/* Lookup source indicator */}
                {item.sourceHint && (
                  <span
                    className={`hidden xl:inline text-[10px] px-1.5 py-0.5 rounded font-normal ${
                      isActive
                        ? 'bg-indigo-800/60 text-indigo-100'
                        : 'bg-slate-800/70 text-slate-400 border border-slate-700/50'
                    }`}
                  >
                    {item.sourceHint}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
