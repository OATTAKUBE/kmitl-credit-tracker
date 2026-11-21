import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders upload view by default when no transcript is loaded', () => {
    render(<App />);

    expect(screen.getByText('KMITL CS Credit Tracker')).toBeDefined();
    expect(screen.getByText('ลากไฟล์ใบทรานสคริปต์ (PDF) มาวางที่นี่')).toBeDefined();
    expect(screen.getByText(/ลองใช้ข้อมูลตัวอย่าง/)).toBeDefined();
    expect(
      screen.getByText(/ข้อมูลทรานสคริปต์ของคุณถูกประมวลผลบนเบราว์เซอร์ภายในเครื่อง 100%/)
    ).toBeDefined();
  });

  it('transitions to audit view when demo data is loaded', () => {
    render(<App />);

    const demoButton = screen.getByText(/ลองใช้ข้อมูลตัวอย่าง/);
    fireEvent.click(demoButton);

    // Should display student info
    expect(screen.getByText('Mr. Teerasak Khlaiphet')).toBeDefined();
    expect(screen.getByText(/67050252/)).toBeDefined();

    // Should display reset button in header
    expect(screen.getByText('รีเซ็ต / อัปโหลดใหม่')).toBeDefined();

    // Should display category grid
    expect(screen.getByText('ความคืบหน้ารายหมวดวิชา (Curriculum Categories)')).toBeDefined();

    // Should display path selector
    expect(screen.getByText('แผนการศึกษาทางเลือก (Alternative Study Track)')).toBeDefined();
  });

  it('resets back to upload view when reset button is clicked', () => {
    render(<App />);

    const demoButton = screen.getByText(/ลองใช้ข้อมูลตัวอย่าง/);
    fireEvent.click(demoButton);

    expect(screen.getByText('Mr. Teerasak Khlaiphet')).toBeDefined();

    const resetButton = screen.getByText('รีเซ็ต / อัปโหลดใหม่');
    fireEvent.click(resetButton);

    expect(screen.queryByText('Mr. Teerasak Khlaiphet')).toBeNull();
    expect(screen.getByText('ลากไฟล์ใบทรานสคริปต์ (PDF) มาวางที่นี่')).toBeDefined();
  });
});
