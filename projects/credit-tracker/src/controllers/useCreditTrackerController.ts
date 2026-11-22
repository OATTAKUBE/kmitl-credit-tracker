import { useState, useEffect, useCallback } from 'react';
import type {
  AuditResult,
  AlternativePath,
  StudentInfo,
  CourseEntry,
} from '../models/types';
import { auditGraduation } from '../models/calculator';
import { parseTranscriptText } from '../models/parser';
import { saveAuditState, loadAuditState, clearAuditState } from '../models/storage';
import { extractTextFromPdf } from './pdfExtractor';
import { SAMPLE_TRANSCRIPT_TEXT } from '../models/sampleTranscript';

interface RawStudentData {
  studentInfo: StudentInfo;
  courses: CourseEntry[];
  cumulativeGPA?: number;
}

export interface CreditTrackerController {
  auditResult: AuditResult | null;
  isProcessing: boolean;
  error: string | null;
  currentPath: AlternativePath;
  hasLoadedData: boolean;
  handleFileUpload: (file: File) => Promise<void>;
  handleDemoLoad: () => void;
  handlePathChange: (path: AlternativePath) => void;
  handleReset: () => void;
}

/**
 * Custom React Hook acting as the MVC Controller for the KMITL CS Credit Tracker.
 * Orchestrates domain models (parser, calculator, storage), coordinates side effects,
 * manages application state, and provides handlers to views.
 */
export function useCreditTrackerController(): CreditTrackerController {
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<AlternativePath>('special_problem');
  const [rawStudentData, setRawStudentData] = useState<RawStudentData | null>(null);

  // Restore cached state on initial mount
  useEffect(() => {
    try {
      const cached = loadAuditState();
      if (cached) {
        setCurrentPath(cached.path);
        setRawStudentData({
          studentInfo: cached.studentInfo,
          courses: cached.courses,
          cumulativeGPA: cached.cumulativeGPA,
        });
        const result = auditGraduation(
          cached.studentInfo,
          cached.courses,
          cached.path,
          cached.cumulativeGPA
        );
        setAuditResult(result);
      }
    } catch (err) {
      console.warn('Failed to restore initial state from cache:', err);
    }
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    const isPdf =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setError('กรุณาอัปโหลดไฟล์ PDF เท่านั้น');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const text = await extractTextFromPdf(file);
      const isValidTranscript = /Student\s+ID|Unofficial\s+Transcript/i.test(text);
      if (!isValidTranscript) {
        setError('ไม่พบข้อมูลทรานสคริปต์ KMITL ที่ถูกต้องในไฟล์นี้ กรุณาตรวจสอบไฟล์อีกครั้ง');
        setIsProcessing(false);
        return;
      }

      const parsed = parseTranscriptText(text);

      // Auto-detect path: if transcript contains Coop course (05506117), select coop
      const autoPath: AlternativePath = parsed.allCourses.some(
        (c) => c.code === '05506117'
      )
        ? 'coop'
        : 'special_problem';

      const result = auditGraduation(
        parsed.studentInfo,
        parsed.allCourses,
        autoPath,
        parsed.summary.cumulativeGPA
      );

      setAuditResult(result);
      setCurrentPath(autoPath);
      setRawStudentData({
        studentInfo: parsed.studentInfo,
        courses: parsed.allCourses,
        cumulativeGPA: parsed.summary.cumulativeGPA,
      });

      saveAuditState({
        studentInfo: parsed.studentInfo,
        courses: parsed.allCourses,
        path: autoPath,
        cumulativeGPA: parsed.summary.cumulativeGPA,
      });
    } catch (err) {
      console.error('Failed to parse PDF transcript:', err);
      setError('เกิดข้อผิดพลาดในการประมวลผลไฟล์ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleDemoLoad = useCallback(() => {
    setError(null);
    setIsProcessing(false);

    try {
      const parsed = parseTranscriptText(SAMPLE_TRANSCRIPT_TEXT);
      const path: AlternativePath = 'special_problem';

      const result = auditGraduation(
        parsed.studentInfo,
        parsed.allCourses,
        path,
        parsed.summary.cumulativeGPA
      );

      setAuditResult(result);
      setCurrentPath(path);
      setRawStudentData({
        studentInfo: parsed.studentInfo,
        courses: parsed.allCourses,
        cumulativeGPA: parsed.summary.cumulativeGPA,
      });

      saveAuditState({
        studentInfo: parsed.studentInfo,
        courses: parsed.allCourses,
        path,
        cumulativeGPA: parsed.summary.cumulativeGPA,
      });
    } catch (err) {
      console.error('Failed to load demo data:', err);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูลตัวอย่าง');
    }
  }, []);

  const handlePathChange = useCallback(
    (newPath: AlternativePath) => {
      setCurrentPath(newPath);
      if (rawStudentData) {
        const result = auditGraduation(
          rawStudentData.studentInfo,
          rawStudentData.courses,
          newPath,
          rawStudentData.cumulativeGPA
        );
        setAuditResult(result);
        saveAuditState({
          studentInfo: rawStudentData.studentInfo,
          courses: rawStudentData.courses,
          path: newPath,
          cumulativeGPA: rawStudentData.cumulativeGPA,
        });
      }
    },
    [rawStudentData]
  );

  const handleReset = useCallback(() => {
    setAuditResult(null);
    setRawStudentData(null);
    setError(null);
    setIsProcessing(false);
    setCurrentPath('special_problem');
    clearAuditState();
  }, []);

  return {
    auditResult,
    isProcessing,
    error,
    currentPath,
    hasLoadedData: auditResult !== null,
    handleFileUpload,
    handleDemoLoad,
    handlePathChange,
    handleReset,
  };
}
