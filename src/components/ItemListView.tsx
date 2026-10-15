import React from 'react';
import { CatalogItem } from '../types';
import { CATEGORIES, getStatusText, getStatusBadgeStyle } from '../utils/categories';
import { getCategorySourceActions } from '../utils/externalLinks';
import { 
  Star, 
  Heart, 
  ExternalLink, 
  Film, 
  Tv, 
  Music, 
  BookOpen, 
  Gamepad2, 
  StickyNote,
  ChevronRight
} from 'lucide-react';

interface ItemListViewProps {
  items: CatalogItem[];
  onItemClick: (item: CatalogItem) => void;
  onToggleFavorite: (e: React.MouseEvent, item: CatalogItem) => void;
}

export const ItemListView: React.FC<ItemListViewProps> = ({
  items,
  onItemClick,
  onToggleFavorite,
}) => {
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'movies': return <Film className="w-3.5 h-3.5 text-rose-400" />;
      case 'tv_series': return <Tv className="w-3.5 h-3.5 text-amber-400" />;
      case 'music': return <Music className="w-3.5 h-3.5 text-violet-400" />;
      case 'books': return <BookOpen className="w-3.5 h-3.5 text-emerald-400" />;
      case 'games': return <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />;
      case 'notes': return <StickyNote className="w-3.5 h-3.5 text-amber-400" />;
      default: return null;
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg divide-y divide-slate-800/60">
      {items.map((item) => {
        const categoryMeta = CATEGORIES[item.category];
        const sourceActions = getCategorySourceActions(item.category, item.title, {
          csfdUrl: item.csfdUrl,
          imdbUrl: item.imdbUrl,
          wikipediaUrl: item.wikipediaUrl,
          steamUrl: item.steamUrl,
        });

        return (
          <div
            key={item.id}
            onClick={() => onItemClick(item)}
            className="group flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 hover:bg-slate-800/40 transition-colors cursor-pointer"
          >
            {/* Left part: Poster + Titles + Category */}
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              {/* Thumbnail */}
              <div className="w-12 h-16 rounded-lg bg-slate-950 overflow-hidden shrink-0 border border-slate-800 flex items-center justify-center">
                {item.coverUrl ? (
                  <img
                    src={item.coverUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="p-2">
                    {getCategoryIcon(item.category)}
                  </div>
                )}
              </div>

              {/* Title & Metadata */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-sm text-white group-hover:text-indigo-400 transition-colors truncate">
                    {item.title}
                  </h4>
                  {item.releaseYear && (
                    <span className="text-xs font-mono text-slate-400">
                      ({item.releaseYear})
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${categoryMeta.badgeBg}`}>
                    {getCategoryIcon(item.category)}
                    <span>{categoryMeta.singularLabel}</span>
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 truncate">
                  {item.creatorOrAuthor && (
                    <span className="text-slate-300 font-medium truncate">
                      {item.creatorOrAuthor}
                    </span>
                  )}
                  {item.durationOrPages && (
                    <span className="text-slate-500">
                      • {item.durationOrPages}
                    </span>
                  )}
                  {item.platformOrFormat && (
                    <span className="text-slate-500 hidden sm:inline">
                      • {item.platformOrFormat}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Middle part: Ratings & Status */}
            <div className="flex items-center gap-3 shrink-0 self-start md:self-center pl-15 md:pl-0">
              {/* User Rating */}
              {item.userRating !== undefined ? (
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{item.userRating}/10</span>
                </div>
              ) : (
                <span className="text-xs text-slate-600 hidden lg:inline">Nehodnotené</span>
              )}

              {/* Status */}
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${getStatusBadgeStyle(item.status)}`}>
                {getStatusText(item.category, item.status)}
              </span>

              {/* External Source Pills */}
              <div className="flex items-center gap-1 hidden sm:flex">
                {sourceActions.map((action) => (
                  <a
                    key={action.name}
                    href={action.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    title={action.label}
                    className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded border transition-colors ${action.badgeColor}`}
                  >
                    <span>{action.name}</span>
                    <ExternalLink className="w-2.5 h-2.5 stroke-[2]" />
                  </a>
                ))}
              </div>

              {/* Favorite button */}
              <button
                onClick={(e) => onToggleFavorite(e, item)}
                title={item.isFavorite ? 'Odstrániť z obľúbených' : 'Pridať k obľúbeným'}
                className={`p-1.5 rounded-lg transition-colors ${
                  item.isFavorite
                    ? 'text-pink-400 hover:text-pink-300'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-pink-400' : ''}`} />
              </button>

              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
            </div>

          </div>
        );
      })}
    </div>
  );
};
