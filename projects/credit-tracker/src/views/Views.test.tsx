import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  UploadView,
  StudentSummaryView,
  PathSelectorView,
  CategoryGridView,
  MissingCoursesView,
  InProgressView,
  GraduationBannerView,
} from './index';
import { CategoryProgress, CurriculumCourse, CourseEntry, StudentInfo } from '../models/types';

describe('UploadView Component', () => {
  it('should render drop zone correctly', () => {
    const handleUpload = vi.fn();
    render(
      <UploadView
        onFileUpload={handleUpload}
        isProcessing={false}
        error={null}
      />
    );

    expect(screen.getByText(/ลากไฟล์ใบทรานสคริปต์/)).toBeDefined();
    expect(screen.getByText(/รองรับไฟล์ใบทรานสคริปต์ฉบับไม่เป็นทางการ/)).toBeDefined();
  });

  it('should display error message when error prop is provided', () => {
    render(
      <UploadView
        onFileUpload={vi.fn()}
        isProcessing={false}
        error="ไฟล์ PDF ไม่ถูกต้องหรือไม่ใช่ใบทรานสคริปต์ KMITL"
      />
    );

    expect(screen.getByText(/เกิดข้อผิดพลาดในการอ่านไฟล์/)).toBeDefined();
    expect(screen.getByText(/ไฟล์ PDF ไม่ถูกต้อง/)).toBeDefined();
  });

  it('should show loading indicator when isProcessing is true', () => {
    render(
      <UploadView
        onFileUpload={vi.fn()}
        isProcessing={true}
        error={null}
      />
    );

    expect(screen.getByText(/กำลังประมวลผลไฟล์ใบทรานสคริปต์/)).toBeDefined();
  });
});

describe('StudentSummaryView Component', () => {
  const mockStudent: StudentInfo = {
    name: 'นายสมชาย สายโค้ด',
    studentId: '64050099',
    degree: 'วิทยาศาสตรบัณฑิต',
    program: 'สาขาวิชาวิทยาการคอมพิวเตอร์',
  };

  it('should render student name, id, and credit metrics', () => {
    render(
      <StudentSummaryView
        studentInfo={mockStudent}
        totalEarned={102}
        totalRequired={135}
        cumulativeGPA={3.45}
      />
    );

    expect(screen.getByText('นายสมชาย สายโค้ด')).toBeDefined();
    expect(screen.getByText(/64050099/)).toBeDefined();
    expect(screen.getByText('3.45')).toBeDefined();
    expect(screen.getAllByText(/102/).length).toBeGreaterThan(0);
    expect(screen.getByText(/33/)).toBeDefined(); // Remaining credits (135 - 102)
  });
});

describe('PathSelectorView Component', () => {
  it('should render paths and trigger onSelectPath when clicked', () => {
    const handleSelect = vi.fn();
    render(
      <PathSelectorView
        currentPath="special_problem"
        onSelectPath={handleSelect}
      />
    );

    expect(screen.getByText('ปัญหาพิเศษ 1 & 2 (Special Problem)')).toBeDefined();
    expect(screen.getByText('สหกิจศึกษา (Cooperative Education)')).toBeDefined();

    const coopBtn = screen.getByText('สหกิจศึกษา (Cooperative Education)').closest('button');
    expect(coopBtn).toBeDefined();
    if (coopBtn) {
      fireEvent.click(coopBtn);
      expect(handleSelect).toHaveBeenCalledWith('coop');
    }
  });
});

describe('MissingCoursesView Component', () => {
  const mockMissing: CurriculumCourse[] = [
    {
      code: '05506233',
      titleTH: 'แคลคูลัส 2',
      titleEN: 'CALCULUS 2',
      credits: 3,
      category: 'math_mandatory',
      yearSem: 'ชั้นปี 1 ภาคเรียนที่ 2',
      isMandatory: true,
    },
  ];

  it('should render list of missing courses with dynamic category and in-progress badge', () => {
    render(
      <MissingCoursesView
        missing={mockMissing}
        curriculumName="วท.บ. วิทยาการคอมพิวเตอร์"
        categoryLabels={{ math_mandatory: 'บังคับคณิตศาสตร์และสถิติ' }}
        inProgressCourseCodes={new Set(['05506233'])}
      />
    );
    expect(screen.getByText('05506233')).toBeDefined();
    expect(screen.getByText('แคลคูลัส 2')).toBeDefined();
    expect(screen.getByText('บังคับคณิตศาสตร์และสถิติ')).toBeDefined();
    expect(screen.getByText('กำลังศึกษาเทอมนี้')).toBeDefined();
    expect(screen.getByText(/ขาดอีก 1 วิชา/)).toBeDefined();
  });

  it('should render success state when missing is empty', () => {
    render(<MissingCoursesView missing={[]} />);
    expect(screen.getByText(/ผ่านวิชาบังคับครบถ้วนทุกรายวิชาแล้ว/)).toBeDefined();
  });
});

describe('InProgressView Component', () => {
  const mockInProgress: CourseEntry[] = [
    {
      code: '05506099',
      title: 'SPECIAL PROBLEM 2',
      credits: 3,
      grade: '',
      semester: '2/2567',
      isCompleted: false,
    },
  ];

  it('should render in-progress courses', () => {
    render(<InProgressView courses={mockInProgress} />);
    expect(screen.getByText('05506099')).toBeDefined();
    expect(screen.getByText('SPECIAL PROBLEM 2')).toBeDefined();
    expect(screen.getAllByText(/กำลังศึกษา/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/3 หน่วยกิต/).length).toBeGreaterThan(0);
  });

  it('should render empty state message when no courses in progress', () => {
    render(<InProgressView courses={[]} />);
    expect(screen.getByText(/ไม่มีรายวิชาที่กำลังศึกษาอยู่ในขณะนี้/)).toBeDefined();
  });
});

describe('GraduationBannerView Component', () => {
  it('should render congratulatory banner when eligible', () => {
    render(
      <GraduationBannerView
        isEligible={true}
        totalEarned={135}
        totalRequired={135}
        missingCount={0}
      />
    );
    expect(screen.getByText(/ยินดีด้วย! คุณมีคุณสมบัติครบถ้วนตามเกณฑ์สำเร็จการศึกษา/)).toBeDefined();
  });

  it('should render remaining requirement notice when not eligible', () => {
    render(
      <GraduationBannerView
        isEligible={false}
        totalEarned={120}
        totalRequired={135}
        missingCount={2}
      />
    );
    expect(screen.getAllByText(/ยังไม่ผ่านเกณฑ์สำเร็จการศึกษา/).length).toBeGreaterThan(0);
    expect(screen.getByText(/ขาดอีก 15 หน่วยกิต/)).toBeDefined();
    expect(screen.getByText(/มีวิชาบังคับที่ยังไม่ผ่าน 2 วิชา/)).toBeDefined();
  });
});

describe('CategoryGridView Component', () => {
  const mockCategories: Record<string, CategoryProgress> = {
    ge_foundation: { id: 'ge_foundation', nameTH: 'หมวดวิชาศึกษาทั่วไป - กลุ่มวิชาพื้นฐาน', requiredCredits: 6, earnedCredits: 6, inProgressCredits: 0, courses: [], isMet: true },
    ge_lang: { id: 'ge_lang', nameTH: 'หมวดวิชาศึกษาทั่วไป - กลุ่มวิชาด้านภาษาและการสื่อสาร', requiredCredits: 9, earnedCredits: 9, inProgressCredits: 0, courses: [], isMet: true },
    ge_elective: { id: 'ge_elective', nameTH: 'หมวดวิชาศึกษาทั่วไป - กลุ่มวิชาเลือก', requiredCredits: 15, earnedCredits: 15, inProgressCredits: 0, courses: [], isMet: true },
    math_mandatory: { id: 'math_mandatory', nameTH: 'หมวดวิชาเฉพาะ - วิชาบังคับทางคณิตศาสตร์และสถิติ', requiredCredits: 18, earnedCredits: 18, inProgressCredits: 0, courses: [], isMet: true },
    cs_mandatory: { id: 'cs_mandatory', nameTH: 'หมวดวิชาเฉพาะ - วิชาบังคับทางวิทยาการคอมพิวเตอร์', requiredCredits: 57, earnedCredits: 57, inProgressCredits: 0, courses: [], isMet: true },
    cs_elective: { id: 'cs_elective', nameTH: 'หมวดวิชาเฉพาะ - วิชาเลือก', requiredCredits: 18, earnedCredits: 18, inProgressCredits: 0, courses: [], isMet: true },
    alternative_study: { id: 'alternative_study', nameTH: 'หมวดวิชาเฉพาะ - การศึกษาทางเลือก', requiredCredits: 6, earnedCredits: 6, inProgressCredits: 0, courses: [], isMet: true },
    free_elective: { id: 'free_elective', nameTH: 'หมวดวิชาเลือกเสรี', requiredCredits: 6, earnedCredits: 6, inProgressCredits: 0, courses: [], isMet: true },
  };

  it('should render all 8 categories in grid', () => {
    render(<CategoryGridView categories={mockCategories} />);
    expect(screen.getByText('หมวดวิชาศึกษาทั่วไป - กลุ่มวิชาพื้นฐาน')).toBeDefined();
    expect(screen.getByText('หมวดวิชาเฉพาะ - วิชาบังคับทางวิทยาการคอมพิวเตอร์')).toBeDefined();
    expect(screen.getByText('หมวดวิชาเลือกเสรี')).toBeDefined();
  });
});
