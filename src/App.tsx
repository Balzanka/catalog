/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { CatalogItem, CategoryType, ItemStatus } from './types';
import { loadCatalogItems, saveCatalogItems, resetCatalogToDefault } from './utils/storage';
import { CATEGORIES } from './utils/categories';
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { FilterBar, SortOption, StatusFilterOption } from './components/FilterBar';
import { ItemCard } from './components/ItemCard';
import { ItemListView } from './components/ItemListView';
import { ItemDetailModal } from './components/ItemDetailModal';
import { AddItemModal } from './components/AddItemModal';
import { EditItemModal } from './components/EditItemModal';
import { NotesView } from './components/NotesView';
import { StatsView } from './components/StatsView';
import { ImportExportModal } from './components/ImportExportModal';
import { 
  Plus, 
  Sparkles, 
  Film, 
  Tv, 
  Music, 
  BookOpen, 
  Gamepad2, 
  StickyNote,
  ExternalLink,
  Layers
} from 'lucide-react';

export default function App() {
  // Main data state
  const [items, setItems] = useState<CatalogItem[]>(() => loadCatalogItems());

  // Navigation & Filtering
  const [activeCategory, setActiveCategory] = useState<CategoryType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [itemToEdit, setItemToEdit] = useState<CatalogItem | null>(null);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    saveCatalogItems(items);
  }, [items]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryType | 'all', number> = {
      all: items.length,
      movies: 0,
      tv_series: 0,
      music: 0,
      books: 0,
      games: 0,
      notes: 0,
    };
    items.forEach((item) => {
      if (counts[item.category] !== undefined) {
        counts[item.category]++;
      }
    });
    return counts;
  }, [items]);

  // Available unique tags for current category or all
  const availableTags = useMemo(() => {
    const relevantItems = activeCategory === 'all' 
      ? items 
      : items.filter(i => i.category === activeCategory);
    const tags = new Set<string>();
    relevantItems.forEach(i => {
      i.userTags?.forEach(t => tags.add(t));
    });
    return Array.from(tags).sort();
  }, [items, activeCategory]);

  // Filtered & sorted items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // 1. Category
        if (activeCategory !== 'all' && item.category !== activeCategory) {
          return false;
        }

        // 2. Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchOriginal = item.originalTitle?.toLowerCase().includes(q);
          const matchCreator = item.creatorOrAuthor?.toLowerCase().includes(q);
          const matchDesc = item.description?.toLowerCase().includes(q);
          const matchGenres = item.genres?.some(g => g.toLowerCase().includes(q));
          const matchTags = item.userTags?.some(t => t.toLowerCase().includes(q));
          const matchNote = item.noteContent?.toLowerCase().includes(q);

          if (!matchTitle && !matchOriginal && !matchCreator && !matchDesc && !matchGenres && !matchTags && !matchNote) {
            return false;
          }
        }

        // 3. Status filter
        if (statusFilter === 'completed' && item.status !== 'completed') {
          return false;
        }
        if (statusFilter === 'in_progress') {
          const inProgressStatuses = ['watching', 'reading', 'listening', 'playing'];
          if (!inProgressStatuses.includes(item.status)) return false;
        }
        if (statusFilter === 'to_do') {
          const todoStatuses = ['to_watch', 'to_read', 'to_listen', 'to_play'];
          if (!todoStatuses.includes(item.status)) return false;
        }

        // 4. Favorites only
        if (favoritesOnly && !item.isFavorite) {
          return false;
        }

        // 5. Selected tag
        if (selectedTag && !item.userTags?.includes(selectedTag)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return (b.dateAdded || '').localeCompare(a.dateAdded || '');
          case 'rating_desc':
            return (b.userRating || 0) - (a.userRating || 0);
          case 'title_asc':
            return a.title.localeCompare(b.title, 'sk');
          case 'title_desc':
            return b.title.localeCompare(a.title, 'sk');
          case 'year_desc':
            return Number(b.releaseYear || 0) - Number(a.releaseYear || 0);
          case 'year_asc':
            return Number(a.releaseYear || 0) - Number(b.releaseYear || 0);
          default:
            return 0;
        }
      });
  }, [items, activeCategory, searchQuery, statusFilter, favoritesOnly, selectedTag, sortBy]);

  // Handlers
  const handleAddItem = (newItem: CatalogItem) => {
    setItems(prev => [newItem, ...prev]);
  };

  const handleUpdateItem = (updated: CatalogItem) => {
    setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
    if (selectedItem?.id === updated.id) {
      setSelectedItem(updated);
    }
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  const handleDuplicateItem = (item: CatalogItem) => {
    const duplicate: CatalogItem = {
      ...item,
      id: `${item.category}-${Date.now()}`,
      title: `${item.title} (Kópia)`,
      dateAdded: new Date().toISOString().split('T')[0],
    };
    setItems(prev => [duplicate, ...prev]);
    setSelectedItem(duplicate);
  };

  const handleToggleFavorite = (e: React.MouseEvent, item: CatalogItem) => {
    e.stopPropagation();
    const updated = { ...item, isFavorite: !item.isFavorite };
    handleUpdateItem(updated);
  };

  const handleUpdateStatus = (id: string, newStatus: ItemStatus) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
    if (selectedItem?.id === id) {
      setSelectedItem(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleUpdateRating = (id: string, newRating: number | undefined) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, userRating: newRating } : i));
    if (selectedItem?.id === id) {
      setSelectedItem(prev => prev ? { ...prev, userRating: newRating } : null);
    }
  };

  const handleToggleChecklistItem = (itemId: string, checkId: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId || !item.checklist) return item;
      return {
        ...item,
        checklist: item.checklist.map(c => 
          c.id === checkId ? { ...c, completed: !c.completed } : c
        ),
      };
    }));
    if (selectedItem?.id === itemId && selectedItem.checklist) {
      setSelectedItem({
        ...selectedItem,
        checklist: selectedItem.checklist.map(c => 
          c.id === checkId ? { ...c, completed: !c.completed } : c
        ),
      });
    }
  };

  const handleResetToDefault = () => {
    const defaults = resetCatalogToDefault();
    setItems(defaults);
    setSelectedItem(null);
  };

  const handleImportItems = (newItems: CatalogItem[]) => {
    setItems(newItems);
  };

  const getCategoryLookupHero = () => {
    if (activeCategory === 'movies' || activeCategory === 'tv_series') {
      return (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-amber-950/30 to-slate-900 border border-red-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center border border-red-500/30 shrink-0">
              {activeCategory === 'movies' ? <Film className="w-5 h-5" /> : <Tv className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{activeCategory === 'movies' ? 'Katalóg filmov' : 'Katalóg seriálov'}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-700/50">
                  ČSFD.cz & IMDb.com
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Všetky položky sú prepojené s Česko-Slovenskou filmovou databázou a svetovým portálom IMDb.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600/80 hover:bg-red-500 text-white text-xs font-semibold shadow-md transition-all self-start sm:self-auto shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Pridať {activeCategory === 'movies' ? 'film' : 'seriál'}</span>
          </button>
        </div>
      );
    }

    if (activeCategory === 'music' || activeCategory === 'books') {
      return (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-violet-950/40 via-emerald-950/30 to-slate-900 border border-indigo-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center border border-violet-500/30 shrink-0">
              {activeCategory === 'music' ? <Music className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{activeCategory === 'music' ? 'Hudobná zbierka' : 'Knižnica'}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-sky-300 border border-sky-600/50">
                  Wikipédia encyklopédia
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Vyhľadávanie diel, autorov, albumov a popisov cez slovenskú a anglickú Wikipédiu.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all self-start sm:self-auto shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Pridať {activeCategory === 'music' ? 'album / hudbu' : 'knihu'}</span>
          </button>
        </div>
      );
    }

    if (activeCategory === 'games') {
      return (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-cyan-950/50 via-slate-900 to-slate-900 border border-cyan-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shrink-0">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Herná knižnica</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/50 font-mono">
                  Steam Store & Komunita
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Integrované vyhľadávanie v Steam Store s oficiálnymi plagátmi, žánrami a recenziami.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-all self-start sm:self-auto shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Pridať videohru</span>
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* 1. Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenStatsModal={() => setIsStatsModalOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onResetData={handleResetToDefault}
        totalItemsCount={items.length}
      />

      {/* 2. Category Navigation */}
      <CategoryNav
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setSelectedTag(null);
        }}
        categoryCounts={categoryCounts}
      />

      {/* 3. Filters & Controls */}
      <FilterBar
        activeCategory={activeCategory}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        favoritesOnly={favoritesOnly}
        onToggleFavorites={() => setFavoritesOnly(!favoritesOnly)}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
        availableTags={availableTags}
        totalFilteredCount={filteredItems.length}
      />

      {/* 4. Main Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Category specific banner */}
        {getCategoryLookupHero()}

        {/* If user is specifically on Notes category, show tailored Notes View */}
        {activeCategory === 'notes' ? (
          <NotesView
            notes={filteredItems}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenEditModal={(note) => setItemToEdit(note)}
            onDeleteNote={handleDeleteItem}
            onToggleFavorite={handleToggleFavorite}
            onToggleChecklistItem={handleToggleChecklistItem}
          />
        ) : (
          <>
            {/* Items count & active filters indicator */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-slate-400 font-medium">
                Zobrazených <strong className="text-white font-bold">{filteredItems.length}</strong> {filteredItems.length === 1 ? 'položka' : filteredItems.length >= 2 && filteredItems.length <= 4 ? 'položky' : 'položiek'}
              </span>

              {searchQuery && (
                <span className="text-xs text-indigo-400">
                  Výsledky pre výraz „{searchQuery}“
                </span>
              )}
            </div>

            {/* Empty state */}
            {filteredItems.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/40 border border-slate-800/80 max-w-xl mx-auto my-8">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                  <Layers className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white">Nenašli sa žiadne položky</h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                  {searchQuery || statusFilter !== 'all' || favoritesOnly || selectedTag
                    ? 'Skúste upraviť filtre, zrušiť vyhľadávanie alebo vybrať inú kategóriu.'
                    : 'Váš katalóg je zatiaľ prázdny. Začnite pridaním svojho prvého filmu, seriálu, hudby, knihy alebo hry!'}
                </p>
                <div className="mt-5 flex items-center justify-center gap-2">
                  {(searchQuery || statusFilter !== 'all' || favoritesOnly || selectedTag) && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('all');
                        setFavoritesOnly(false);
                        setSelectedTag(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                    >
                      Zrušiť filtre
                    </button>
                  )}
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Pridať položku</span>
                  </button>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid view */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onClick={(it) => setSelectedItem(it)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            ) : (
              /* List view */
              <ItemListView
                items={filteredItems}
                onItemClick={(it) => setSelectedItem(it)}
                onToggleFavorite={handleToggleFavorite}
              />
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Môj Katalóg. Osobná evidencia médií a zoznamov.</p>
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Prepojené s:</span>
            <span className="text-red-400 font-medium">ČSFD.cz</span>
            <span>•</span>
            <span className="text-amber-400 font-medium">IMDb.com</span>
            <span>•</span>
            <span className="text-sky-400 font-medium">Wikipédia</span>
            <span>•</span>
            <span className="text-cyan-400 font-medium">Steam Store</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isAddModalOpen && (
        <AddItemModal
          initialCategory={activeCategory === 'all' ? 'movies' : activeCategory}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddItem}
        />
      )}

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onEdit={(it) => {
            setSelectedItem(null);
            setItemToEdit(it);
          }}
          onDelete={handleDeleteItem}
          onDuplicate={handleDuplicateItem}
          onUpdateStatus={handleUpdateStatus}
          onUpdateRating={handleUpdateRating}
          onToggleFavorite={(id) => {
            const it = items.find(i => i.id === id);
            if (it) {
              const updated = { ...it, isFavorite: !it.isFavorite };
              handleUpdateItem(updated);
            }
          }}
          onToggleChecklistItem={handleToggleChecklistItem}
        />
      )}

      {itemToEdit && (
        <EditItemModal
          item={itemToEdit}
          onClose={() => setItemToEdit(null)}
          onSave={handleUpdateItem}
        />
      )}

      {isStatsModalOpen && (
        <StatsView
          items={items}
          onClose={() => setIsStatsModalOpen(false)}
        />
      )}

      {isBackupModalOpen && (
        <ImportExportModal
          items={items}
          onClose={() => setIsBackupModalOpen(false)}
          onImportItems={handleImportItems}
          onResetToDefault={handleResetToDefault}
        />
      )}

    </div>
  );
}
