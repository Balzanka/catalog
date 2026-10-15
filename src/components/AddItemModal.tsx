import React, { useState } from 'react';
import { CategoryType, CatalogItem, ItemStatus } from '../types';
import { CATEGORIES, getStatusText } from '../utils/categories';
import { getCsfdSearchUrl, getImdbSearchUrl, getWikipediaSearchUrl, getSteamSearchUrl } from '../utils/externalLinks';
import { 
  X, 
  Search, 
  Loader2, 
  Sparkles, 
  Film, 
  Tv, 
  Music, 
  BookOpen, 
  Gamepad2, 
  StickyNote, 
  Check, 
  ExternalLink,
  Plus,
  Trash2,
  Star,
  Image as ImageIcon
} from 'lucide-react';

interface AddItemModalProps {
  initialCategory?: CategoryType;
  onClose: () => void;
  onAdd: (item: CatalogItem) => void;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  initialCategory = 'movies',
  onClose,
  onAdd,
}) => {
  const [category, setCategory] = useState<CategoryType>(initialCategory);
  
  // Search lookup state
  const [lookupQuery, setLookupQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);
  const [previewResult, setPreviewResult] = useState<any | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [creatorOrAuthor, setCreatorOrAuthor] = useState('');
  const [releaseYear, setReleaseYear] = useState<string>('');
  const [genresInput, setGenresInput] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [description, setDescription] = useState('');
  const [durationOrPages, setDurationOrPages] = useState('');
  const [platformOrFormat, setPlatformOrFormat] = useState('');
  const [publisherOrLabel, setPublisherOrLabel] = useState('');
  const [castOrTracksInput, setCastOrTracksInput] = useState('');
  
  // External links
  const [csfdUrl, setCsfdUrl] = useState('');
  const [csfdRating, setCsfdRating] = useState('');
  const [imdbUrl, setImdbUrl] = useState('');
  const [imdbRating, setImdbRating] = useState('');
  const [wikipediaUrl, setWikipediaUrl] = useState('');
  const [steamUrl, setSteamUrl] = useState('');
  const [steamRating, setSteamRating] = useState('');

  // User evaluation
  const [status, setStatus] = useState<ItemStatus>('completed');
  const [userRating, setUserRating] = useState<number | undefined>(8);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userReview, setUserReview] = useState('');
  const [userTagsInput, setUserTagsInput] = useState('');

  // Note specific
  const [noteContent, setNoteContent] = useState('');
  const [checklist, setChecklist] = useState<Array<{ id: string; text: string; completed: boolean }>>([]);
  const [newChecklistText, setNewChecklistText] = useState('');

  const currentCategoryMeta = CATEGORIES[category];

  // Helper for lookup search
  const handlePerformLookup = async () => {
    const q = lookupQuery.trim() || title.trim();
    if (!q) {
      setSearchFeedback('Zadajte prosím názov na vyhľadanie');
      return;
    }

    setIsSearching(true);
    setSearchFeedback(null);
    setPreviewResult(null);

    try {
      // First try the unified server lookup endpoint
      const response = await fetch('/api/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, category }),
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewResult(data);
        applyLookupData(data);
        setSearchFeedback(`Úspešne načítané z: ${data.sourceName || 'databázy'}`);
      } else {
        throw new Error('Chyba servera pri vyhľadávaní');
      }
    } catch (err) {
      console.warn('Fallback lookup:', err);
      // Fallback: direct default links
      applyFallbackLinks(q, category);
      setSearchFeedback('Vytvorené priame vyhľadávacie odkazy pre danú kategóriu.');
    } finally {
      setIsSearching(false);
    }
  };

  const applyLookupData = (data: any) => {
    if (data.title && !title) setTitle(data.title);
    if (data.originalTitle) setOriginalTitle(data.originalTitle);
    if (data.creatorOrAuthor) setCreatorOrAuthor(data.creatorOrAuthor);
    if (data.releaseYear) setReleaseYear(String(data.releaseYear));
    if (data.genres && Array.isArray(data.genres)) setGenresInput(data.genres.join(', '));
    if (data.coverUrl) setCoverUrl(data.coverUrl);
    if (data.description) setDescription(data.description);
    if (data.durationOrPages) setDurationOrPages(data.durationOrPages);
    if (data.platformOrFormat) setPlatformOrFormat(data.platformOrFormat);
    if (data.publisherOrLabel) setPublisherOrLabel(data.publisherOrLabel);
    if (data.castOrTracklist && Array.isArray(data.castOrTracklist)) {
      setCastOrTracksInput(data.castOrTracklist.join(', '));
    }

    if (data.csfdUrl) setCsfdUrl(data.csfdUrl);
    if (data.csfdRating) setCsfdRating(data.csfdRating);
    if (data.imdbUrl) setImdbUrl(data.imdbUrl);
    if (data.imdbRating) setImdbRating(data.imdbRating);
    if (data.wikipediaUrl) setWikipediaUrl(data.wikipediaUrl);
    if (data.steamUrl) setSteamUrl(data.steamUrl);
    if (data.steamRating) setSteamRating(data.steamRating);
  };

  const applyFallbackLinks = (q: string, cat: CategoryType) => {
    if (!title) setTitle(q);
    if (cat === 'movies' || cat === 'tv_series') {
      setCsfdUrl(getCsfdSearchUrl(q));
      setImdbUrl(getImdbSearchUrl(q));
    } else if (cat === 'music' || cat === 'books') {
      setWikipediaUrl(getWikipediaSearchUrl(q, 'sk'));
    } else if (cat === 'games') {
      setSteamUrl(getSteamSearchUrl(q));
    }
  };

  // Add checklist item for notes
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

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Prosím, zadajte aspoň názov položky.');
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

    const newItem: CatalogItem = {
      id: `${category}-${Date.now()}`,
      category,
      title: title.trim(),
      originalTitle: originalTitle.trim() || undefined,
      creatorOrAuthor: creatorOrAuthor.trim() || undefined,
      releaseYear: releaseYear.trim() || undefined,
      genres: genres.length > 0 ? genres : undefined,
      coverUrl: coverUrl.trim() || undefined,
      description: description.trim() || undefined,

      csfdUrl: csfdUrl.trim() || (category === 'movies' || category === 'tv_series' ? getCsfdSearchUrl(title) : undefined),
      csfdRating: csfdRating.trim() || undefined,
      imdbUrl: imdbUrl.trim() || (category === 'movies' || category === 'tv_series' ? getImdbSearchUrl(title) : undefined),
      imdbRating: imdbRating.trim() || undefined,
      wikipediaUrl: wikipediaUrl.trim() || (category === 'music' || category === 'books' ? getWikipediaSearchUrl(title) : undefined),
      steamUrl: steamUrl.trim() || (category === 'games' ? getSteamSearchUrl(title) : undefined),
      steamRating: steamRating.trim() || undefined,

      status,
      userRating,
      isFavorite,
      userReview: userReview.trim() || undefined,
      userTags,
      dateAdded: new Date().toISOString().split('T')[0],
      durationOrPages: durationOrPages.trim() || undefined,
      platformOrFormat: platformOrFormat.trim() || undefined,
      publisherOrLabel: publisherOrLabel.trim() || undefined,
      castOrTracklist: castOrTracklist.length > 0 ? castOrTracklist : undefined,

      noteContent: category === 'notes' ? noteContent.trim() || undefined : undefined,
      checklist: category === 'notes' && checklist.length > 0 ? checklist : undefined,
    };

    onAdd(newItem);
    onClose();
  };

  const getLookupButtonText = () => {
    if (category === 'movies' || category === 'tv_series') return 'Vyhľadať na ČSFD & IMDb';
    if (category === 'music' || category === 'books') return 'Vyhľadať na Wikipédii';
    if (category === 'games') return 'Vyhľadať na Steame';
    return 'Vyhľadať informácie';
  };

  const getLookupPlaceholder = () => {
    if (category === 'movies') return 'Napr. Oppenheimer, Interstellar, Pelíšky...';
    if (category === 'tv_series') return 'Napr. Stranger Things, The Last of Us, Narcos...';
    if (category === 'music') return 'Napr. Abbey Road, Bohemian Rhapsody, Elán...';
    if (category === 'books') return 'Napr. Malý princ, Pán prsteňov, Sapiens...';
    if (category === 'games') return 'Napr. Elden Ring, Baldur\'s Gate 3, Half-Life...';
    return 'Zadajte názov...';
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
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>Pridať novú položku do katalógu</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Vyberte kategóriu, vyhľadajte informácie alebo zadajte vlastné údaje.
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
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1">
          
          {/* Category Selector Buttons */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
              1. Zvoľte kategóriu
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {(['movies', 'tv_series', 'music', 'books', 'games', 'notes'] as CategoryType[]).map((cat) => {
                const meta = CATEGORIES[cat];
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategory(cat);
                      setLookupQuery('');
                      setSearchFeedback(null);
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md ring-1 ring-indigo-500/50'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span className={`p-2 rounded-xl mb-1.5 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'}`}>
                      {cat === 'movies' && <Film className="w-4 h-4" />}
                      {cat === 'tv_series' && <Tv className="w-4 h-4" />}
                      {cat === 'music' && <Music className="w-4 h-4" />}
                      {cat === 'books' && <BookOpen className="w-4 h-4" />}
                      {cat === 'games' && <Gamepad2 className="w-4 h-4" />}
                      {cat === 'notes' && <StickyNote className="w-4 h-4" />}
                    </span>
                    <span className="text-xs font-bold block">{meta.label}</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 truncate max-w-full">
                      {meta.lookupSources[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Smart Lookup Box */}
          {category !== 'notes' && (
            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5" />
                  <span>2. Automatické vyhľadanie údajov ({currentCategoryMeta.lookupSources.join(' & ')})</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  {currentCategoryMeta.lookupDesc}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={lookupQuery}
                    onChange={(e) => setLookupQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handlePerformLookup();
                      }
                    }}
                    placeholder={getLookupPlaceholder()}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handlePerformLookup}
                  disabled={isSearching}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 shrink-0"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Hľadám v databázach...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{getLookupButtonText()}</span>
                    </>
                  )}
                </button>
              </div>

              {searchFeedback && (
                <p className="text-xs text-indigo-300 mt-2 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{searchFeedback}</span>
                </p>
              )}
            </div>
          )}

          {/* Form details section */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              3. Podrobnosti položky
            </h3>

            {/* Title & Original Title */}
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
                  placeholder="Zadajte názov"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Pôvodný názov (ak sa líši)
                </label>
                <input
                  type="text"
                  value={originalTitle}
                  onChange={(e) => setOriginalTitle(e.target.value)}
                  placeholder="Originálny názov"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Creator & Release Year */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {category === 'movies' || category === 'tv_series'
                    ? 'Réžia / Tvorca'
                    : category === 'music'
                    ? 'Umelec / Skupina'
                    : category === 'books'
                    ? 'Autor knihy'
                    : category === 'games'
                    ? 'Vývojár / Štúdio'
                    : 'Autor'}
                </label>
                <input
                  type="text"
                  value={creatorOrAuthor}
                  onChange={(e) => setCreatorOrAuthor(e.target.value)}
                  placeholder="Meno autora / režiséra / štúdia"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                  placeholder="Napr. 2024"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Cover Image URL with preview */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center justify-between">
                <span>Odkaz na obrázok / Plagát (Cover URL)</span>
                {coverUrl && (
                  <span className="text-[11px] text-emerald-400">Náhľad dostupný</span>
                )}
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                {coverUrl && (
                  <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                    <img src={coverUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Genres & Specific meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Žánre (oddelené čiarkou)
                </label>
                <input
                  type="text"
                  value={genresInput}
                  onChange={(e) => setGenresInput(e.target.value)}
                  placeholder="Napr. Sci-Fi, Akčný, Dráma"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {category === 'movies' || category === 'music'
                    ? 'Dĺžka (minúty)'
                    : category === 'books'
                    ? 'Počet strán'
                    : category === 'games'
                    ? 'Herný čas (hodiny)'
                    : 'Trvanie / Rozsah'}
                </label>
                <input
                  type="text"
                  value={durationOrPages}
                  onChange={(e) => setDurationOrPages(e.target.value)}
                  placeholder="Napr. 148 minút / 350 strán"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Format / Platform & Publisher */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Formát / Platforma
                </label>
                <input
                  type="text"
                  value={platformOrFormat}
                  onChange={(e) => setPlatformOrFormat(e.target.value)}
                  placeholder={category === 'games' ? 'PC (Steam), PS5...' : category === 'movies' ? '4K Blu-ray, Netflix, Kino...' : 'Formát'}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Vydavateľstvo / Label / Štúdio
                </label>
                <input
                  type="text"
                  value={publisherOrLabel}
                  onChange={(e) => setPublisherOrLabel(e.target.value)}
                  placeholder="Názov vydavateľa"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Cast / Tracks */}
            {category !== 'notes' && (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {category === 'movies' || category === 'tv_series' ? 'Hlavní herci (oddelení čiarkou)' : 'Zoznam skladieb / Častí (oddelené čiarkou)'}
                </label>
                <input
                  type="text"
                  value={castOrTracksInput}
                  onChange={(e) => setCastOrTracksInput(e.target.value)}
                  placeholder="Meno 1, Meno 2, Meno 3..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Popis / Synopsa v slovenčine
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Stručný obsah diela..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Category-specific External Links Box */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Odkazy na databázy a zdroje
              </h4>

              {(category === 'movies' || category === 'tv_series') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-red-300 block mb-1">
                      ČSFD.cz odkaz
                    </label>
                    <input
                      type="url"
                      value={csfdUrl}
                      onChange={(e) => setCsfdUrl(e.target.value)}
                      placeholder="https://www.csfd.cz/..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-amber-300 block mb-1">
                      IMDb.com odkaz
                    </label>
                    <input
                      type="url"
                      value={imdbUrl}
                      onChange={(e) => setImdbUrl(e.target.value)}
                      placeholder="https://www.imdb.com/..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>
              )}

              {(category === 'music' || category === 'books') && (
                <div>
                  <label className="text-[11px] font-semibold text-sky-300 block mb-1">
                    Odkaz na Wikipédiu
                  </label>
                  <input
                    type="url"
                    value={wikipediaUrl}
                    onChange={(e) => setWikipediaUrl(e.target.value)}
                    placeholder="https://sk.wikipedia.org/wiki/..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              )}

              {category === 'games' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-cyan-300 block mb-1">
                      Steam Store odkaz
                    </label>
                    <input
                      type="url"
                      value={steamUrl}
                      onChange={(e) => setSteamUrl(e.target.value)}
                      placeholder="https://store.steampowered.com/app/..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-cyan-300 block mb-1">
                      Hodnotenie Steam komunity
                    </label>
                    <input
                      type="text"
                      value={steamRating}
                      onChange={(e) => setSteamRating(e.target.value)}
                      placeholder="Napr. Mimoriadne kladné (95%)"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Note Specific Fields */}
            {category === 'notes' && (
              <div className="space-y-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <label className="text-xs font-semibold text-slate-300 block">
                  Obsah poznámky / text
                </label>
                <textarea
                  rows={4}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Napíšte svoje myšlienky, zoznam alebo odporúčania..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
                />

                {/* Checklist editor */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Zoznam úloh (Checklist)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newChecklistText}
                      onChange={(e) => setNewChecklistText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddChecklistItem();
                        }
                      }}
                      placeholder="Nová úloha alebo položka..."
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddChecklistItem}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Pridať</span>
                    </button>
                  </div>

                  {checklist.length > 0 && (
                    <div className="space-y-1.5">
                      {checklist.map((c) => (
                        <div key={c.id} className="flex items-center justify-between p-2 rounded bg-slate-900/60 text-xs text-slate-300">
                          <span>• {c.text}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveChecklistItem(c.id)}
                            className="text-rose-400 hover:text-rose-300 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* My Personal Evaluation */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Moje hodnotenie & stav
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Status selector */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Stav položky
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ItemStatus)}
                    aria-label="Stav novej položky"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200"
                  >
                    <option value="completed">Pozreté / Prečítané / Dokončené</option>
                    <option value="watching">Aktuálne sledujem / Čítam / Hrám</option>
                    <option value="to_watch">V pláne (Chcem zažiť)</option>
                    <option value="dropped">Odložené / Prerušené</option>
                    <option value="favorite">Obľúbené</option>
                  </select>
                </div>

                {/* Rating 1-10 */}
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

              {/* Review */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Moja osobná recenzia a poznámka
                </label>
                <textarea
                  rows={2}
                  value={userReview}
                  onChange={(e) => setUserReview(e.target.value)}
                  placeholder="Vlastné dojmy, citáty, odporúčania..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Vlastné štítky (oddelené čiarkou)
                </label>
                <input
                  type="text"
                  value={userTagsInput}
                  onChange={(e) => setUserTagsInput(e.target.value)}
                  placeholder="Napr. Top 10, Srdcovka, Sci-Fi klasika"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 sticky bottom-0 bg-slate-900 py-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Zrušiť
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              Uložiť do katalógu
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
