import { useState, useEffect, useCallback } from 'react';
import type {
  AuditResult,
  AlternativePath,
  StudentInfo,
  CourseEntry,
  CurriculumId,
} from '../models/types';
import { auditGraduation } from '../models/calculator';
import { parseTranscriptText } from '../models/parser';
import { saveAuditState, loadAuditState, clearAuditState } from '../models/storage';
import { extractTextFromPdf } from './pdfExtractor';
import { detectCurriculum, DEFAULT_CURRICULUM_ID } from '../models/curriculums/registry';

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
  currentCurriculum: CurriculumId;
  hasLoadedData: boolean;
  handleFileUpload: (file: File) => Promise<void>;
  handlePathChange: (path: AlternativePath) => void;
  handleCurriculumChange: (curriculumId: CurriculumId) => void;
  handleReset: () => void;
}

/**
 * Custom React Hook acting as the MVC Controller for the KMITL Credit Tracker.
 * Orchestrates domain models (parser, calculator, storage, multi-curriculum registry),
 * coordinates side effects, manages application state, and provides handlers to views.
 */
export function useCreditTrackerController(): CreditTrackerController {
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<AlternativePath>('special_problem');
  const [currentCurriculum, setCurrentCurriculum] = useState<CurriculumId>(DEFAULT_CURRICULUM_ID);
  const [rawStudentData, setRawStudentData] = useState<RawStudentData | null>(null);

  // Restore cached state on initial mount
  useEffect(() => {
    try {
      const cached = loadAuditState();
      if (cached) {
        const curriculumId = cached.curriculumId || DEFAULT_CURRICULUM_ID;
        setCurrentPath(cached.path);
        setCurrentCurriculum(curriculumId);
        setRawStudentData({
          studentInfo: cached.studentInfo,
          courses: cached.courses,
          cumulativeGPA: cached.cumulativeGPA,
        });
        const result = auditGraduation(
          cached.studentInfo,
          cached.courses,
          cached.path,
          cached.cumulativeGPA,
          curriculumId
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

      // Auto-detect curriculum based on course prefixes (STAT: 05406xxx vs CS: 05506xxx)
      const detectedCurriculum = detectCurriculum(parsed.allCourses, currentCurriculum);

      // Auto-detect path: if transcript contains Coop course (05506117 or 05406168), select coop
      const autoPath: AlternativePath = parsed.allCourses.some(
        (c) => c.code === '05506117' || c.code === '05406168'
      )
        ? 'coop'
        : 'special_problem';

      const result = auditGraduation(
        parsed.studentInfo,
        parsed.allCourses,
        autoPath,
        parsed.summary.cumulativeGPA,
        detectedCurriculum
      );

      setAuditResult(result);
      setCurrentPath(autoPath);
      setCurrentCurriculum(detectedCurriculum);
      setRawStudentData({
        studentInfo: parsed.studentInfo,
        courses: parsed.allCourses,
        cumulativeGPA: parsed.summary.cumulativeGPA,
      });

      saveAuditState({
        studentInfo: parsed.studentInfo,
        courses: parsed.allCourses,
        path: autoPath,
        curriculumId: detectedCurriculum,
        cumulativeGPA: parsed.summary.cumulativeGPA,
      });
    } catch (err) {
      console.error('Failed to parse PDF transcript:', err);
      setError('เกิดข้อผิดพลาดในการประมวลผลไฟล์ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsProcessing(false);
    }
  }, [currentCurriculum]);

  const handlePathChange = useCallback(
    (newPath: AlternativePath) => {
      setCurrentPath(newPath);
      if (rawStudentData) {
        const result = auditGraduation(
          rawStudentData.studentInfo,
          rawStudentData.courses,
          newPath,
          rawStudentData.cumulativeGPA,
          currentCurriculum
        );
        setAuditResult(result);
        saveAuditState({
          studentInfo: rawStudentData.studentInfo,
          courses: rawStudentData.courses,
          path: newPath,
          curriculumId: currentCurriculum,
          cumulativeGPA: rawStudentData.cumulativeGPA,
        });
      }
    },
    [rawStudentData, currentCurriculum]
  );

  const handleCurriculumChange = useCallback(
    (newCurriculum: CurriculumId) => {
      setCurrentCurriculum(newCurriculum);
      if (rawStudentData) {
        const result = auditGraduation(
          rawStudentData.studentInfo,
          rawStudentData.courses,
          currentPath,
          rawStudentData.cumulativeGPA,
          newCurriculum
        );
        setAuditResult(result);
        saveAuditState({
          studentInfo: rawStudentData.studentInfo,
          courses: rawStudentData.courses,
          path: currentPath,
          curriculumId: newCurriculum,
          cumulativeGPA: rawStudentData.cumulativeGPA,
        });
      }
    },
    [rawStudentData, currentPath]
  );

  const handleReset = useCallback(() => {
    setAuditResult(null);
    setRawStudentData(null);
    setError(null);
    setIsProcessing(false);
    setCurrentPath('special_problem');
    setCurrentCurriculum(DEFAULT_CURRICULUM_ID);
    clearAuditState();
  }, []);

  return {
    auditResult,
    isProcessing,
    error,
    currentPath,
    currentCurriculum,
    hasLoadedData: auditResult !== null,
    handleFileUpload,
    handlePathChange,
    handleCurriculumChange,
    handleReset,
  };
}
