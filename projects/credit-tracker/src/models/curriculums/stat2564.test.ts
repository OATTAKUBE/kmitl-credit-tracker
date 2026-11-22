import { describe, it, expect } from 'vitest';
import { STAT_2564_CURRICULUM, classifyStatCourse } from './stat2564';
import { detectCurriculum } from './registry';
import { auditGraduation } from '../calculator';
import type { CourseEntry, StudentInfo } from '../types';

describe('Applied Statistics 2564 Curriculum Model', () => {
  it('has valid metadata and 127 total required credits', () => {
    expect(STAT_2564_CURRICULUM.metadata.id).toBe('stat_2564');
    expect(STAT_2564_CURRICULUM.metadata.totalRequired).toBe(127);
    expect(STAT_2564_CURRICULUM.orderedCategoryIds.length).toBe(9);
  });

  it('verifies exact category credit distribution sums to 127 credits', () => {
    const req = STAT_2564_CURRICULUM.requirements;
    const totalCredits =
      req.ge_foundation.requiredCredits +
      req.ge_lang.requiredCredits +
      req.ge_science.requiredCredits +
      req.ge_elective.requiredCredits +
      req.stat_core.requiredCredits +
      req.stat_mandatory.requiredCredits +
      req.stat_elective.requiredCredits +
      req.alternative_study.requiredCredits +
      req.free_elective.requiredCredits;

    expect(totalCredits).toBe(127);
    expect(req.ge_foundation.requiredCredits).toBe(6);
    expect(req.ge_lang.requiredCredits).toBe(9);
    expect(req.ge_science.requiredCredits).toBe(9);
    expect(req.ge_elective.requiredCredits).toBe(6);
    expect(req.stat_core.requiredCredits).toBe(15);
    expect(req.stat_mandatory.requiredCredits).toBe(55);
    expect(req.stat_elective.requiredCredits).toBe(15);
    expect(req.alternative_study.requiredCredits).toBe(6);
    expect(req.free_elective.requiredCredits).toBe(6);
  });

  it('correctly classifies courses according to STAT rules', () => {
    expect(classifyStatCourse('90641001')).toBe('ge_foundation');
    expect(classifyStatCourse('90644007')).toBe('ge_lang');
    expect(classifyStatCourse('90642015')).toBe('ge_science');
    expect(classifyStatCourse('90643021')).toBe('ge_science');
    expect(classifyStatCourse('90649999')).toBe('ge_elective');
    expect(classifyStatCourse('05016201')).toBe('stat_core'); // Calculus 1
    expect(classifyStatCourse('05406002')).toBe('stat_core'); // Principles of Stat
    expect(classifyStatCourse('05406096')).toBe('stat_mandatory'); // Statistical Analysis
    expect(classifyStatCourse('05406143')).toBe('stat_mandatory'); // Python
    expect(classifyStatCourse('05406149')).toBe('stat_elective'); // Module course
    expect(classifyStatCourse('05406152')).toBe('stat_elective'); // Non-param stat
    expect(classifyStatCourse('99999999')).toBe('free_elective');
  });

  describe('Curriculum Auto-Detection', () => {
    it('detects stat_2564 when courses predominantly belong to 05406xxx', () => {
      const statCourses: CourseEntry[] = [
        { code: '05406096', title: 'STAT ANALYSIS', credits: 3, grade: 'B', semester: '1/2565', isCompleted: true },
        { code: '05406143', title: 'PYTHON', credits: 3, grade: 'A', semester: '1/2565', isCompleted: true },
        { code: '05406145', title: 'DATABASE', credits: 3, grade: 'B+', semester: '2/2565', isCompleted: true },
        { code: '90641001', title: 'CHARM', credits: 3, grade: 'S', semester: '1/2565', isCompleted: true },
      ];
      expect(detectCurriculum(statCourses)).toBe('stat_2564');
    });

    it('detects cs_2564 when courses predominantly belong to 05506xxx', () => {
      const csCourses: CourseEntry[] = [
        { code: '05506003', title: 'PROG FUND', credits: 3, grade: 'A', semester: '1/2565', isCompleted: true },
        { code: '05506006', title: 'DATA STRUCTURES', credits: 3, grade: 'B', semester: '2/2565', isCompleted: true },
        { code: '90641001', title: 'CHARM', credits: 3, grade: 'S', semester: '1/2565', isCompleted: true },
      ];
      expect(detectCurriculum(csCourses)).toBe('cs_2564');
    });
  });

  describe('Auditing STAT Student with Calculator Engine', () => {
    const mockStatStudent: StudentInfo = {
      name: 'นางสาวสถิติ ข้อมูลดี',
      studentId: '65050999',
      degree: 'วิทยาศาสตรบัณฑิต',
      program: 'สถิติประยุกต์และการวิเคราะห์ข้อมูล',
    };

    it('calculates audit metrics against stat_2564 curriculum correctly', () => {
      const courses: CourseEntry[] = [
        // Core (6 cr)
        { code: '05016201', title: 'CALCULUS 1', credits: 3, grade: 'B', semester: '1/2565', isCompleted: true },
        { code: '05406002', title: 'PRINCIPLES OF STAT', credits: 3, grade: 'A', semester: '1/2565', isCompleted: true },
        // Mandatory (9 cr)
        { code: '05406096', title: 'STAT ANALYSIS', credits: 3, grade: 'A', semester: '2/2565', isCompleted: true },
        { code: '05406143', title: 'PYTHON', credits: 3, grade: 'A', semester: '2/2565', isCompleted: true },
        { code: '05406144', title: 'JAVA', credits: 3, grade: 'B+', semester: '2/2565', isCompleted: true },
        // GE Science (3 cr)
        { code: '90642015', title: 'CREATIVE THINKING', credits: 3, grade: 'A', semester: '1/2565', isCompleted: true },
      ];

      const audit = auditGraduation(mockStatStudent, courses, 'special_problem', undefined, 'stat_2564');

      expect(audit.curriculumId).toBe('stat_2564');
      expect(audit.totalRequired).toBe(127);
      expect(audit.totalEarned).toBe(18);
      expect(audit.categories.stat_core.earnedCredits).toBe(6);
      expect(audit.categories.stat_mandatory.earnedCredits).toBe(9);
      expect(audit.categories.ge_science.earnedCredits).toBe(3);
      expect(audit.isEligibleToGraduate).toBe(false);
      expect(audit.missingMandatory.length).toBeGreaterThan(0);
    });
  });
});
