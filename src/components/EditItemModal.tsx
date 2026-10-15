import React, { useState } from 'react';
import { CatalogItem, ItemStatus } from '../types';
import { CATEGORIES } from '../utils/categories';
import { getCsfdSearchUrl, getImdbSearchUrl, getWikipediaSearchUrl, getSteamSearchUrl } from '../utils/externalLinks';
import { 
  X, 
  Search, 
  Loader2, 
  Sparkles, 
  Star,
  Plus,
  Trash2,
  Check
} from 'lucide-react';

interface EditItemModalProps {
  item: CatalogItem;
  onClose: () => void;
  onSave: (updatedItem: CatalogItem) => void;
}

export const EditItemModal: React.FC<EditItemModalProps> = ({
  item,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(item.title);
  const [originalTitle, setOriginalTitle] = useState(item.originalTitle || '');
  const [creatorOrAuthor, setCreatorOrAuthor] = useState(item.creatorOrAuthor || '');
  const [releaseYear, setReleaseYear] = useState<string>(item.releaseYear ? String(item.releaseYear) : '');
  const [genresInput, setGenresInput] = useState(item.genres ? item.genres.join(', ') : '');
  const [coverUrl, setCoverUrl] = useState(item.coverUrl || '');
  const [description, setDescription] = useState(item.description || '');
  const [durationOrPages, setDurationOrPages] = useState(item.durationOrPages || '');
  const [platformOrFormat, setPlatformOrFormat] = useState(item.platformOrFormat || '');
  const [publisherOrLabel, setPublisherOrLabel] = useState(item.publisherOrLabel || '');
  const [castOrTracksInput, setCastOrTracksInput] = useState(item.castOrTracklist ? item.castOrTracklist.join(', ') : '');

  // External links
  const [csfdUrl, setCsfdUrl] = useState(item.csfdUrl || '');
  const [csfdRating, setCsfdRating] = useState(item.csfdRating ? String(item.csfdRating) : '');
  const [imdbUrl, setImdbUrl] = useState(item.imdbUrl || '');
  const [imdbRating, setImdbRating] = useState(item.imdbRating ? String(item.imdbRating) : '');
  const [wikipediaUrl, setWikipediaUrl] = useState(item.wikipediaUrl || '');
  const [steamUrl, setSteamUrl] = useState(item.steamUrl || '');
  const [steamRating, setSteamRating] = useState(item.steamRating || '');

  // Status & User evaluation
  const [status, setStatus] = useState<ItemStatus>(item.status);
  const [userRating, setUserRating] = useState<number | undefined>(item.userRating);
  const [isFavorite, setIsFavorite] = useState(item.isFavorite);
  const [userReview, setUserReview] = useState(item.userReview || '');
  const [userTagsInput, setUserTagsInput] = useState(item.userTags ? item.userTags.join(', ') : '');

  // Notes
  const [noteContent, setNoteContent] = useState(item.noteContent || '');
  const [checklist, setChecklist] = useState(item.checklist || []);
  const [newChecklistText, setNewChecklistText] = useState('');

  // Lookup refresher
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  const currentCategoryMeta = CATEGORIES[item.category];

  const handleRefreshLookup = async () => {
    if (!title.trim()) return;
    setIsRefreshing(true);
    setRefreshMessage(null);

    try {
      const response = await fetch('/api/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: title.trim(), category: item.category }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.csfdUrl && !csfdUrl) setCsfdUrl(data.csfdUrl);
        if (data.csfdRating && !csfdRating) setCsfdRating(data.csfdRating);
        if (data.imdbUrl && !imdbUrl) setImdbUrl(data.imdbUrl);
        if (data.imdbRating && !imdbRating) setImdbRating(data.imdbRating);
        if (data.wikipediaUrl && !wikipediaUrl) setWikipediaUrl(data.wikipediaUrl);
        if (data.steamUrl && !steamUrl) setSteamUrl(data.steamUrl);
        if (data.steamRating && !steamRating) setSteamRating(data.steamRating);
        if (data.coverUrl && !coverUrl) setCoverUrl(data.coverUrl);
        if (data.description && !description) setDescription(data.description);
        setRefreshMessage(`Údaje boli doplnené (${data.sourceName || 'zdroj'})`);
      }
    } catch (e) {
      setRefreshMessage('Dáta sa nepodarilo automaticky doplniť.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setChecklist([
      ...checklist,
      { id: 'c_' + Date.now(), text: newChecklistText.trim(), completed: false },
    ]);
    setNewChecklistText('');
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(checklist.filter(c => c.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Zadajte názov položky.');
      return;
    }

    const genres = genresInput
      .split(',')
      .map(g => g.trim())
      .filter(Boolean);

    const userTags = userTagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const castOrTracklist = castOrTracksInput
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    const updated: CatalogItem = {
      ...item,
      title: title.trim(),
      originalTitle: originalTitle.trim() || undefined,
      creatorOrAuthor: creatorOrAuthor.trim() || undefined,
      releaseYear: releaseYear.trim() || undefined,
      genres: genres.length > 0 ? genres : undefined,
      coverUrl: coverUrl.trim() || undefined,
      description: description.trim() || undefined,

      csfdUrl: csfdUrl.trim() || undefined,
      csfdRating: csfdRating.trim() || undefined,
      imdbUrl: imdbUrl.trim() || undefined,
      imdbRating: imdbRating.trim() || undefined,
      wikipediaUrl: wikipediaUrl.trim() || undefined,
      steamUrl: steamUrl.trim() || undefined,
      steamRating: steamRating.trim() || undefined,

      status,
      userRating,
      isFavorite,
      userReview: userReview.trim() || undefined,
      userTags,
      durationOrPages: durationOrPages.trim() || undefined,
      platformOrFormat: platformOrFormat.trim() || undefined,
      publisherOrLabel: publisherOrLabel.trim() || undefined,
      castOrTracklist: castOrTracklist.length > 0 ? castOrTracklist : undefined,

      noteContent: item.category === 'notes' ? noteContent.trim() || undefined : undefined,
      checklist: item.category === 'notes' ? checklist : undefined,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Upraviť položku: <span className="text-indigo-400">{item.title}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Kategória: <strong className="text-slate-200">{currentCategoryMeta.label}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 overflow-y-auto space-y-5 flex-1">
          
          {/* Quick lookup refresh button */}
          {item.category !== 'notes' && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20">
              <span className="text-xs text-indigo-200 font-medium">
                Chcete doplniť chýbajúce údaje z {currentCategoryMeta.lookupSources.join(' & ')}?
              </span>
              <button
                type="button"
                onClick={handleRefreshLookup}
                disabled={isRefreshing}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                {isRefreshing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Doplniť informácie</span>
              </button>
            </div>
          )}

          {refreshMessage && (
            <p className="text-xs text-emerald-300 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>{refreshMessage}</span>
            </p>
          )}

          {/* Titles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Názov položky *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Pôvodný názov
              </label>
              <input
                type="text"
                value={originalTitle}
                onChange={(e) => setOriginalTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
              />
            </div>
          </div>

          {/* Creator & Year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Autor / Tvorca / Režisér / Umelec
              </label>
              <input
                type="text"
                value={creatorOrAuthor}
                onChange={(e) => setCreatorOrAuthor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Rok vydania
              </label>
              <input
                type="text"
                value={releaseYear}
                onChange={(e) => setReleaseYear(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
              />
            </div>
          </div>

          {/* Cover image */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Odkaz na obálku (Cover URL)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
              />
              {coverUrl && (
                <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                  <img src={coverUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Genres & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Žánre (oddelené čiarkou)
              </label>
              <input
                type="text"
                value={genresInput}
                onChange={(e) => setGenresInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Dĺžka / Počet strán / Herný čas
              </label>
              <input
                type="text"
                value={durationOrPages}
                onChange={(e) => setDurationOrPages(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Popis diela / Synopsa
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
            />
          </div>

          {/* External links */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Odkazy na zdroje
            </h4>
            {(item.category === 'movies' || item.category === 'tv_series') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-red-300 block mb-1">ČSFD URL</label>
                  <input
                    type="url"
                    value={csfdUrl}
                    onChange={(e) => setCsfdUrl(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-amber-300 block mb-1">IMDb URL</label>
                  <input
                    type="url"
                    value={imdbUrl}
                    onChange={(e) => setImdbUrl(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>
            )}
            {(item.category === 'music' || item.category === 'books') && (
              <div>
                <label className="text-[11px] font-semibold text-sky-300 block mb-1">Wikipédia URL</label>
                <input
                  type="url"
                  value={wikipediaUrl}
                  onChange={(e) => setWikipediaUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
            )}
            {item.category === 'games' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-cyan-300 block mb-1">Steam Store URL</label>
                  <input
                    type="url"
                    value={steamUrl}
                    onChange={(e) => setSteamUrl(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-cyan-300 block mb-1">Steam Hodnotenie</label>
                  <input
                    type="text"
                    value={steamRating}
                    onChange={(e) => setSteamRating(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes content */}
          {item.category === 'notes' && (
            <div className="space-y-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block">Obsah poznámky</label>
              <textarea
                rows={4}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white font-mono text-xs"
              />
              {/* Checklist */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Úlohy a položky</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    placeholder="Pridať úlohu..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddChecklistItem}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
                  >
                    Pridať
                  </button>
                </div>
                {checklist.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-1.5 rounded bg-slate-900 text-xs text-slate-300 mb-1">
                    <span>{c.text}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(c.id)}
                      className="text-rose-400 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evaluation & Status */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Moje hodnotenie a stav
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Stav položky</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ItemStatus)}
                  aria-label="Upraviť stav položky"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200"
                >
                  <option value="completed">Pozreté / Prečítané / Dokončené</option>
                  <option value="watching">Aktuálne sledujem / Čítam / Hrám</option>
                  <option value="to_watch">V pláne (Chcem zažiť)</option>
                  <option value="dropped">Odložené / Prerušené</option>
                  <option value="favorite">Obľúbené</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Moje hodnotenie: {userRating ? `${userRating}/10` : 'Nehodnotené'}
                </label>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(userRating === star ? undefined : star)}
                      className={`p-1 rounded hover:scale-110 transition-transform ${
                        userRating && userRating >= star ? 'text-amber-400' : 'text-slate-700'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${userRating && userRating >= star ? 'fill-amber-400' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Moja recenzia / poznámka
              </label>
              <textarea
                rows={2}
                value={userReview}
                onChange={(e) => setUserReview(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Štítky (oddelené čiarkou)
              </label>
              <input
                type="text"
                value={userTagsInput}
                onChange={(e) => setUserTagsInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 sticky bottom-0 bg-slate-900 py-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Zrušiť
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
            >
              Uložiť zmeny
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
