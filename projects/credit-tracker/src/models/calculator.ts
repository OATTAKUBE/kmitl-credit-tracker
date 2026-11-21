import {
  AuditResult,
  CategoryId,
  CategoryProgress,
  CourseEntry,
  CurriculumCourse,
  StudentInfo,
  AlternativePath,
} from './types';
import {
  CURRICULUM_REQUIREMENTS,
  MANDATORY_COURSES,
  ALTERNATIVE_PATHS,
  CODE_ALIASES,
} from './curriculum';

/**
 * Letter grade to quality points conversion for KMITL GPA calculation.
 * Non-credit or non-graded grades (S, U, W, etc.) are excluded from GPA calculation.
 */
const GRADE_POINTS: Record<string, number> = {
  'A': 4.0,
  'B+': 3.5,
  'B': 3.0,
  'C+': 2.5,
  'C': 2.0,
  'D+': 1.5,
  'D': 1.0,
  'F': 0.0,
};

/**
 * Returns canonical course code by resolving legacy or alternate codes.
 */
function getCanonicalCode(code: string): string {
  return CODE_ALIASES[code] ?? code;
}

/**
 * Pure domain calculation engine for credit matching, category progress auditing,
 * and graduation eligibility verification against KMITL CS 2564 curriculum.
 *
 * @param studentInfo Metadata of the student
 * @param courses Parsed course entries from transcript
 * @param selectedPath Selected alternative study path ('special_problem' | 'coop')
 * @param summaryGPA Optional transcript summary GPA; calculated from letter grades if omitted
 * @returns AuditResult
 */
export function auditGraduation(
  studentInfo: StudentInfo,
  courses: CourseEntry[],
  selectedPath: AlternativePath,
  summaryGPA?: number
): AuditResult {
  // Pre-index mandatory and path-specific courses
  const mathMandatoryCodes = new Set(
    MANDATORY_COURSES.filter((c) => c.category === 'math_mandatory').map((c) => c.code)
  );
  const csMandatoryCodes = new Set(
    MANDATORY_COURSES.filter((c) => c.category === 'cs_mandatory').map((c) => c.code)
  );
  const activeAlternativeCodes = new Set(
    ALTERNATIVE_PATHS[selectedPath].courses.map((c) => c.code)
  );
  const geFoundationCodes = new Set(['90642999', '90641002']);

  /**
   * Identifies the primary curriculum category for a course code.
   */
  function getPrimaryCategory(code: string): CategoryId {
    const canonical = getCanonicalCode(code);

    if (mathMandatoryCodes.has(canonical)) {
      return 'math_mandatory';
    }
    if (csMandatoryCodes.has(canonical)) {
      return 'cs_mandatory';
    }
    if (activeAlternativeCodes.has(canonical)) {
      return 'alternative_study';
    }
    if (geFoundationCodes.has(canonical)) {
      return 'ge_foundation';
    }
    if (/^90644\d{3}$/.test(canonical)) {
      return 'ge_lang';
    }
    if (/^9064\d{4}$/.test(canonical)) {
      return 'ge_elective';
    }
    if (/^05506\d{3}$/.test(canonical)) {
      return 'cs_elective';
    }
    return 'free_elective';
  }

  // Initialize category progress buckets
  const categoryKeys: CategoryId[] = [
    'ge_foundation',
    'ge_lang',
    'ge_elective',
    'math_mandatory',
    'cs_mandatory',
    'cs_elective',
    'alternative_study',
    'free_elective',
  ];

  const categories = {} as Record<CategoryId, CategoryProgress>;
  for (const id of categoryKeys) {
    categories[id] = {
      id,
      nameTH: CURRICULUM_REQUIREMENTS[id].nameTH,
      requiredCredits: CURRICULUM_REQUIREMENTS[id].requiredCredits,
      earnedCredits: 0,
      inProgressCredits: 0,
      courses: [],
      isMet: false,
    };
  }

  // 1. Separate completed vs. in-progress courses
  const completedCourses: CourseEntry[] = [];
  const inProgressCourses: CourseEntry[] = [];
  const seenCompletedCanonicalCodes = new Set<string>();

  for (const course of courses) {
    if (course.isCompleted) {
      const canonical = getCanonicalCode(course.code);
      if (!seenCompletedCanonicalCodes.has(canonical)) {
        seenCompletedCanonicalCodes.add(canonical);
        completedCourses.push(course);
      }
    } else {
      inProgressCourses.push(course);
    }
  }

  // Total earned credits is the sum of all unique completed courses
  const totalEarned = completedCourses.reduce((sum, c) => sum + c.credits, 0);

  // 2. Allocate completed courses to category buckets
  const overflowToFree: CourseEntry[] = [];

  for (const course of completedCourses) {
    const primaryCat = getPrimaryCategory(course.code);

    switch (primaryCat) {
      case 'math_mandatory':
      case 'cs_mandatory':
      case 'alternative_study':
      case 'ge_foundation': {
        categories[primaryCat].courses.push(course);
        categories[primaryCat].earnedCredits += course.credits;
        break;
      }
      case 'ge_lang':
      case 'ge_elective':
      case 'cs_elective': {
        const catProgress = categories[primaryCat];
        if (catProgress.earnedCredits + course.credits <= catProgress.requiredCredits) {
          catProgress.courses.push(course);
          catProgress.earnedCredits += course.credits;
        } else {
          overflowToFree.push(course);
        }
        break;
      }
      case 'free_elective':
      default: {
        overflowToFree.push(course);
        break;
      }
    }
  }

  // Add free electives and overflow courses into free_elective category
  for (const course of overflowToFree) {
    categories.free_elective.courses.push(course);
    categories.free_elective.earnedCredits += course.credits;
  }

  // 3. Allocate in-progress courses
  for (const course of inProgressCourses) {
    const primaryCat = getPrimaryCategory(course.code);
    categories[primaryCat].courses.push(course);
    categories[primaryCat].inProgressCredits += course.credits;
  }

  // 4. Update isMet flags for each category
  for (const id of categoryKeys) {
    categories[id].isMet = categories[id].earnedCredits >= categories[id].requiredCredits;
  }

  // 5. Determine missing mandatory courses
  const missingMandatory: CurriculumCourse[] = [];
  const mandatoryCatalog: CurriculumCourse[] = [
    ...MANDATORY_COURSES,
    ...ALTERNATIVE_PATHS[selectedPath].courses.map((c) => ({ ...c, isMandatory: true })),
  ];

  for (const mc of mandatoryCatalog) {
    const canonical = getCanonicalCode(mc.code);
    const isCompleted =
      seenCompletedCanonicalCodes.has(mc.code) ||
      seenCompletedCanonicalCodes.has(canonical);

    if (!isCompleted) {
      missingMandatory.push(mc);
    }
  }

  // 6. Calculate or assign cumulative GPA
  let cumulativeGPA = 0;
  if (summaryGPA !== undefined) {
    cumulativeGPA = summaryGPA;
  } else {
    let totalQualityPoints = 0;
    let totalGradedCredits = 0;

    for (const course of completedCourses) {
      const grade = course.grade.trim().toUpperCase();
      const points = GRADE_POINTS[grade];
      if (points !== undefined) {
        totalQualityPoints += points * course.credits;
        totalGradedCredits += course.credits;
      }
    }

    cumulativeGPA =
      totalGradedCredits > 0
        ? Math.round((totalQualityPoints / totalGradedCredits) * 100) / 100
        : 0;
  }

  // 7. Determine graduation eligibility
  const allCategoriesMet = categoryKeys.every((id) => categories[id].isMet);
  const isEligibleToGraduate =
    totalEarned >= 135 && missingMandatory.length === 0 && allCategoriesMet;

  return {
    studentInfo,
    totalEarned,
    totalRequired: 135,
    cumulativeGPA,
    isEligibleToGraduate,
    categories,
    missingMandatory,
    inProgressCourses,
    currentPath: selectedPath,
  };
}
