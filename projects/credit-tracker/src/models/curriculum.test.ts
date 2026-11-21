import { describe, it, expect } from 'vitest';
import {
  CURRICULUM_REQUIREMENTS,
  MANDATORY_COURSES,
  ALTERNATIVE_PATHS,
  CODE_ALIASES,
} from './curriculum';

describe('Curriculum Model Integrity', () => {
  it('should have total required credits equal to 135', () => {
    const total = Object.values(CURRICULUM_REQUIREMENTS).reduce(
      (sum, c) => sum + c.requiredCredits,
      0
    );
    expect(total).toBe(135);
  });

  it('should have 18 credits for math mandatory and 57 credits for cs mandatory', () => {
    const math = MANDATORY_COURSES.filter((c) => c.category === 'math_mandatory');
    const cs = MANDATORY_COURSES.filter((c) => c.category === 'cs_mandatory');
    expect(math.reduce((s, c) => s + c.credits, 0)).toBe(18);
    expect(cs.reduce((s, c) => s + c.credits, 0)).toBe(57);
  });

  it('should define alternative paths correctly', () => {
    expect(ALTERNATIVE_PATHS.special_problem.credits).toBe(6);
    expect(ALTERNATIVE_PATHS.coop.credits).toBe(6);
    expect(ALTERNATIVE_PATHS.special_problem.courses.length).toBe(2);
    expect(ALTERNATIVE_PATHS.coop.courses.length).toBe(1);
  });

  it('should map alias 90641007 to canonical 90641002', () => {
    expect(CODE_ALIASES['90641007']).toBe('90641002');
  });

  it('should have 6 math courses and 21 cs courses in mandatory list', () => {
    const math = MANDATORY_COURSES.filter((c) => c.category === 'math_mandatory');
    const cs = MANDATORY_COURSES.filter((c) => c.category === 'cs_mandatory');
    expect(math.length).toBe(6);
    expect(cs.length).toBe(21);
  });
});
