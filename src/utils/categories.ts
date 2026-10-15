import { CategoryType, ItemStatus } from '../types';

export interface CategoryMeta {
  id: CategoryType;
  label: string;
  singularLabel: string;
  lookupSources: string[];
  lookupDesc: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  iconName: string;
}

export const CATEGORIES: Record<CategoryType, CategoryMeta> = {
  movies: {
    id: 'movies',
    label: 'Filmy',
    singularLabel: 'Film',
    lookupSources: ['ČSFD.cz', 'IMDb.com'],
    lookupDesc: 'Vyhľadávanie informácií na ČSFD.cz a IMDb.com',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    borderColor: 'border-rose-500',
    iconName: 'film'
  },
  tv_series: {
    id: 'tv_series',
    label: 'Seriály',
    singularLabel: 'Seriál',
    lookupSources: ['ČSFD.cz', 'IMDb.com'],
    lookupDesc: 'Vyhľadávanie informácií na ČSFD.cz a IMDb.com',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    borderColor: 'border-amber-500',
    iconName: 'tv'
  },
  music: {
    id: 'music',
    label: 'Hudba',
    singularLabel: 'Hudobné dielo / Album',
    lookupSources: ['Wikipédia'],
    lookupDesc: 'Vyhľadávanie informácií na Wikipédii',
    color: 'text-violet-400',
    badgeBg: 'bg-violet-500/10 text-violet-300 border-violet-500/30',
    borderColor: 'border-violet-500',
    iconName: 'music'
  },
  books: {
    id: 'books',
    label: 'Knihy',
    singularLabel: 'Kniha',
    lookupSources: ['Wikipédia'],
    lookupDesc: 'Vyhľadávanie informácií na Wikipédii',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    borderColor: 'border-emerald-500',
    iconName: 'book-open'
  },
  games: {
    id: 'games',
    label: 'Hry',
    singularLabel: 'Videohra',
    lookupSources: ['Steam'],
    lookupDesc: 'Vyhľadávanie informácií na platforme Steam',
    color: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    borderColor: 'border-cyan-500',
    iconName: 'gamepad'
  },
  notes: {
    id: 'notes',
    label: 'Poznámky',
    singularLabel: 'Poznámka',
    lookupSources: ['Osobný zápisník'],
    lookupDesc: 'Vlastné zoznamy, úlohy a poznámky',
    color: 'text-amber-300',
    badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    borderColor: 'border-amber-500',
    iconName: 'file-text'
  }
};

export const STATUS_LABELS: Record<CategoryType, Record<string, string>> = {
  movies: {
    all: 'Všetky stavy',
    completed: 'Pozreté',
    watching: 'Rozpozerané',
    to_watch: 'Chcem vidieť',
    dropped: 'Prerušené'
  },
  tv_series: {
    all: 'Všetky stavy',
    completed: 'Pozreté (dokončené)',
    watching: 'Aktuálne sledujem',
    to_watch: 'Chcem vidieť',
    dropped: 'Prerušené'
  },
  music: {
    all: 'Všetky stavy',
    completed: 'Vypočuté',
    listening: 'Aktuálne počúvam',
    to_listen: 'Chcem si vypočuť',
    dropped: 'Odložené'
  },
  books: {
    all: 'Všetky stavy',
    completed: 'Prečítané',
    reading: 'Práve čítam',
    to_read: 'Chcem čítať',
    dropped: 'Nedokončené'
  },
  games: {
    all: 'Všetky stavy',
    completed: 'Dohrané',
    playing: 'Práve hrám',
    to_play: 'Na hranie',
    dropped: 'Odložené'
  },
  notes: {
    all: 'Všetky poznámky',
    favorite: 'Pripnuté / Dôležité',
    completed: 'Archivované',
    to_watch: 'Na spracovanie'
  }
};

export function getStatusText(category: CategoryType, status: ItemStatus): string {
  const map = STATUS_LABELS[category];
  if (map && map[status]) {
    return map[status];
  }
  switch (status) {
    case 'completed': return 'Dokončené';
    case 'watching':
    case 'reading':
    case 'listening':
    case 'playing': return 'Prebieha';
    case 'to_watch':
    case 'to_read':
    case 'to_listen':
    case 'to_play': return 'V pláne';
    case 'dropped': return 'Odložené';
    case 'favorite': return 'Obľúbené';
    default: return status;
  }
}

export function getStatusBadgeStyle(status: ItemStatus): string {
  switch (status) {
    case 'completed':
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    case 'watching':
    case 'reading':
    case 'listening':
    case 'playing':
      return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
    case 'to_watch':
    case 'to_read':
    case 'to_listen':
    case 'to_play':
      return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    case 'dropped':
      return 'bg-slate-700/40 text-slate-400 border-slate-600/30';
    case 'favorite':
      return 'bg-pink-500/15 text-pink-300 border-pink-500/30';
    default:
      return 'bg-slate-800 text-slate-300 border-slate-700';
  }
}
