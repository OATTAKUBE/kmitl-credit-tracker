import { describe, it, expect, beforeEach } from 'vitest';
import { saveAuditState, loadAuditState, clearAuditState, StoredAuditState, STORAGE_KEY } from './storage';

describe('Storage Adapter Model', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const sampleState: StoredAuditState = {
    studentInfo: {
      name: 'Mr. Teerasak Khlaiphet',
      studentId: '67050252',
      degree: 'Bachelor of Science',
      program: 'Computer Science',
    },
    courses: [
      {
        code: '05506003',
        title: 'PROGRAMMING FUNDAMENTALS',
        credits: 3,
        grade: 'C+',
        semester: '1st Semester, Year, 2024-2025',
        isCompleted: true,
      },
    ],
    path: 'special_problem',
    cumulativeGPA: 3.03,
  };

  it('should save and load audit state from localStorage', () => {
    saveAuditState(sampleState);
    const loaded = loadAuditState();
    expect(loaded).toEqual(sampleState);
  });

  it('should return null when storage is empty', () => {
    expect(loadAuditState()).toBeNull();
  });

  it('should clear stored state from localStorage', () => {
    saveAuditState(sampleState);
    expect(loadAuditState()).not.toBeNull();
    clearAuditState();
    expect(loadAuditState()).toBeNull();
  });

  it('should handle corrupted JSON in localStorage gracefully without throwing', () => {
    localStorage.setItem(STORAGE_KEY, '{corrupted_json:invalid');
    expect(loadAuditState()).toBeNull();
  });

  it('should return null if stored data is missing required fields', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ studentInfo: null }));
    expect(loadAuditState()).toBeNull();
  });

  it('should return null if stored data has invalid path', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...sampleState,
        path: 'invalid_path',
      })
    );
    expect(loadAuditState()).toBeNull();
  });
});
