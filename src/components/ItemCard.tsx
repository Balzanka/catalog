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
  Clock,
  Layers
} from 'lucide-react';

interface ItemCardProps {
  item: CatalogItem;
  onClick: (item: CatalogItem) => void;
  onToggleFavorite: (e: React.MouseEvent, item: CatalogItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onClick,
  onToggleFavorite,
}) => {
  const categoryMeta = CATEGORIES[item.category];
  const sourceActions = getCategorySourceActions(item.category, item.title, {
    csfdUrl: item.csfdUrl,
    imdbUrl: item.imdbUrl,
    wikipediaUrl: item.wikipediaUrl,
    steamUrl: item.steamUrl,
  });

  const getFallbackIcon = () => {
    switch (item.category) {
      case 'movies': return <Film className="w-12 h-12 text-rose-500/40" />;
      case 'tv_series': return <Tv className="w-12 h-12 text-amber-500/40" />;
      case 'music': return <Music className="w-12 h-12 text-violet-500/40" />;
      case 'books': return <BookOpen className="w-12 h-12 text-emerald-500/40" />;
      case 'games': return <Gamepad2 className="w-12 h-12 text-cyan-500/40" />;
      case 'notes': return <StickyNote className="w-12 h-12 text-amber-500/40" />;
    }
  };

  return (
    <div
      onClick={() => onClick(item)}
      className="group relative flex flex-col rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/50 shadow-md hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-200 cursor-pointer overflow-hidden"
    >
      {/* Top Media Image or Category Backdrop */}
      <div className="relative aspect-[16/10] sm:aspect-[16/11] w-full bg-slate-950 overflow-hidden flex items-center justify-center">
        {item.coverUrl ? (
          <img
            src={item.coverUrl}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Hide broken image and show fallback icon
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 p-4 text-center">
            {getFallbackIcon()}
            <span className="mt-2 text-xs text-slate-500 font-medium">
              {categoryMeta.label}
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/30 pointer-events-none" />

        {/* Category Pill */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border shadow-sm backdrop-blur-md ${categoryMeta.badgeBg}`}>
            {categoryMeta.singularLabel}
          </span>
          {item.releaseYear && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/60 text-slate-300 border border-white/10 backdrop-blur-md">
              {item.releaseYear}
            </span>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => onToggleFavorite(e, item)}
          title={item.isFavorite ? 'Odstrániť z obľúbených' : 'Pridať k obľúbeným'}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-transform active:scale-90 ${
            item.isFavorite
              ? 'bg-pink-600/90 text-white shadow-lg shadow-pink-600/30'
              : 'bg-black/50 text-slate-400 hover:text-white hover:bg-black/70'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-white' : ''}`} />
        </button>

        {/* Ratings overlay at bottom-left of image */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
          {item.userRating !== undefined && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md text-xs font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{item.userRating}/10</span>
            </div>
          )}

          {/* External ratings */}
          {item.csfdRating && (
            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-700/50 backdrop-blur-md">
              ČSFD: {item.csfdRating}
            </span>
          )}
          {item.imdbRating && (
            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-700/50 backdrop-blur-md">
              IMDb: {item.imdbRating}
            </span>
          )}
          {item.steamRating && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 backdrop-blur-md truncate max-w-[120px]">
              Steam
            </span>
          )}
        </div>

        {/* Status Chip bottom-right of image */}
        <div className="absolute bottom-2 right-2">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border backdrop-blur-md shadow-sm ${getStatusBadgeStyle(item.status)}`}>
            {getStatusText(item.category, item.status)}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title & original title */}
          <h3 className="font-bold text-base text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
            {item.title}
          </h3>
          {item.originalTitle && item.originalTitle !== item.title && (
            <p className="text-xs text-slate-400 italic line-clamp-1">
              {item.originalTitle}
            </p>
          )}

          {/* Creator / Author / Artist */}
          {item.creatorOrAuthor && (
            <p className="text-xs text-slate-300 font-medium mt-1">
              {item.creatorOrAuthor}
            </p>
          )}

          {/* Description snippet */}
          {item.description && (
            <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}

          {/* Specific notes/checklist indicator */}
          {item.category === 'notes' && item.checklist && item.checklist.length > 0 && (
            <div className="mt-2 text-xs text-amber-300/90 font-medium flex items-center gap-1">
              <span>Úlohy: {item.checklist.filter(c => c.completed).length} / {item.checklist.length} hotovo</span>
            </div>
          )}

          {/* Genres or tags */}
          {item.genres && item.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2.5">
              {item.genres.slice(0, 3).map((genre) => (
                <span
                  key={genre}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/50"
                >
                  {genre}
                </span>
              ))}
              {item.genres.length > 3 && (
                <span className="text-[10px] text-slate-500 self-center">
                  +{item.genres.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Card Footer: External Source Deep Links (ČSFD, IMDb, Wikipedia, Steam) */}
        <div className="mt-4 pt-3 border-t border-slate-800/70 flex items-center justify-between gap-1.5 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {sourceActions.map((action) => (
              <a
                key={action.name}
                href={action.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                title={action.label}
                className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border transition-colors ${action.badgeColor}`}
              >
                <span>{action.name}</span>
                <ExternalLink className="w-2.5 h-2.5 stroke-[2.5]" />
              </a>
            ))}
          </div>

          {/* Progress / Format detail if available */}
          {item.durationOrPages && (
            <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>{item.durationOrPages}</span>
            </span>
          )}
        </div>

      </div>
    </div>
  );
};
