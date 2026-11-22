import type { StudentInfo, CourseEntry, AlternativePath } from './types';

export const STORAGE_KEY = 'kmitl_credit_tracker_v1';

export interface StoredAuditState {
  studentInfo: StudentInfo;
  courses: CourseEntry[];
  path: AlternativePath;
  cumulativeGPA?: number;
}

/**
 * Safely resolves the active LocalStorage instance across browser, jsdom, and node environments.
 */
function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof localStorage !== 'undefined' && localStorage) {
      return localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Saves current audit state (student info, parsed courses, selected path, and GPA)
 * to browser LocalStorage.
 */
export function saveAuditState(state: StoredAuditState): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    const serialized = JSON.stringify(state);
    storage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Failed to save audit state to localStorage:', error);
  }
}

/**
 * Loads and validates cached audit state from browser LocalStorage.
 * Returns null if no cached state exists or if data is corrupted/incomplete.
 */
export function loadAuditState(): StoredAuditState | null {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !parsed.studentInfo ||
      typeof parsed.studentInfo !== 'object' ||
      !parsed.studentInfo.studentId ||
      !Array.isArray(parsed.courses) ||
      (parsed.path !== 'special_problem' && parsed.path !== 'coop')
    ) {
      return null;
    }

    return parsed as StoredAuditState;
  } catch (error) {
    console.warn('Failed to load audit state from localStorage:', error);
    return null;
  }
}

/**
 * Clears cached audit state from browser LocalStorage.
 */
export function clearAuditState(): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear audit state from localStorage:', error);
  }
}
