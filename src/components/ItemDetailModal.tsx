import React, { useState } from 'react';
import { CatalogItem, ItemStatus } from '../types';
import { CATEGORIES, getStatusText, getStatusBadgeStyle } from '../utils/categories';
import { getCategorySourceActions } from '../utils/externalLinks';
import { 
  X, 
  Star, 
  Heart, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Copy, 
  Clock, 
  Calendar, 
  Tag as TagIcon,
  CheckSquare,
  Square,
  Film,
  Tv,
  Music,
  BookOpen,
  Gamepad2,
  StickyNote
} from 'lucide-react';

interface ItemDetailModalProps {
  item: CatalogItem;
  onClose: () => void;
  onEdit: (item: CatalogItem) => void;
  onDelete: (id: string) => void;
  onDuplicate: (item: CatalogItem) => void;
  onUpdateStatus: (id: string, newStatus: ItemStatus) => void;
  onUpdateRating: (id: string, newRating: number | undefined) => void;
  onToggleFavorite: (id: string) => void;
  onToggleChecklistItem?: (itemId: string, checkId: string) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
  onUpdateStatus,
  onUpdateRating,
  onToggleFavorite,
  onToggleChecklistItem,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const categoryMeta = CATEGORIES[item.category];
  const sourceActions = getCategorySourceActions(item.category, item.title, {
    csfdUrl: item.csfdUrl,
    imdbUrl: item.imdbUrl,
    wikipediaUrl: item.wikipediaUrl,
    steamUrl: item.steamUrl,
  });

  const getStatusOptions = (): ItemStatus[] => {
    switch (item.category) {
      case 'movies':
        return ['completed', 'watching', 'to_watch', 'dropped'];
      case 'tv_series':
        return ['completed', 'watching', 'to_watch', 'dropped'];
      case 'music':
        return ['completed', 'listening', 'to_listen', 'dropped'];
      case 'books':
        return ['completed', 'reading', 'to_read', 'dropped'];
      case 'games':
        return ['completed', 'playing', 'to_play', 'dropped'];
      case 'notes':
        return ['favorite', 'completed', 'to_watch'];
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Top banner with close button */}
        <div className="relative p-5 sm:p-6 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${categoryMeta.badgeBg}`}>
              {categoryMeta.singularLabel}
            </span>
            {item.releaseYear && (
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {item.releaseYear}
              </span>
            )}
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyle(item.status)}`}>
              {getStatusText(item.category, item.status)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleFavorite(item.id)}
              title={item.isFavorite ? 'Odobrať z obľúbených' : 'Pridať do obľúbených'}
              className={`p-2 rounded-xl border transition-colors ${
                item.isFavorite
                  ? 'bg-pink-500/20 text-pink-400 border-pink-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-pink-400' : ''}`} />
            </button>
            <button
              onClick={() => onDuplicate(item)}
              title="Duplikovať túto položku"
              className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(item)}
              title="Upraviť položku"
              className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="Zavrieť"
              className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1">
          
          {/* Main Title, Poster & High-level Info */}
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Poster / Cover Image */}
            {item.coverUrl ? (
              <div className="w-full sm:w-48 sm:h-64 rounded-2xl bg-slate-950 overflow-hidden shrink-0 border border-slate-800 shadow-lg">
                <img
                  src={item.coverUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {item.title}
                </h2>
                {item.originalTitle && item.originalTitle !== item.title && (
                  <p className="text-sm text-slate-400 italic mt-0.5">
                    Pôvodný názov: {item.originalTitle}
                  </p>
                )}

                {item.creatorOrAuthor && (
                  <p className="text-base font-semibold text-indigo-400 mt-2">
                    {item.creatorOrAuthor}
                  </p>
                )}

                {/* Additional category attributes */}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-xs text-slate-400">
                  {item.durationOrPages && (
                    <span className="flex items-center gap-1 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{item.durationOrPages}</span>
                    </span>
                  )}
                  {item.platformOrFormat && (
                    <span>Formát / Platforma: <strong className="text-slate-200">{item.platformOrFormat}</strong></span>
                  )}
                  {item.publisherOrLabel && (
                    <span>Vydavateľstvo: <strong className="text-slate-200">{item.publisherOrLabel}</strong></span>
                  )}
                  {item.seasonsCount && (
                    <span>Série: <strong className="text-slate-200">{item.seasonsCount}</strong></span>
                  )}
                </div>

                {/* Genres */}
                {item.genres && item.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {item.genres.map((g) => (
                      <span
                        key={g}
                        className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/70 font-medium"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Status and User Rating Controls */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
                {/* Rating component */}
                <div>
                  <span className="text-xs text-slate-400 block mb-1.5 font-medium">
                    Moje hodnotenie (1 - 10)
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                      <button
                        key={star}
                        onClick={() => onUpdateRating(item.id, item.userRating === star ? undefined : star)}
                        title={`Ohodnotiť ${star}/10`}
                        className={`p-1 rounded hover:scale-110 transition-transform ${
                          item.userRating && item.userRating >= star
                            ? 'text-amber-400'
                            : 'text-slate-700 hover:text-slate-500'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${item.userRating && item.userRating >= star ? 'fill-amber-400' : ''}`} />
                      </button>
                    ))}
                    {item.userRating && (
                      <span className="text-xs font-bold text-amber-300 ml-1.5">
                        {item.userRating}/10
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Status Changer */}
                <div>
                  <span className="text-xs text-slate-400 block mb-1.5 font-medium">
                    Zmeniť stav
                  </span>
                  <select
                    value={item.status}
                    onChange={(e) => onUpdateStatus(item.id, e.target.value as ItemStatus)}
                    aria-label="Zmeniť stav položky"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    {getStatusOptions().map((opt) => (
                      <option key={opt} value={opt}>
                        {getStatusText(item.category, opt)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* External lookup services action panel (ČSFD, IMDb, Wikipedia, Steam) */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Overiť a otvoriť na externých zdrojoch
              </h4>
              <span className="text-[11px] text-slate-500">
                {categoryMeta.lookupDesc}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {sourceActions.map((action) => (
                <a
                  key={action.name}
                  href={action.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-between p-3 rounded-xl border font-semibold text-xs transition-all ${action.badgeColor}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{action.name}</span>
                    <span className="text-[11px] opacity-80">({action.label})</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>

            {/* External rating display */}
            <div className="flex flex-wrap gap-2 pt-1 text-xs text-slate-400">
              {item.csfdRating && (
                <span className="px-2 py-1 rounded-lg bg-red-950/60 text-red-300 border border-red-800/40">
                  ČSFD Hodnotenie: <strong className="text-white">{item.csfdRating}</strong>
                </span>
              )}
              {item.imdbRating && (
                <span className="px-2 py-1 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-800/40">
                  IMDb Hodnotenie: <strong className="text-white">{item.imdbRating}/10</strong>
                </span>
              )}
              {item.steamRating && (
                <span className="px-2 py-1 rounded-lg bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                  Steam Komunita: <strong className="text-white">{item.steamRating}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Description & Plot */}
          {item.description && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Popis diela / Synopsa
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
                {item.description}
              </p>
            </div>
          )}

          {/* Cast or Tracklist */}
          {item.castOrTracklist && item.castOrTracklist.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                {item.category === 'movies' || item.category === 'tv_series' ? 'Obsadenie (Herci)' : 'Zoznam skladieb / Častí'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {item.castOrTracklist.map((c, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/60"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes & Interactive checklist if category is notes */}
          {item.category === 'notes' && (
            <div className="space-y-4">
              {item.noteContent && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Obsah poznámky
                  </h4>
                  <div className="whitespace-pre-wrap font-sans text-sm text-slate-200 bg-slate-950/60 p-4 rounded-xl border border-slate-800 leading-relaxed">
                    {item.noteContent}
                  </div>
                </div>
              )}

              {item.checklist && item.checklist.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Zoznam úloh a položiek
                  </h4>
                  <div className="space-y-2 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                    {item.checklist.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => onToggleChecklistItem && onToggleChecklistItem(item.id, c.id)}
                        className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-800/50 cursor-pointer transition-colors"
                      >
                        {c.completed ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <span className={`text-sm ${c.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                          {c.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Review / Moja recenzia */}
          {item.userReview && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Moje osobné hodnotenie & poznámka
              </h4>
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-sm text-indigo-100 leading-relaxed italic">
                "{item.userReview}"
              </div>
            </div>
          )}

          {/* User Tags */}
          {item.userTags && item.userTags.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Štítky a kategórie
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {item.userTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-indigo-300 border border-indigo-500/30 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Dates metadata */}
          <div className="text-xs text-slate-500 flex items-center justify-between pt-4 border-t border-slate-800/60">
            <span>Pridané do katalógu: {item.dateAdded}</span>
            {item.dateFinished && <span>Dokončené dňa: {item.dateFinished}</span>}
          </div>

        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-300 font-medium">Naozaj vymazať?</span>
              <button
                onClick={() => onDelete(item.id)}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                Áno, vymazať
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Zrušiť
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Odstrániť položku</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(item)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Upraviť</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-md shadow-indigo-600/30"
            >
              Hotovo
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
