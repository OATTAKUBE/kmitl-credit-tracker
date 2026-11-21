/**
 * Domain types for CS KMITL 2564 Credit Tracker
 * Model layer - pure TypeScript with zero React or DOM dependencies.
 */

export type CategoryId =
  | 'ge_foundation'
  | 'ge_lang'
  | 'ge_elective'
  | 'math_mandatory'
  | 'cs_mandatory'
  | 'cs_elective'
  | 'alternative_study'
  | 'free_elective';

export type AlternativePath = 'special_problem' | 'coop';

export interface CourseEntry {
  code: string;
  title: string;
  credits: number;
  grade: string;
  semester: string;
  isCompleted: boolean;
}

export interface CurriculumCourse {
  code: string;
  titleTH: string;
  titleEN: string;
  credits: number;
  category: CategoryId;
  yearSem?: string;
  isMandatory: boolean;
}

export interface CategoryProgress {
  id: CategoryId;
  nameTH: string;
  requiredCredits: number;
  earnedCredits: number;
  inProgressCredits: number;
  courses: CourseEntry[];
  isMet: boolean;
}

export interface StudentInfo {
  name: string;
  studentId: string;
  degree: string;
  program: string;
}

export interface AuditResult {
  studentInfo: StudentInfo;
  totalEarned: number;
  totalRequired: number;
  cumulativeGPA: number;
  isEligibleToGraduate: boolean;
  categories: Record<CategoryId, CategoryProgress>;
  missingMandatory: CurriculumCourse[];
  inProgressCourses: CourseEntry[];
  currentPath: AlternativePath;
}

export interface ParsedTranscript {
  studentInfo: StudentInfo;
  allCourses: CourseEntry[];
  summary: {
    totalCreditsEarned: number;
    cumulativeGPA: number;
  };
}

export interface AlternativePathOption {
  nameTH: string;
  credits: number;
  courses: CurriculumCourse[];
}
