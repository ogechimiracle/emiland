import { Project, Category, SiteSettings } from '../types';

const PROJECTS_KEY = 'emiland_custom_projects';
const CATEGORIES_KEY = 'emiland_custom_categories';
const SETTINGS_KEY = 'emiland_settings';

export function getCachedProjects(): Project[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCachedProject(project: Project): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getCachedProjects();
    const filtered = current.filter((p) => p.id !== project.id && p.slug !== project.slug);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify([project, ...filtered]));
  } catch (err) {
    console.warn('Failed to cache project:', err);
  }
}

export function removeCachedProject(idOrSlug: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getCachedProjects();
    const filtered = current.filter((p) => p.id !== idOrSlug && p.slug !== idOrSlug);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(filtered));
  } catch {}
}

export function mergeProjects(serverProjects: Project[]): Project[] {
  const cached = getCachedProjects();
  if (!cached || cached.length === 0) return serverProjects;

  const map = new Map<string, Project>();
  // Server projects first
  for (const p of serverProjects) {
    map.set(p.id, p);
  }
  // Cached projects overwrite or add
  for (const p of cached) {
    map.set(p.id, p);
  }
  return Array.from(map.values());
}

export function getCachedCategories(): Category[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCachedCategory(cat: Category): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getCachedCategories();
    const filtered = current.filter((c) => c.id !== cat.id && c.slug !== cat.slug);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify([...filtered, cat]));
  } catch {}
}

export function removeCachedCategory(idOrSlug: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getCachedCategories();
    const filtered = current.filter((c) => c.id !== idOrSlug && c.slug !== idOrSlug);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(filtered));
  } catch {}
}

export function mergeCategories(serverCategories: Category[]): Category[] {
  const cached = getCachedCategories();
  if (!cached || cached.length === 0) return serverCategories;
  const map = new Map<string, Category>();
  for (const c of serverCategories) {
    map.set(c.id, c);
  }
  for (const c of cached) {
    map.set(c.id, c);
  }
  return Array.from(map.values());
}

export function getCachedSettings(): Partial<SiteSettings> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCachedSettings(settings: Partial<SiteSettings>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getCachedSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch {}
}
