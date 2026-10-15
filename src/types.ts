export type CategoryType = 'movies' | 'tv_series' | 'music' | 'books' | 'games' | 'notes';

export type ItemStatus = 
  // Movies & Series
  | 'to_watch'      // Chcem vidieť
  | 'watching'      // Rozpozerané / Sledujem
  | 'completed'     // Pozreté / Dokončené
  | 'dropped'       // Odložené / Prerušené
  // Books
  | 'to_read'       // Chcem čítať
  | 'reading'       // Práve čítam
  // Music
  | 'to_listen'     // Chcem počúvať
  | 'listening'     // Počúvam
  // Games
  | 'to_play'       // Na hranie
  | 'playing'       // Práve hrám
  // Common
  | 'favorite';     // Obľúbené

export interface NoteChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface CatalogItem {
  id: string;
  category: CategoryType;
  title: string;
  originalTitle?: string;
  creatorOrAuthor?: string; // Režisér / Autor / Umelec / Vývojár
  releaseYear?: number | string;
  genres?: string[];
  coverUrl?: string;
  description?: string;
  
  // Specific lookups and URLs
  csfdUrl?: string;
  csfdRating?: number | string;
  imdbUrl?: string;
  imdbRating?: number | string;
  wikipediaUrl?: string;
  steamUrl?: string;
  steamAppId?: string;
  steamRating?: string;

  // Custom user fields
  userRating?: number; // 1 to 10
  status: ItemStatus;
  isFavorite: boolean;
  userReview?: string;
  userTags: string[];
  dateAdded: string;
  dateFinished?: string;

  // Category specific fields
  durationOrPages?: string; // Dĺžka (minúty), počet strán, trvanie albumu, herný čas (hodiny)
  platformOrFormat?: string; // PC/Steam, PS5, Vinyl, Hardcover, Netflix...
  seasonsCount?: number | string;
  episodesProgress?: string; // napr. S02E05
  readingProgress?: string; // napr. strana 120 z 350
  publisherOrLabel?: string; // Vydavateľstvo / Hudobné vydavateľstvo / Štúdio
  castOrTracklist?: string[]; // Zoznam hercov alebo skladieb
  
  // Notes specific
  noteContent?: string;
  noteColor?: string;
  isPinned?: boolean;
  checklist?: NoteChecklistItem[];
}

export interface SearchLookupResult {
  title: string;
  originalTitle?: string;
  category: CategoryType;
  creatorOrAuthor?: string;
  releaseYear?: number | string;
  genres?: string[];
  coverUrl?: string;
  description?: string;
  csfdUrl?: string;
  csfdRating?: string;
  imdbUrl?: string;
  imdbRating?: string;
  wikipediaUrl?: string;
  steamUrl?: string;
  steamAppId?: string;
  steamRating?: string;
  publisherOrLabel?: string;
  durationOrPages?: string;
  castOrTracklist?: string[];
  sourceName: string; // 'ČSFD & IMDb' | 'Wikipedia' | 'Steam' | 'Gemini AI'
}
