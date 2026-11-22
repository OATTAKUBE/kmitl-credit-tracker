import type {
  AuditResult,
  CategoryId,
  CategoryProgress,
  CourseEntry,
  CurriculumCourse,
  CurriculumId,
  StudentInfo,
  AlternativePath,
} from './types';
import { getCurriculum, DEFAULT_CURRICULUM_ID } from './curriculums/registry';

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
 * Pure domain calculation engine for credit matching, category progress auditing,
 * and graduation eligibility verification against KMITL curricula.
 *
 * @param studentInfo Metadata of the student
 * @param courses Parsed course entries from transcript
 * @param selectedPath Selected alternative study path ('special_problem' | 'coop' | 'overseas_training')
 * @param summaryGPA Optional transcript summary GPA; calculated from letter grades if omitted
 * @param curriculumId Identifier of curriculum to audit against (defaults to 'cs_2564')
 * @returns AuditResult
 */
export function auditGraduation(
  studentInfo: StudentInfo,
  courses: CourseEntry[],
  selectedPath: AlternativePath = 'special_problem',
  summaryGPA?: number,
  curriculumId: CurriculumId = DEFAULT_CURRICULUM_ID
): AuditResult {
  const curriculum = getCurriculum(curriculumId);
  const categoryKeys = curriculum.orderedCategoryIds;

  // Resolve alternative path option (fallback to first available if selectedPath is invalid for this curriculum)
  const activePathOption =
    curriculum.alternativePaths[selectedPath] ??
    Object.values(curriculum.alternativePaths).find((p) => p !== undefined);

  const activeAlternativeCodes = new Set(
    activePathOption ? activePathOption.courses.map((c) => c.code) : []
  );

  /**
   * Returns canonical course code by resolving legacy or alternate codes.
   */
  function getCanonicalCode(code: string): string {
    return curriculum.codeAliases[code] ?? code;
  }

  /**
   * Categorizes a course using curriculum classification rules.
   */
  function categorizeCourse(code: string): CategoryId {
    const canonical = getCanonicalCode(code);
    if (activeAlternativeCodes.has(canonical)) {
      return 'alternative_study';
    }
    return curriculum.classifyCourse(canonical);
  }

  // Initialize category progress buckets
  const categories = {} as Record<CategoryId, CategoryProgress>;
  for (const id of categoryKeys) {
    const req = curriculum.requirements[id];
    categories[id] = {
      id,
      nameTH: req?.nameTH || id,
      shortNameTH: req?.shortNameTH,
      groupTH: req?.groupTH,
      nameEN: req?.nameEN,
      requiredCredits: req?.requiredCredits || 0,
      earnedCredits: 0,
      inProgressCredits: 0,
      courses: [],
      isMet: false,
    };
  }

  // Ensure free_elective bucket exists even if not in orderedCategoryIds
  if (!categories.free_elective) {
    categories.free_elective = {
      id: 'free_elective',
      nameTH: 'หมวดวิชาเลือกเสรี',
      shortNameTH: 'วิชาเลือกเสรี',
      groupTH: 'หมวดวิชาเลือกเสรี',
      nameEN: 'Free Electives',
      requiredCredits: 6,
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
    const primaryCat = categorizeCourse(course.code);

    switch (primaryCat) {
      case 'math_mandatory':
      case 'cs_mandatory':
      case 'stat_core':
      case 'stat_mandatory':
      case 'alternative_study':
      case 'ge_foundation': {
        if (categories[primaryCat]) {
          categories[primaryCat].courses.push(course);
          categories[primaryCat].earnedCredits += course.credits;
        } else {
          overflowToFree.push(course);
        }
        break;
      }
      case 'ge_lang':
      case 'ge_science':
      case 'ge_elective':
      case 'cs_elective':
      case 'stat_elective': {
        const catProgress = categories[primaryCat];
        if (catProgress && catProgress.earnedCredits + course.credits <= catProgress.requiredCredits) {
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
    const primaryCat = categorizeCourse(course.code);
    if (categories[primaryCat]) {
      categories[primaryCat].courses.push(course);
      categories[primaryCat].inProgressCredits += course.credits;
    }
  }

  // 4. Update isMet flags for each category
  for (const id of categoryKeys) {
    if (categories[id]) {
      categories[id].isMet = categories[id].earnedCredits >= categories[id].requiredCredits;
    }
  }

  // 5. Determine missing mandatory courses
  const missingMandatory: CurriculumCourse[] = [];
  const mandatoryCatalog: CurriculumCourse[] = [...curriculum.mandatoryCourses];

  if (activePathOption) {
    mandatoryCatalog.push(
      ...activePathOption.courses.map((c) => ({ ...c, isMandatory: true }))
    );
  }

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
  const allCategoriesMet = categoryKeys.every((id) => categories[id]?.isMet ?? false);
  const totalRequired = curriculum.metadata.totalRequired;
  const isEligibleToGraduate =
    totalEarned >= totalRequired && missingMandatory.length === 0 && allCategoriesMet;

  return {
    studentInfo,
    curriculumId,
    totalEarned,
    totalRequired,
    cumulativeGPA,
    isEligibleToGraduate,
    categories,
    orderedCategoryIds: categoryKeys,
    missingMandatory,
    inProgressCourses,
    currentPath: selectedPath,
  };
}
