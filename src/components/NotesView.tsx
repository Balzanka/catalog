import React, { useState } from 'react';
import { CatalogItem } from '../types';
import { 
  Plus, 
  Pin, 
  CheckSquare, 
  Square, 
  Trash2, 
  Tag as TagIcon,
  Calendar,
  Heart,
  Edit3
} from 'lucide-react';

interface NotesViewProps {
  notes: CatalogItem[];
  onOpenAddModal: () => void;
  onOpenEditModal: (note: CatalogItem) => void;
  onDeleteNote: (id: string) => void;
  onToggleFavorite: (e: React.MouseEvent, note: CatalogItem) => void;
  onToggleChecklistItem: (noteId: string, checkId: string) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteNote,
  onToggleFavorite,
  onToggleChecklistItem,
}) => {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Collect all unique tags
  const allTags = Array.from(
    new Set(notes.flatMap(n => n.userTags || []))
  );

  const filteredNotes = activeTag
    ? notes.filter(n => n.userTags?.includes(activeTag))
    : notes;

  // Split pinned and unpinned
  const pinnedNotes = filteredNotes.filter(n => n.isPinned || n.isFavorite);
  const otherNotes = filteredNotes.filter(n => !n.isPinned && !n.isFavorite);

  const renderNoteCard = (note: CatalogItem) => {
    const completedCount = note.checklist?.filter(c => c.completed).length || 0;
    const totalCount = note.checklist?.length || 0;

    return (
      <div
        key={note.id}
        className="group relative flex flex-col justify-between p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 shadow-lg transition-all"
      >
        <div>
          {/* Header of Note */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-bold text-base text-white group-hover:text-amber-400 transition-colors">
              {note.title}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={(e) => onToggleFavorite(e, note)}
                title={note.isFavorite ? 'Zrušiť pripnutie / obľúbené' : 'Pripnúť poznámku'}
                className={`p-1.5 rounded-lg transition-colors ${
                  note.isFavorite ? 'text-amber-400 bg-amber-400/10' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Pin className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onOpenEditModal(note)}
                title="Upraviť poznámku"
                className="p-1.5 rounded-lg text-slate-500 hover:text-white transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDeleteNote(note.id)}
                title="Zmazať poznámku"
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Note content */}
          {note.noteContent && (
            <p className="text-xs sm:text-sm text-slate-300 mt-2.5 whitespace-pre-wrap leading-relaxed line-clamp-6">
              {note.noteContent}
            </p>
          )}

          {/* Checklist */}
          {note.checklist && note.checklist.length > 0 && (
            <div className="mt-3.5 pt-3 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Zoznam položiek:</span>
                <span className="font-mono text-amber-300">
                  {completedCount}/{totalCount}
                </span>
              </div>
              <div className="space-y-1.5">
                {note.checklist.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => onToggleChecklistItem(note.id, c.id)}
                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    {c.completed ? (
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    )}
                    <span className={`text-xs ${c.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {c.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex flex-wrap gap-1">
            {note.userTags?.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-amber-300/90 border border-amber-500/20 font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
          <span className="text-[11px] text-slate-500">
            {note.dateAdded}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Osobný zápisník & zoznamy</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
              {notes.length} poznámok
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Zoznamy prianí, odporúčania od známych, nákupy a nápady.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nová poznámka / Zoznam</span>
        </button>
      </div>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
            <TagIcon className="w-3 h-3" />
            <span>Filtrovať:</span>
          </span>
          <button
            onClick={() => setActiveTag(null)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              activeTag === null
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Všetky
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeTag === tag
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Pinned section */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Pin className="w-3.5 h-3.5" />
            <span>Pripnuté poznámky & zoznamy</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedNotes.map(renderNoteCard)}
          </div>
        </div>
      )}

      {/* Other notes section */}
      {otherNotes.length > 0 && (
        <div className="space-y-3">
          {pinnedNotes.length > 0 && (
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ostatné poznámky
            </h3>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherNotes.map(renderNoteCard)}
          </div>
        </div>
      )}

      {filteredNotes.length === 0 && (
        <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800 p-6">
          <p className="text-slate-400 text-sm">Žiadne poznámky nevyhovujú filtru.</p>
          <button
            onClick={onOpenAddModal}
            className="mt-3 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            Pridať prvú poznámku
          </button>
        </div>
      )}
    </div>
  );
};
