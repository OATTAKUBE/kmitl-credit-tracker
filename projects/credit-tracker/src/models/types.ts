/**
 * Domain types for KMITL Credit Tracker
 * Model layer - pure TypeScript with zero React or DOM dependencies.
 * Follows good-typescript standards (strict types, discriminated unions, type-only exports).
 */

export type CurriculumId = 'cs_2564' | 'stat_2564';

export type CategoryId =
  | 'ge_foundation'
  | 'ge_lang'
  | 'ge_science'
  | 'ge_elective'
  | 'math_mandatory'
  | 'cs_mandatory'
  | 'cs_elective'
  | 'stat_core'
  | 'stat_mandatory'
  | 'stat_elective'
  | 'alternative_study'
  | 'free_elective';

export type AlternativePath = 'special_problem' | 'coop' | 'overseas_training';

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
  shortNameTH?: string;
  groupTH?: string;
  nameEN?: string;
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
  curriculumId: CurriculumId;
  totalEarned: number;
  totalRequired: number;
  cumulativeGPA: number;
  isEligibleToGraduate: boolean;
  categories: Record<CategoryId, CategoryProgress>;
  orderedCategoryIds: CategoryId[];
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
  nameEN?: string;
  credits: number;
  courses: CurriculumCourse[];
}

export interface CategoryRequirement {
  nameTH: string;
  shortNameTH: string;
  groupTH: string;
  nameEN: string;
  requiredCredits: number;
}

export interface CurriculumMetadata {
  id: CurriculumId;
  nameTH: string;
  nameEN: string;
  facultyTH: string;
  degreeTH: string;
  degreeEN: string;
  year: number;
  totalRequired: number;
  badgeLabel: string;
}

export interface CurriculumDefinition {
  metadata: CurriculumMetadata;
  orderedCategoryIds: CategoryId[];
  requirements: Record<string, CategoryRequirement>;
  mandatoryCourses: CurriculumCourse[];
  alternativePaths: Record<AlternativePath, AlternativePathOption | undefined>;
  codeAliases: Record<string, string>;
  classifyCourse: (code: string) => CategoryId;
}
