import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCreditTrackerController } from './useCreditTrackerController';
import { saveAuditState } from '../models/storage';
import * as pdfExtractorModule from './pdfExtractor';

vi.mock('./pdfExtractor', () => ({
  extractTextFromPdf: vi.fn(),
}));

describe('useCreditTrackerController Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('initializes with default empty state when storage is clear', () => {
    const { result } = renderHook(() => useCreditTrackerController());

    expect(result.current.auditResult).toBeNull();
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.currentPath).toBe('special_problem');
    expect(result.current.hasLoadedData).toBe(false);
  });

  it('restores cached audit state on mount', () => {
    saveAuditState({
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
      path: 'coop',
      cumulativeGPA: 2.5,
    });

    const { result } = renderHook(() => useCreditTrackerController());

    expect(result.current.hasLoadedData).toBe(true);
    expect(result.current.currentPath).toBe('coop');
    expect(result.current.auditResult).not.toBeNull();
    expect(result.current.auditResult?.studentInfo.studentId).toBe('67050252');
  });

  it('loads demo transcript data on handleDemoLoad', () => {
    const { result } = renderHook(() => useCreditTrackerController());

    act(() => {
      result.current.handleDemoLoad();
    });

    expect(result.current.hasLoadedData).toBe(true);
    expect(result.current.auditResult).not.toBeNull();
    expect(result.current.auditResult?.studentInfo.name).toBe('Mr. Teerasak Khlaiphet');
    expect(result.current.auditResult?.studentInfo.studentId).toBe('67050252');
    expect(result.current.auditResult?.totalEarned).toBe(85);
    expect(result.current.auditResult?.cumulativeGPA).toBe(3.03);
    expect(result.current.currentPath).toBe('special_problem');
  });

  it('switches study path and updates audit calculations on handlePathChange', () => {
    const { result } = renderHook(() => useCreditTrackerController());

    act(() => {
      result.current.handleDemoLoad();
    });

    expect(result.current.currentPath).toBe('special_problem');
    const initialMissing = result.current.auditResult?.missingMandatory.length ?? 0;

    act(() => {
      result.current.handlePathChange('coop');
    });

    expect(result.current.currentPath).toBe('coop');
    expect(result.current.auditResult?.currentPath).toBe('coop');
    // Coop path has 1 mandatory course (05506117), special problem has 2 (05506098, 05506099)
    expect(result.current.auditResult?.missingMandatory.length).toBe(initialMissing - 1);
  });

  it('resets state and clears storage on handleReset', () => {
    const { result } = renderHook(() => useCreditTrackerController());

    act(() => {
      result.current.handleDemoLoad();
    });
    expect(result.current.hasLoadedData).toBe(true);

    act(() => {
      result.current.handleReset();
    });

    expect(result.current.hasLoadedData).toBe(false);
    expect(result.current.auditResult).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.currentPath).toBe('special_problem');
  });

  it('rejects non-PDF files with Thai error message', async () => {
    const { result } = renderHook(() => useCreditTrackerController());
    const textFile = new File(['hello text'], 'test.txt', { type: 'text/plain' });

    await act(async () => {
      await result.current.handleFileUpload(textFile);
    });

    expect(result.current.error).toBe('กรุณาอัปโหลดไฟล์ PDF เท่านั้น');
    expect(result.current.hasLoadedData).toBe(false);
  });

  it('rejects PDF without transcript markers', async () => {
    const extractMock = vi.mocked(pdfExtractorModule.extractTextFromPdf);
    extractMock.mockResolvedValueOnce('Random invoice text without transcript marks');

    const { result } = renderHook(() => useCreditTrackerController());
    const dummyPdf = new File(['%PDF-1.4...'], 'random.pdf', { type: 'application/pdf' });

    await act(async () => {
      await result.current.handleFileUpload(dummyPdf);
    });

    expect(result.current.error).toBe(
      'ไม่พบข้อมูลทรานสคริปต์ KMITL ที่ถูกต้องในไฟล์นี้ กรุณาตรวจสอบไฟล์อีกครั้ง'
    );
    expect(result.current.hasLoadedData).toBe(false);
  });

  it('processes valid transcript PDF successfully and auto-detects coop path if coop course is enrolled', async () => {
    const extractMock = vi.mocked(pdfExtractorModule.extractTextFromPdf);
    const mockPdfText = `
Name Mr. Somsak Jaidee Student ID 65050123
Degree Bachelor of Science Date of Graduation N/A
Program Computer Science
COURSE TITLE CREDIT GRADE COURSE TITLE CREDIT GRADE
1st Semester, Year, 2024-2025
05506003 PROGRAMMING FUNDAMENTALS 3 A
05506117 COOPERATIVE EDUCATION 6 S
Total number of credit earned: 9
Cumulative GPA: 4.00
`;
    extractMock.mockResolvedValueOnce(mockPdfText);

    const { result } = renderHook(() => useCreditTrackerController());
    const validPdf = new File(['%PDF-1.4...'], 'transcript.pdf', { type: 'application/pdf' });

    await act(async () => {
      await result.current.handleFileUpload(validPdf);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.hasLoadedData).toBe(true);
    expect(result.current.auditResult?.studentInfo.name).toBe('Mr. Somsak Jaidee');
    expect(result.current.currentPath).toBe('coop');
    expect(result.current.auditResult?.totalEarned).toBe(9);
  });

  it('handles PDF extraction errors gracefully', async () => {
    const extractMock = vi.mocked(pdfExtractorModule.extractTextFromPdf);
    extractMock.mockRejectedValueOnce(new Error('Corrupted PDF header'));

    const { result } = renderHook(() => useCreditTrackerController());
    const corruptPdf = new File(['corrupt data'], 'corrupt.pdf', { type: 'application/pdf' });

    await act(async () => {
      await result.current.handleFileUpload(corruptPdf);
    });

    expect(result.current.error).toBe('เกิดข้อผิดพลาดในการประมวลผลไฟล์ กรุณาลองใหม่อีกครั้ง');
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.hasLoadedData).toBe(false);
  });
});
