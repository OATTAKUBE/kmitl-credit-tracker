import type { CourseEntry, ParsedTranscript, StudentInfo } from './types';

/**
 * Passing grades in KMITL that count as completed courses with credit earned.
 */
const PASSING_GRADES = new Set(['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'S']);

/**
 * Semester header pattern:
 * e.g. "1st Semester, Year, 2024-2025" or "2nd Semester, Year, 2025-2026"
 */
const SEMESTER_REGEX = /(?:(\d+(?:st|nd|rd|th)|Summer)\s+Semester[^\n]*)/i;

/**
 * Course line pattern:
 * 8-digit code, followed by title, credit number, and optional grade.
 * - Completed: "05506003 PROGRAMMING FUNDAMENTALS 3 C+"
 * - In-progress: "05506014 COMPUTER GRAPHICS 3"
 */
const COURSE_LINE_REGEX = /^(\d{8})\s+(.+?)\s+(\d+)(?:\s+([A-Za-z][+-]?))?$/;

/**
 * Patterns of lines that indicate headers, footers, metadata, or summary boundaries.
 * When encountered, they must never be appended to previous course titles,
 * and many of them reset the active course continuation tracking.
 */
const BOUNDARY_PATTERNS = [
  /^COURSE TITLE/i,
  /Unofficial Transcript/i,
  /^Photo$/i,
  /^Date of/i,
  /^Date Issued/i,
  /^Page\s+\d+/i,
  /^Checked by/i,
  /Transcript Closed/i,
  /^-{3,}/,
  /^\(.*\)$/,
  /^GPS\s*:/i,
  /^Total\s+(?:number\s+of\s+)?credits?\s+earned/i,
  /^Cumulative\s+GPA/i,
  /^Name\s+/i,
  /^Degree\s+/i,
  /^Program\s+/i,
];

/**
 * Parses raw text extracted from a KMITL transcript PDF into a structured domain model.
 *
 * Handles:
 * - Student metadata (name, studentId, degree, program)
 * - Semester groupings
 * - Multi-line wrapped course titles (both completed and in-progress courses)
 * - In-progress courses (no grade or non-passing grade)
 * - Total earned credits and cumulative GPA with graceful calculation fallbacks
 *
 * @param rawText Extracted text from PDF
 * @returns ParsedTranscript
 */
export function parseTranscriptText(rawText: string): ParsedTranscript {
  const normalizedText = (rawText || '').trim();

  // 1. Extract Student Info
  let name = '';
  let studentId = '';
  let degree = '';
  let program = '';

  const nameIdMatch = normalizedText.match(/Name\s+([A-Za-z\s.]+?)\s+Student ID\s+([A-Za-z0-9]+)/i);
  if (nameIdMatch) {
    name = nameIdMatch[1].trim();
    studentId = nameIdMatch[2].trim();
  } else {
    const nameMatch = normalizedText.match(/Name\s+([^\n\r]+?)(?:\s+Student ID|\s+Date of|\n|$)/i);
    if (nameMatch) name = nameMatch[1].trim();

    const idMatch = normalizedText.match(/Student ID\s*[:\s]\s*([A-Za-z0-9]+)/i);
    if (idMatch) studentId = idMatch[1].trim();
  }

  const degreeMatch = normalizedText.match(/Degree\s+([^\n\r]+?)(?:\s+Date of Graduation|\n|$)/i);
  if (degreeMatch) degree = degreeMatch[1].trim();

  const programMatch = normalizedText.match(/Program\s+([^\n\r]+?)(?:\s+Date of|\n|$)/i);
  if (programMatch) program = programMatch[1].trim();

  const studentInfo: StudentInfo = {
    name,
    studentId,
    degree,
    program,
  };

  // 2. Parse Semesters and Courses
  const allCourses: CourseEntry[] = [];
  let currentSemester = '';
  let lastCourse: CourseEntry | null = null;

  const lines = normalizedText.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Check for semester header
    const semMatch = line.match(SEMESTER_REGEX);
    if (semMatch) {
      currentSemester = semMatch[0].trim();
      lastCourse = null;
      continue;
    }

    // Check for course line
    const courseMatch = line.match(COURSE_LINE_REGEX);
    if (courseMatch) {
      const code = courseMatch[1];
      const title = courseMatch[2].replace(/\s+/g, ' ').trim();
      const credits = parseInt(courseMatch[3], 10);
      const rawGrade = courseMatch[4] ? courseMatch[4].trim().toUpperCase() : '';
      const isCompleted = PASSING_GRADES.has(rawGrade);

      const entry: CourseEntry = {
        code,
        title,
        credits,
        grade: rawGrade,
        semester: currentSemester,
        isCompleted,
      };

      allCourses.push(entry);
      lastCourse = entry;
      continue;
    }

    // Check for boundary / header / footer lines
    const isBoundary = BOUNDARY_PATTERNS.some((pattern) => pattern.test(line));
    if (isBoundary) {
      lastCourse = null;
      continue;
    }

    // If not a boundary and an active course exists, append as title continuation
    if (lastCourse) {
      lastCourse.title = `${lastCourse.title} ${line}`.replace(/\s+/g, ' ').trim();
    }
  }

  // 3. Extract Summary / Footer Metrics
  const totalCreditsMatch = normalizedText.match(/Total\s+(?:number\s+of\s+)?credits?\s+earned\s*:\s*(\d+)/i);
  const totalCreditsEarned = totalCreditsMatch
    ? parseInt(totalCreditsMatch[1], 10)
    : allCourses.filter((c) => c.isCompleted).reduce((sum, c) => sum + c.credits, 0);

  const gpaMatch = normalizedText.match(/Cumulative\s+GPA\s*:\s*([\d.]+)/i);
  const cumulativeGPA = gpaMatch ? parseFloat(gpaMatch[1]) : 0;

  return {
    studentInfo,
    allCourses,
    summary: {
      totalCreditsEarned,
      cumulativeGPA,
    },
  };
}
