import type {
  CurriculumId,
  CurriculumDefinition,
  CurriculumMetadata,
  CourseEntry,
} from '../types';
import { CS_2564_CURRICULUM } from './cs2564';
import { STAT_2564_CURRICULUM } from './stat2564';

export const CURRICULUMS: Record<CurriculumId, CurriculumDefinition> = {
  cs_2564: CS_2564_CURRICULUM,
  stat_2564: STAT_2564_CURRICULUM,
};

export const AVAILABLE_CURRICULUMS: CurriculumMetadata[] = [
  CS_2564_CURRICULUM.metadata,
  STAT_2564_CURRICULUM.metadata,
];

export const DEFAULT_CURRICULUM_ID: CurriculumId = 'cs_2564';

export function getCurriculum(id: CurriculumId): CurriculumDefinition {
  return CURRICULUMS[id] || CURRICULUMS[DEFAULT_CURRICULUM_ID];
}

/**
 * Automatically detects the student's curriculum by analyzing course code prefixes.
 * - 05406xxx -> Applied Statistics & Data Analytics (STAT 2564)
 * - 05506xxx -> Computer Science (CS 2564)
 */
export function detectCurriculum(
  courses: CourseEntry[],
  fallback: CurriculumId = DEFAULT_CURRICULUM_ID
): CurriculumId {
  let csCount = 0;
  let statCount = 0;

  for (const course of courses) {
    const code = course.code.trim();
    if (/^05406\d{3}$/.test(code)) {
      statCount++;
    } else if (/^05506\d{3}$/.test(code)) {
      csCount++;
    }
  }

  if (statCount > csCount) {
    return 'stat_2564';
  }
  if (csCount > statCount) {
    return 'cs_2564';
  }
  return fallback;
}
