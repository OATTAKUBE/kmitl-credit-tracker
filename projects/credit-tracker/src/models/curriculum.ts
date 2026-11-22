/**
 * Curriculum definitions and exports.
 * Provides backwards-compatibility for CS 2564 while delegating to the multi-curriculum registry.
 */

export * from './curriculums/cs2564';
export * from './curriculums/stat2564';
export * from './curriculums/registry';

import type { AlternativePathOption } from './types';
import { CS_2564_CURRICULUM } from './curriculums/cs2564';

export const CURRICULUM_REQUIREMENTS = CS_2564_CURRICULUM.requirements;
export const MANDATORY_COURSES = CS_2564_CURRICULUM.mandatoryCourses;
export const ALTERNATIVE_PATHS: Record<'special_problem' | 'coop', AlternativePathOption> = {
  special_problem: CS_2564_CURRICULUM.alternativePaths.special_problem!,
  coop: CS_2564_CURRICULUM.alternativePaths.coop!,
};
export const CODE_ALIASES = CS_2564_CURRICULUM.codeAliases;
