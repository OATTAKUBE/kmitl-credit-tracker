import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryCardView } from './CategoryCardView';
import type { CategoryProgress } from '../models/types';

const mockCategory: CategoryProgress = {
  id: 'math_mandatory',
  nameTH: 'หมวดวิชาเฉพาะ - วิชาบังคับทางคณิตศาสตร์และสถิติ',
  shortNameTH: 'วิชาบังคับคณิตศาสตร์และสถิติ',
  groupTH: 'หมวดวิชาเฉพาะ',
  nameEN: 'Math & Statistics Mandatory',
  requiredCredits: 18,
  earnedCredits: 12,
  inProgressCredits: 3,
  courses: [
    {
      code: '05506232',
      title: 'MATHEMATICS FOR COMPUTER SCIENCE',
      credits: 3,
      grade: 'A',
      isCompleted: true,
      semester: '1/2564',
    },
  ],
  isMet: false,
};

const mockCompletedCategory: CategoryProgress = {
  id: 'ge_foundation',
  nameTH: 'หมวดวิชาศึกษาทั่วไป - กลุ่มวิชาพื้นฐาน',
  shortNameTH: 'กลุ่มวิชาพื้นฐาน',
  groupTH: 'หมวดวิชาศึกษาทั่วไป',
  nameEN: 'GE Foundation',
  requiredCredits: 6,
  earnedCredits: 6,
  inProgressCredits: 0,
  courses: [],
  isMet: true,
};

describe('CategoryCardView Component', () => {
  it('should render category name, shortNameTH, groupTH, and credit counts', () => {
    render(<CategoryCardView category={mockCategory} />);
    expect(screen.getByText('วิชาบังคับคณิตศาสตร์และสถิติ')).toBeDefined();
    expect(screen.getByText('หมวดวิชาเฉพาะ')).toBeDefined();
    expect(screen.getByText('Math & Statistics Mandatory')).toBeDefined();
    expect(screen.getByText(/12 \/ 18/)).toBeDefined();
  });

  it('should fallback to nameTH if shortNameTH is not provided', () => {
    const noShortNameCategory: CategoryProgress = {
      ...mockCategory,
      shortNameTH: undefined,
      nameTH: 'วิชาบังคับ คณิตศาสตร์/สถิติ',
    };
    render(<CategoryCardView category={noShortNameCategory} />);
    expect(screen.getByText('วิชาบังคับ คณิตศาสตร์/สถิติ')).toBeDefined();
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
    expect(screen.getByText(/กำลังเรียน 3 นก\./)).toBeDefined();
  });

  it('should expand and collapse course list when toggle button is clicked', () => {
    render(<CategoryCardView category={mockCategory} />);

    // Initially courses should not be visible
    expect(screen.queryByText('MATHEMATICS FOR COMPUTER SCIENCE')).toBeNull();

    // Click to expand
    const toggleButton = screen.getByRole('button', { name: /ดูรายวิชาที่นับแล้ว/ });
    fireEvent.click(toggleButton);

    // Now course details should be visible
    expect(screen.getByText('MATHEMATICS FOR COMPUTER SCIENCE')).toBeDefined();
    expect(screen.getByText('05506232')).toBeDefined();
    expect(screen.getByText('A')).toBeDefined();

    // Click to collapse
    const collapseButton = screen.getByRole('button', { name: /ซ่อนรายวิชา/ });
    fireEvent.click(collapseButton);
    expect(screen.queryByText('MATHEMATICS FOR COMPUTER SCIENCE')).toBeNull();
  });
});
