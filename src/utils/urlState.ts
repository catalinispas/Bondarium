import type { SavedView } from '../types/bond';

export function encodeViewToHash(view: Partial<SavedView>): string {
  try {
    return btoa(JSON.stringify(view));
  } catch {
    return '';
  }
}

export function decodeHashToView(hash: string): Partial<SavedView> | null {
  try {
    const raw = hash.startsWith('#') ? hash.slice(1) : hash;
    return JSON.parse(atob(raw)) as Partial<SavedView>;
  } catch {
    return null;
  }
}

export function pushViewToUrl(view: Partial<SavedView>) {
  const encoded = encodeViewToHash(view);
  window.history.replaceState(null, '', '#' + encoded);
}

export function readViewFromUrl(): Partial<SavedView> | null {
  return decodeHashToView(window.location.hash);
}
