import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { saveAuditState } from './models/storage';

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders upload view by default when no transcript is loaded and hides demo button', () => {
    render(<App />);

    expect(screen.getByText('KMITL Credit Tracker')).toBeDefined();
    expect(screen.getByText('ลากไฟล์ใบทรานสคริปต์ (PDF) มาวางที่นี่')).toBeDefined();
    expect(screen.queryByText(/ลองใช้ข้อมูลตัวอย่าง/)).toBeNull();
    expect(
      screen.getByText(/ข้อมูลทรานสคริปต์ของคุณถูกประมวลผลบนเบราว์เซอร์ภายในเครื่อง 100%/)
    ).toBeDefined();
  });

  it('renders audit view when cached audit data exists', () => {
    saveAuditState({
      studentInfo: {
        name: 'Mr. Sample Student',
        studentId: '65050000',
        degree: 'Bachelor of Science',
        program: 'Computer Science',
      },
      courses: [
        {
          code: '05506003',
          title: 'PROGRAMMING FUNDAMENTALS',
          credits: 3,
          grade: 'C+',
          semester: '1st Semester, Year, 2024-2025',
          isCompleted: true,
        },
      ],
      path: 'special_problem',
      curriculumId: 'cs_2564',
      cumulativeGPA: 3.03,
    });

    render(<App />);

    // Should display student info
    expect(screen.getByText('Mr. Sample Student')).toBeDefined();
    expect(screen.getByText(/65050000/)).toBeDefined();

    // Should display reset button in header
    expect(screen.getByText('รีเซ็ต / อัปโหลดใหม่')).toBeDefined();

    // Should display category grid
    expect(screen.getByText('ความคืบหน้ารายหมวดวิชา (Curriculum Categories)')).toBeDefined();

    // Should display path selector
    expect(screen.getByText('แผนการศึกษาทางเลือก (Alternative Study Track)')).toBeDefined();
  });

  it('resets back to upload view when reset button is clicked', () => {
    saveAuditState({
      studentInfo: {
        name: 'Mr. Sample Student',
        studentId: '65050000',
        degree: 'Bachelor of Science',
        program: 'Computer Science',
      },
      courses: [
        {
          code: '05506003',
          title: 'PROGRAMMING FUNDAMENTALS',
          credits: 3,
          grade: 'C+',
          semester: '1st Semester, Year, 2024-2025',
          isCompleted: true,
        },
      ],
      path: 'special_problem',
      curriculumId: 'cs_2564',
      cumulativeGPA: 3.03,
    });

    render(<App />);

    expect(screen.getByText('Mr. Sample Student')).toBeDefined();

    const resetButton = screen.getByText('รีเซ็ต / อัปโหลดใหม่');
    fireEvent.click(resetButton);

    expect(screen.queryByText('Mr. Sample Student')).toBeNull();
    expect(screen.getByText('ลากไฟล์ใบทรานสคริปต์ (PDF) มาวางที่นี่')).toBeDefined();
  });
});
