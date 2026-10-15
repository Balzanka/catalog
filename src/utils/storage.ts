import { CatalogItem } from '../types';
import { INITIAL_ITEMS } from '../data/initialData';

const STORAGE_KEY = 'moj_katalog_items_v1';

export function loadCatalogItems(): CatalogItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveCatalogItems(INITIAL_ITEMS);
      return INITIAL_ITEMS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_ITEMS;
  } catch (err) {
    console.error('Error loading catalog items from storage:', err);
    return INITIAL_ITEMS;
  }
}

export function saveCatalogItems(items: CatalogItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Error saving catalog items to storage:', err);
  }
}

export function exportCatalogToJson(items: CatalogItem[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  const now = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('download', `moj-katalog-zaloha-${now}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function resetCatalogToDefault(): CatalogItem[] {
  saveCatalogItems(INITIAL_ITEMS);
  return INITIAL_ITEMS;
}
