import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryCardView } from './CategoryCardView';
import { CategoryProgress } from '../models/types';

const mockCategory: CategoryProgress = {
  id: 'math_mandatory',
  nameTH: 'วิชาบังคับ คณิตศาสตร์/สถิติ',
  requiredCredits: 18,
  earnedCredits: 12,
  inProgressCredits: 3,
  courses: [],
  isMet: false,
};

const mockCompletedCategory: CategoryProgress = {
  id: 'ge_foundation',
  nameTH: 'หมวดวิชาศึกษาทั่วไป - กลุ่มวิชาพื้นฐาน',
  requiredCredits: 6,
  earnedCredits: 6,
  inProgressCredits: 0,
  courses: [],
  isMet: true,
};

describe('CategoryCardView Component', () => {
  it('should render category name and credit counts', () => {
    render(<CategoryCardView category={mockCategory} />);
    expect(screen.getByText('วิชาบังคับ คณิตศาสตร์/สถิติ')).toBeDefined();
    expect(screen.getByText(/12 \/ 18/)).toBeDefined();
  });

  it('should render "ยังไม่ครบ" badge when category is not met', () => {
    render(<CategoryCardView category={mockCategory} />);
    expect(screen.getByText(/ยังไม่ครบ/)).toBeDefined();
  });

  it('should render "ผ่านแล้ว" badge when category is met', () => {
    render(<CategoryCardView category={mockCompletedCategory} />);
    expect(screen.getByText(/ผ่านแล้ว/)).toBeDefined();
  });

  it('should display in-progress credits indicator if greater than 0', () => {
    render(<CategoryCardView category={mockCategory} />);
    expect(screen.getByText(/3/)).toBeDefined();
  });
});
