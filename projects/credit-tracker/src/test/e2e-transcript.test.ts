import { describe, it, expect, beforeEach, vi } from 'vitest';
import { parseTranscriptText } from '../models/parser';
import { auditGraduation } from '../models/calculator';
import { saveAuditState, loadAuditState } from '../models/storage';
import { SAMPLE_TRANSCRIPT_TEXT } from '../models/sampleTranscript';
import { ALTERNATIVE_PATHS } from '../models/curriculum';
import { renderHook, act } from '@testing-library/react';
import { useCreditTrackerController } from '../controllers/useCreditTrackerController';
import * as pdfExtractorModule from '../controllers/pdfExtractor';

vi.mock('../controllers/pdfExtractor', () => ({
  extractTextFromPdf: vi.fn(),
}));

describe('E2E Sample Transcript Verification Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Full Pipeline: Raw Transcript Text -> Parser -> Graduation Audit', () => {
    it('accurately parses student identity and graduation summary from sample transcript', () => {
      const parsed = parseTranscriptText(SAMPLE_TRANSCRIPT_TEXT);

      // Student metadata verification
      expect(parsed.studentInfo.studentId).toBe('65050000');
      expect(parsed.studentInfo.name).toBe('Mr. Sample Student');
      expect(parsed.studentInfo.program).toBe('Computer Science');
      expect(parsed.studentInfo.degree).toBe('Bachelor of Science');

      // Transcript official summary numbers
      expect(parsed.summary.totalCreditsEarned).toBe(85);
      expect(parsed.summary.cumulativeGPA).toBe(3.03);

      // Course counts
      const completedCourses = parsed.allCourses.filter((c) => c.isCompleted);
      const inProgressCourses = parsed.allCourses.filter((c) => !c.isCompleted);

      expect(completedCourses.length).toBe(29);
      expect(inProgressCourses.length).toBe(5);
      expect(parsed.allCourses.length).toBe(34);
    });

    it('verifies exact credits earned and in-progress calculations in audit engine', () => {
      const parsed = parseTranscriptText(SAMPLE_TRANSCRIPT_TEXT);
      const audit = auditGraduation(
        parsed.studentInfo,
        parsed.allCourses,
        'special_problem',
        parsed.summary.cumulativeGPA
      );

      // Core audit metrics
      expect(audit.studentInfo.studentId).toBe('65050000');
      expect(audit.studentInfo.name).toBe('Mr. Sample Student');
      expect(audit.totalEarned).toBe(85);
      expect(audit.totalRequired).toBe(135);
      expect(audit.cumulativeGPA).toBe(3.03);
      expect(audit.isEligibleToGraduate).toBe(false);

      // In-progress courses verification (5 courses, 15 credits)
      expect(audit.inProgressCourses.length).toBe(5);
      const inProgressCredits = audit.inProgressCourses.reduce((sum, c) => sum + c.credits, 0);
      expect(inProgressCredits).toBe(15);

      const inProgressCourseMap = audit.inProgressCourses.map((c) => ({
        code: c.code,
        title: c.title,
        credits: c.credits,
      }));

      expect(inProgressCourseMap).toEqual(
        expect.arrayContaining([
          { code: '05506014', title: 'COMPUTER GRAPHICS', credits: 3 },
          {
            code: '05506235',
            title: 'DIGITAL INNOVATION AND TECHNOLOGY MANAGEMENT IN DISRUPTIVE ERA',
            credits: 3,
          },
          {
            code: '05506237',
            title: 'PROGRAMMING LANGUAGE CONCEPTS AND PARADIGMS',
            credits: 3,
          },
          {
            code: '05506258',
            title: 'CLOUD COMPUTING AND VIRTUALIZATION TECHNOLOGY',
            credits: 3,
          },
          {
            code: '90644010',
            title: 'DEVELOPMENT OF READING AND WRITING SKILLS IN ENGLISH',
            credits: 3,
          },
        ])
      );
    });

    it('resolves course code aliases (90641007 Digital Citizen credited under GE Foundation)', () => {
      const parsed = parseTranscriptText(SAMPLE_TRANSCRIPT_TEXT);
      const audit = auditGraduation(
        parsed.studentInfo,
        parsed.allCourses,
        'special_problem',
        parsed.summary.cumulativeGPA
      );

      // GE Foundation should be 6 credits satisfied: Charm School (3) + Digital Citizen (3)
      const geFoundation = audit.categories.ge_foundation;
      expect(geFoundation.earnedCredits).toBe(6);
      expect(geFoundation.requiredCredits).toBe(6);
      expect(geFoundation.isMet).toBe(true);

      const hasAliasCourse = geFoundation.courses.some((c) => c.code === '90641007');
      expect(hasAliasCourse).toBe(true);
    });

    it('correctly audits all 8 curriculum categories for sample student', () => {
      const parsed = parseTranscriptText(SAMPLE_TRANSCRIPT_TEXT);
      const audit = auditGraduation(
        parsed.studentInfo,
        parsed.allCourses,
        'special_problem',
        parsed.summary.cumulativeGPA
      );

      // 1. GE Foundation (6/6 cr, met)
      expect(audit.categories.ge_foundation.earnedCredits).toBe(6);
      expect(audit.categories.ge_foundation.isMet).toBe(true);

      // 2. GE Language (6/9 cr earned, 3 in-progress, not met)
      expect(audit.categories.ge_lang.earnedCredits).toBe(6);
      expect(audit.categories.ge_lang.inProgressCredits).toBe(3);
      expect(audit.categories.ge_lang.isMet).toBe(false);

      // 3. GE Electives (12/15 cr earned, not met)
      expect(audit.categories.ge_elective.earnedCredits).toBe(12);
      expect(audit.categories.ge_elective.isMet).toBe(false);

      // 4. Math Mandatory (15/18 cr earned, missing Calculus, not met)
      expect(audit.categories.math_mandatory.earnedCredits).toBe(15);
      expect(audit.categories.math_mandatory.isMet).toBe(false);

      // 5. CS Mandatory (46/57 cr earned, 9 in-progress, not met)
      expect(audit.categories.cs_mandatory.earnedCredits).toBe(46);
      expect(audit.categories.cs_mandatory.inProgressCredits).toBe(9);
      expect(audit.categories.cs_mandatory.isMet).toBe(false);

      // 6. CS Elective (0/18 cr earned, 3 in-progress Cloud Computing, not met)
      expect(audit.categories.cs_elective.earnedCredits).toBe(0);
      expect(audit.categories.cs_elective.inProgressCredits).toBe(3);
      expect(audit.categories.cs_elective.isMet).toBe(false);

      // 7. Alternative Study (0/6 cr earned, not met)
      expect(audit.categories.alternative_study.earnedCredits).toBe(0);
      expect(audit.categories.alternative_study.isMet).toBe(false);

      // 8. Free Elective (0/6 cr earned, not met)
      expect(audit.categories.free_elective.earnedCredits).toBe(0);
      expect(audit.categories.free_elective.isMet).toBe(false);

      // Sum of earned credits across all categories equals exactly 85
      const sumEarned = Object.values(audit.categories).reduce((sum, cat) => sum + cat.earnedCredits, 0);
      expect(sumEarned).toBe(85);

      // Sum of in-progress credits across all categories equals exactly 15
      const sumInProgress = Object.values(audit.categories).reduce((sum, cat) => sum + cat.inProgressCredits, 0);
      expect(sumInProgress).toBe(15);
    });
  });

  describe('Path A (Special Problem) vs Path B (Cooperative Education)', () => {
    it('verifies Path A requirements, missing courses, and graduation forecast', () => {
      const parsed = parseTranscriptText(SAMPLE_TRANSCRIPT_TEXT);
      const auditA = auditGraduation(
        parsed.studentInfo,
        parsed.allCourses,
        'special_problem',
        parsed.summary.cumulativeGPA
      );

      expect(auditA.currentPath).toBe('special_problem');
      expect(auditA.isEligibleToGraduate).toBe(false);

      const missingCodesA = auditA.missingMandatory.map((c) => c.code);

      // Path A requires Special Problem 1 (05506098) & Special Problem 2 (05506099)
      expect(missingCodesA).toContain('05506098');
      expect(missingCodesA).toContain('05506099');
      expect(missingCodesA).not.toContain('05506117'); // Coop should NOT be required in Path A

      // Exact missing mandatory courses count on Path A: 8 courses
      // 1 Math (Calculus), 5 CS Mandatory (Graphics, Digital Innovation, Prog Lang, Practical Project, Seminar), 2 Special Problems
      expect(auditA.missingMandatory.length).toBe(8);
      expect(missingCodesA).toEqual(
        expect.arrayContaining([
          '05506233', // Calculus
          '05506014', // Computer Graphics (in progress)
          '05506235', // Digital Innovation (in progress)
          '05506237', // Prog Lang Concepts (in progress)
          '05506239', // Practical Project
          '05506013', // Seminar
          '05506098', // Special Problem 1
          '05506099', // Special Problem 2
        ])
      );
    });

    it('verifies Path B requirements, missing courses, and graduation forecast', () => {
      const parsed = parseTranscriptText(SAMPLE_TRANSCRIPT_TEXT);
      const auditB = auditGraduation(
        parsed.studentInfo,
        parsed.allCourses,
        'coop',
        parsed.summary.cumulativeGPA
      );

      expect(auditB.currentPath).toBe('coop');
      expect(auditB.isEligibleToGraduate).toBe(false);

      const missingCodesB = auditB.missingMandatory.map((c) => c.code);

      // Path B requires Cooperative Education (05506117)
      expect(missingCodesB).toContain('05506117');
      expect(missingCodesB).not.toContain('05506098'); // Special Problem 1 should NOT be in Path B
      expect(missingCodesB).not.toContain('05506099'); // Special Problem 2 should NOT be in Path B

      // Exact missing mandatory courses count on Path B: 7 courses (8 - 2 + 1)
      expect(auditB.missingMandatory.length).toBe(7);
      expect(missingCodesB).toEqual(
        expect.arrayContaining([
          '05506233', // Calculus
          '05506014', // Computer Graphics (in progress)
          '05506235', // Digital Innovation (in progress)
          '05506237', // Prog Lang Concepts (in progress)
          '05506239', // Practical Project
          '05506013', // Seminar
          '05506117', // Cooperative Education
        ])
      );
    });

    it('dynamically updates missing mandatory courses and path when toggling paths', () => {
      const parsed = parseTranscriptText(SAMPLE_TRANSCRIPT_TEXT);
      const auditA = auditGraduation(parsed.studentInfo, parsed.allCourses, 'special_problem', parsed.summary.cumulativeGPA);
      const auditB = auditGraduation(parsed.studentInfo, parsed.allCourses, 'coop', parsed.summary.cumulativeGPA);

      expect(auditA.missingMandatory.length).toBe(8);
      expect(auditB.missingMandatory.length).toBe(7);
      expect(auditA.currentPath).toBe('special_problem');
      expect(auditB.currentPath).toBe('coop');
      expect(ALTERNATIVE_PATHS[auditA.currentPath as 'special_problem' | 'coop']?.nameTH).toContain('ปัญหาพิเศษ');
      expect(ALTERNATIVE_PATHS[auditB.currentPath as 'special_problem' | 'coop']?.nameTH).toContain('สหกิจศึกษา');
    });
  });

  describe('LocalStorage Persistence Roundtrip', () => {
    it('saves parsed transcript state, reloads from storage, and re-audits with identical results', () => {
      const parsed = parseTranscriptText(SAMPLE_TRANSCRIPT_TEXT);

      // 1. Initial audit
      const initialAudit = auditGraduation(
        parsed.studentInfo,
        parsed.allCourses,
        'special_problem',
        parsed.summary.cumulativeGPA
      );

      // 2. Persist to LocalStorage
      saveAuditState({
        studentInfo: parsed.studentInfo,
        courses: parsed.allCourses,
        path: 'special_problem',
        cumulativeGPA: parsed.summary.cumulativeGPA,
      });

      // 3. Load from LocalStorage
      const loaded = loadAuditState();
      expect(loaded).not.toBeNull();
      expect(loaded!.studentInfo.studentId).toBe('65050000');
      expect(loaded!.courses.length).toBe(34);
      expect(loaded!.path).toBe('special_problem');
      expect(loaded!.cumulativeGPA).toBe(3.03);

      // 4. Re-audit loaded data
      const reAudit = auditGraduation(
        loaded!.studentInfo,
        loaded!.courses,
        loaded!.path,
        loaded!.cumulativeGPA
      );

      // 5. Compare initial and re-audited results
      expect(reAudit.studentInfo).toEqual(initialAudit.studentInfo);
      expect(reAudit.totalEarned).toBe(initialAudit.totalEarned);
      expect(reAudit.totalRequired).toBe(initialAudit.totalRequired);
      expect(reAudit.cumulativeGPA).toBe(initialAudit.cumulativeGPA);
      expect(reAudit.isEligibleToGraduate).toBe(initialAudit.isEligibleToGraduate);
      expect(reAudit.currentPath).toBe(initialAudit.currentPath);
      expect(reAudit.missingMandatory.length).toBe(initialAudit.missingMandatory.length);
      expect(reAudit.inProgressCourses.length).toBe(initialAudit.inProgressCourses.length);
      expect(reAudit.categories).toEqual(initialAudit.categories);
    });
  });

  describe('Controller Layer End-to-End State Integration', () => {
    it('processes sample transcript through controller and manages full user workflow', async () => {
      const extractMock = vi.mocked(pdfExtractorModule.extractTextFromPdf);
      extractMock.mockResolvedValueOnce(SAMPLE_TRANSCRIPT_TEXT);

      const { result } = renderHook(() => useCreditTrackerController());

      expect(result.current.hasLoadedData).toBe(false);
      expect(result.current.auditResult).toBeNull();

      // Trigger file upload with sample transcript
      await act(async () => {
        await result.current.handleFileUpload(new File(['pdf'], 'sample.pdf', { type: 'application/pdf' }));
      });

      expect(result.current.hasLoadedData).toBe(true);
      expect(result.current.auditResult).not.toBeNull();

      const audit = result.current.auditResult!;
      expect(audit.studentInfo.studentId).toBe('65050000');
      expect(audit.studentInfo.name).toBe('Mr. Sample Student');
      expect(audit.totalEarned).toBe(85);
      expect(audit.cumulativeGPA).toBe(3.03);
      expect(audit.inProgressCourses.length).toBe(5);
      expect(audit.currentPath).toBe('special_problem');
      expect(audit.missingMandatory.length).toBe(8);

      // Switch path to coop
      act(() => {
        result.current.handlePathChange('coop');
      });

      expect(result.current.currentPath).toBe('coop');
      expect(result.current.auditResult!.currentPath).toBe('coop');
      expect(result.current.auditResult!.missingMandatory.length).toBe(7);

      // Reset
      act(() => {
        result.current.handleReset();
      });

      expect(result.current.hasLoadedData).toBe(false);
      expect(result.current.auditResult).toBeNull();
      expect(loadAuditState()).toBeNull();
    });
  });
});
