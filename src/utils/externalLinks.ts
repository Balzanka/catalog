import { CategoryType } from '../types';

/**
 * Generate external URL links according to category requirement:
 * - Movies & TV series: csfd.cz and imdb.com
 * - Music & books: Wikipedia (sk.wikipedia.org / en.wikipedia.org)
 * - Games: Steam (store.steampowered.com)
 */

export function getCsfdSearchUrl(query: string): string {
  return `https://www.csfd.cz/hladat/?q=${encodeURIComponent(query.trim())}`;
}

export function getImdbSearchUrl(query: string): string {
  return `https://www.imdb.com/find/?q=${encodeURIComponent(query.trim())}`;
}

export function getWikipediaSearchUrl(query: string, lang: 'sk' | 'en' = 'sk'): string {
  if (lang === 'sk') {
    return `https://sk.wikipedia.org/wiki/Špeciálne:Hľadanie?search=${encodeURIComponent(query.trim())}`;
  }
  return `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(query.trim())}`;
}

export function getSteamSearchUrl(query: string): string {
  return `https://store.steampowered.com/search/?term=${encodeURIComponent(query.trim())}`;
}

export interface ExternalSourceAction {
  name: string;
  url: string;
  badgeColor: string;
  iconName: 'film' | 'globe' | 'gamepad' | 'book';
  label: string;
}

export function getCategorySourceActions(
  category: CategoryType,
  itemTitle: string,
  existingUrls?: {
    csfdUrl?: string;
    imdbUrl?: string;
    wikipediaUrl?: string;
    steamUrl?: string;
  }
): ExternalSourceAction[] {
  const actions: ExternalSourceAction[] = [];
  const q = itemTitle.trim();
  if (!q) return actions;

  if (category === 'movies' || category === 'tv_series') {
    actions.push({
      name: 'ČSFD.cz',
      url: existingUrls?.csfdUrl || getCsfdSearchUrl(q),
      badgeColor: 'bg-red-950/80 text-red-300 border-red-700/50 hover:bg-red-900/90',
      iconName: 'film',
      label: existingUrls?.csfdUrl ? 'Otvoriť na ČSFD.cz' : 'Hľadať na ČSFD.cz',
    });
    actions.push({
      name: 'IMDb.com',
      url: existingUrls?.imdbUrl || getImdbSearchUrl(q),
      badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-700/50 hover:bg-amber-900/90',
      iconName: 'film',
      label: existingUrls?.imdbUrl ? 'Otvoriť na IMDb.com' : 'Hľadať na IMDb.com',
    });
  } else if (category === 'music' || category === 'books') {
    actions.push({
      name: 'Wikipédia (SK)',
      url: existingUrls?.wikipediaUrl || getWikipediaSearchUrl(q, 'sk'),
      badgeColor: 'bg-slate-800 text-sky-300 border-sky-600/50 hover:bg-slate-700',
      iconName: 'globe',
      label: existingUrls?.wikipediaUrl ? 'Článok na Wikipédii' : 'Hľadať na Wikipédii (SK)',
    });
    actions.push({
      name: 'Wikipedia (EN)',
      url: getWikipediaSearchUrl(q, 'en'),
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-600/50 hover:bg-slate-700',
      iconName: 'book',
      label: 'Hľadať na Wikipedia (EN)',
    });
  } else if (category === 'games') {
    actions.push({
      name: 'Steam Store',
      url: existingUrls?.steamUrl || getSteamSearchUrl(q),
      badgeColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/50 hover:bg-cyan-900/90',
      iconName: 'gamepad',
      label: existingUrls?.steamUrl ? 'Otvoriť v obchode Steam' : 'Hľadať na Steam',
    });
  }

  return actions;
}
