import React from 'react';
import { CatalogItem } from '../types';
import { CATEGORIES } from '../utils/categories';
import { 
  X, 
  BarChart3, 
  Star, 
  Heart, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Film, 
  Tv, 
  Music, 
  BookOpen, 
  Gamepad2, 
  StickyNote,
  Award
} from 'lucide-react';

interface StatsViewProps {
  items: CatalogItem[];
  onClose: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({ items, onClose }) => {
  const total = items.length;
  
  // Category counts
  const categoryCounts: Record<string, number> = {
    movies: items.filter(i => i.category === 'movies').length,
    tv_series: items.filter(i => i.category === 'tv_series').length,
    music: items.filter(i => i.category === 'music').length,
    books: items.filter(i => i.category === 'books').length,
    games: items.filter(i => i.category === 'games').length,
    notes: items.filter(i => i.category === 'notes').length,
  };

  // Completed items
  const completedCount = items.filter(i => i.status === 'completed').length;
  const inProgressCount = items.filter(i => ['watching', 'reading', 'listening', 'playing'].includes(i.status)).length;
  const plannedCount = items.filter(i => ['to_watch', 'to_read', 'to_listen', 'to_play'].includes(i.status)).length;
  const favoritesCount = items.filter(i => i.isFavorite).length;

  // Average rating
  const ratedItems = items.filter(i => i.userRating !== undefined);
  const avgRating = ratedItems.length > 0
    ? (ratedItems.reduce((acc, i) => acc + (i.userRating || 0), 0) / ratedItems.length).toFixed(1)
    : '0';

  // Top genres
  const genreFrequency: Record<string, number> = {};
  items.forEach(item => {
    item.genres?.forEach(g => {
      genreFrequency[g] = (genreFrequency[g] || 0) + 1;
    });
  });
  const topGenres = Object.entries(genreFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Štatistiky a prehľad zbierky
              </h2>
              <p className="text-xs text-slate-400">
                Detailný pohľad na váš osobný katalóg a aktivitu.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Main metric grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-xs text-slate-400 font-medium block">Celkovo položiek</span>
              <span className="text-2xl font-black text-white mt-1 block font-mono">{total}</span>
              <span className="text-[10px] text-indigo-400 mt-1 block">v 6 kategóriách</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-xs text-slate-400 font-medium block">Dokončené</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block font-mono">{completedCount}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">
                {total > 0 ? `${Math.round((completedCount / total) * 100)}% z katalógu` : '0%'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-xs text-slate-400 font-medium block">Priemerné hodnotenie</span>
              <span className="text-2xl font-black text-amber-400 mt-1 flex items-center gap-1 font-mono">
                <Star className="w-5 h-5 fill-amber-400" />
                <span>{avgRating}</span>
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">{ratedItems.length} hodnotených</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-xs text-slate-400 font-medium block">Obľúbené srdcovky</span>
              <span className="text-2xl font-black text-pink-400 mt-1 flex items-center gap-1 font-mono">
                <Heart className="w-5 h-5 fill-pink-400" />
                <span>{favoritesCount}</span>
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">označených</span>
            </div>
          </div>

          {/* Breakdown by Category */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Rozdelenie podľa kategórií
            </h3>

            {/* Proportion Bar */}
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
              {total > 0 && (
                <>
                  <div style={{ width: `${(categoryCounts.movies / total) * 100}%` }} className="bg-rose-500 h-full" title={`Filmy: ${categoryCounts.movies}`} />
                  <div style={{ width: `${(categoryCounts.tv_series / total) * 100}%` }} className="bg-amber-500 h-full" title={`Seriály: ${categoryCounts.tv_series}`} />
                  <div style={{ width: `${(categoryCounts.music / total) * 100}%` }} className="bg-violet-500 h-full" title={`Hudba: ${categoryCounts.music}`} />
                  <div style={{ width: `${(categoryCounts.books / total) * 100}%` }} className="bg-emerald-500 h-full" title={`Knihy: ${categoryCounts.books}`} />
                  <div style={{ width: `${(categoryCounts.games / total) * 100}%` }} className="bg-cyan-500 h-full" title={`Hry: ${categoryCounts.games}`} />
                  <div style={{ width: `${(categoryCounts.notes / total) * 100}%` }} className="bg-amber-300 h-full" title={`Poznámky: ${categoryCounts.notes}`} />
                </>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900 border border-slate-800/80">
                <Film className="w-4 h-4 text-rose-400" />
                <div>
                  <span className="text-xs text-slate-300 font-bold block">Filmy (ČSFD/IMDb)</span>
                  <span className="text-[11px] font-mono text-slate-400">{categoryCounts.movies} ks</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900 border border-slate-800/80">
                <Tv className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="text-xs text-slate-300 font-bold block">Seriály (ČSFD/IMDb)</span>
                  <span className="text-[11px] font-mono text-slate-400">{categoryCounts.tv_series} ks</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900 border border-slate-800/80">
                <Music className="w-4 h-4 text-violet-400" />
                <div>
                  <span className="text-xs text-slate-300 font-bold block">Hudba (Wikipédia)</span>
                  <span className="text-[11px] font-mono text-slate-400">{categoryCounts.music} ks</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900 border border-slate-800/80">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-xs text-slate-300 font-bold block">Knihy (Wikipédia)</span>
                  <span className="text-[11px] font-mono text-slate-400">{categoryCounts.books} ks</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900 border border-slate-800/80">
                <Gamepad2 className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="text-xs text-slate-300 font-bold block">Hry (Steam)</span>
                  <span className="text-[11px] font-mono text-slate-400">{categoryCounts.games} ks</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900 border border-slate-800/80">
                <StickyNote className="w-4 h-4 text-amber-300" />
                <div>
                  <span className="text-xs text-slate-300 font-bold block">Poznámky & zoznamy</span>
                  <span className="text-[11px] font-mono text-slate-400">{categoryCounts.notes} ks</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Genres */}
          {topGenres.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-400" />
                <span>Najčastejšie žánre v katalógu</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {topGenres.map(([genre, count]) => (
                  <div
                    key={genre}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                  >
                    <span className="text-white font-medium">{genre}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {count}x
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
          >
            Zavrieť prehľad
          </button>
        </div>

      </div>
    </div>
  );
};
