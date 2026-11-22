import { describe, it, expect } from 'vitest';
import { parseTranscriptText } from './parser';

const SAMPLE_TRANSCRIPT = `
Name Mr. Sample Student Student ID 65050000
Degree Bachelor of Science Date of Graduation N/A
Program Computer Science
COURSE TITLE CREDIT GRADE COURSE TITLE CREDIT GRADE
1st Semester, Year, 2024-2025
05506003 PROGRAMMING FUNDAMENTALS 3 C+
05506005 COMPUTER SCIENCE 3 B
90642999 CHARM SCHOOL 3 S
GPS : 2.90 GPA : 2.90
1st Semester, Year, 2026-2027
05506014 COMPUTER GRAPHICS 3
05506210 ARTIFICIAL INTELLIGENCE 3 B+
05506235 DIGITAL INNOVATION AND TECHNOLOGY 3
MANAGEMENT IN DISRUPTIVE ERA
90644010 DEVELOPMENT OF READING AND WRITING 3
SKILLS IN ENGLISH
Total number of credit earned: 85
Cumulative GPA: 3.03
`;

const FULL_REAL_TRANSCRIPT = `
( Unofficial Transcript )
Photo
Name Mr. Sample Student Student ID 65050000
Date of Birth January 1, 2003 Date of Admission 2022
Degree Bachelor of Science Date of Graduation N/A
Program Computer Science
COURSE TITLE CREDIT GRADE COURSE TITLE CREDIT GRADE
1st Semester, Year, 2024-2025
05506003 PROGRAMMING FUNDAMENTALS 3 C+
05506005 COMPUTER SCIENCE 3 B
05506231 STATISTICS AND PROBABILITY 3 C
05506232 MATHEMATICS FOR COMPUTER SCIENCE 3 B+
90642144 MAGIC MIRROR 3 B+
90642999 CHARM SCHOOL 3 S
90644007 FOUNDATION ENGLISH 1 3 S
GPS : 2.90 GPA : 2.90
2nd Semester, Year, 2024-2025
05506001 DISCRETE MATHEMATICS 3 C
05506004 OBJECT-ORIENTED PROGRAMMING 3 C+
05506008 COMPUTER ORGANIZATION AND ARCHITECTURE 3 B+
05506015 COMPUTER ETHICS: SOCIAL AND PROFESSIONAL 3 B
ISSUES
90641007 DIGITAL CITIZEN 3 S
90644008 FOUNDATION ENGLISH 2 3 S
GPS : 2.75 GPA : 2.83
1st Semester, Year, 2025-2026
05506006 DATA STRUCTURES AND ALGORITHMS 3 B+
05506007 OPERATING SYSTEMS 3 C
05506012 DATABASE SYSTEMS 3 B
05506017 SOFTWARE ENGINEERING 3 C+
05506234 BUSINESS ANALYSIS AND PROCESS MANAGEMENT 3 B+
05506238 SEMINAR IN MODERN PLATFORM TECHNOLOGIES 1 A
05506250 LINEAR ALGEBRA FOR COMPUTER SCIENCE 3 B
90642211 CODING WITH PYTHON 3 A
GPS : 3.11 GPA : 2.96
2nd Semester, Year, 2025-2026
05506002 METHODS OF NUMERICAL COMPUTATION 3 B+
05506011 HUMAN-COMPUTER INTERACTION 3 B
05506016 DATA COMMUNICATION AND NETWORK SYSTEMS 3 B
05506113 SOFTWARE ANALYSIS AND DESIGN 3 C+
05506236 ANALYSIS AND DESIGN OF ALGORITHMS 3 B
90642111 FUN WITH CODING 3 A
GPS : 3.17 GPA : 3.01
1st Semester, Year, 2026-2027
05506014 COMPUTER GRAPHICS 3
05506210 ARTIFICIAL INTELLIGENCE 3 B+
05506235 DIGITAL INNOVATION AND TECHNOLOGY 3
MANAGEMENT IN DISRUPTIVE ERA
05506237 PROGRAMMING LANGUAGE CONCEPTS AND 3
PARADIGMS
05506258 CLOUD COMPUTING AND VIRTUALIZATION 3
TECHNOLOGY
90642208 FROM DEV TO THE MOON 3 B
90644010 DEVELOPMENT OF READING AND WRITING 3
SKILLS IN ENGLISH
GPS : 3.25 GPA : 3.03
Total number of credit earned: 85
Cumulative GPA: 3.03
-------------------------------- Transcript Closed --------------------------------
Checked by ______________________________________________
(Xx Xxxxxxxxx Xxxxxxxxxxxxx)
Date Issued: November 21, 2026 This document is unofficial transcript.
`;

describe('Transcript Parser Model', () => {
  describe('Basic Sample Transcript', () => {
    it('should parse student metadata correctly', () => {
      const result = parseTranscriptText(SAMPLE_TRANSCRIPT);
      expect(result.studentInfo.studentId).toBe('65050000');
      expect(result.studentInfo.name).toBe('Mr. Sample Student');
      expect(result.studentInfo.program).toBe('Computer Science');
      expect(result.studentInfo.degree).toBe('Bachelor of Science');
      expect(result.summary.totalCreditsEarned).toBe(85);
      expect(result.summary.cumulativeGPA).toBe(3.03);
    });

    it('should concatenate multi-line course titles correctly', () => {
      const result = parseTranscriptText(SAMPLE_TRANSCRIPT);
      const multiLine = result.allCourses.find(c => c.code === '05506235');
      expect(multiLine).toBeDefined();
      expect(multiLine?.title).toBe('DIGITAL INNOVATION AND TECHNOLOGY MANAGEMENT IN DISRUPTIVE ERA');
      expect(multiLine?.credits).toBe(3);
      expect(multiLine?.grade).toBe('');
      expect(multiLine?.isCompleted).toBe(false);

      const readingWriting = result.allCourses.find(c => c.code === '90644010');
      expect(readingWriting).toBeDefined();
      expect(readingWriting?.title).toBe('DEVELOPMENT OF READING AND WRITING SKILLS IN ENGLISH');
      expect(readingWriting?.credits).toBe(3);
      expect(readingWriting?.grade).toBe('');
      expect(readingWriting?.isCompleted).toBe(false);
    });

    it('should distinguish completed courses from in-progress courses', () => {
      const result = parseTranscriptText(SAMPLE_TRANSCRIPT);
      const completed = result.allCourses.find(c => c.code === '05506003');
      expect(completed?.isCompleted).toBe(true);
      expect(completed?.grade).toBe('C+');

      const inProgress = result.allCourses.find(c => c.code === '05506014');
      expect(inProgress?.isCompleted).toBe(false);
      expect(inProgress?.grade).toBe('');
    });

    it('should track semester correctly for courses', () => {
      const result = parseTranscriptText(SAMPLE_TRANSCRIPT);
      const firstSemCourse = result.allCourses.find(c => c.code === '05506003');
      expect(firstSemCourse?.semester).toBe('1st Semester, Year, 2024-2025');

      const currentSemCourse = result.allCourses.find(c => c.code === '05506014');
      expect(currentSemCourse?.semester).toBe('1st Semester, Year, 2026-2027');
    });

    it('should treat grade S as completed', () => {
      const result = parseTranscriptText(SAMPLE_TRANSCRIPT);
      const charmSchool = result.allCourses.find(c => c.code === '90642999');
      expect(charmSchool?.isCompleted).toBe(true);
      expect(charmSchool?.grade).toBe('S');
    });
  });

  describe('Full Real KMITL Transcript', () => {
    it('should parse all courses from the full transcript (34 total: 29 completed + 5 in-progress)', () => {
      const result = parseTranscriptText(FULL_REAL_TRANSCRIPT);

      expect(result.studentInfo).toEqual({
        name: 'Mr. Sample Student',
        studentId: '65050000',
        degree: 'Bachelor of Science',
        program: 'Computer Science',
      });

      expect(result.summary).toEqual({
        totalCreditsEarned: 85,
        cumulativeGPA: 3.03,
      });

      expect(result.allCourses.length).toBe(34);

      const completedCourses = result.allCourses.filter(c => c.isCompleted);
      expect(completedCourses.length).toBe(29);

      const inProgressCourses = result.allCourses.filter(c => !c.isCompleted);
      expect(inProgressCourses.length).toBe(5);

      const earnedCredits = completedCourses.reduce((sum, c) => sum + c.credits, 0);
      expect(earnedCredits).toBe(85);
    });

    it('should handle completed course with multi-line title', () => {
      const result = parseTranscriptText(FULL_REAL_TRANSCRIPT);
      const ethics = result.allCourses.find(c => c.code === '05506015');
      expect(ethics).toBeDefined();
      expect(ethics?.title).toBe('COMPUTER ETHICS: SOCIAL AND PROFESSIONAL ISSUES');
      expect(ethics?.credits).toBe(3);
      expect(ethics?.grade).toBe('B');
      expect(ethics?.isCompleted).toBe(true);
      expect(ethics?.semester).toBe('2nd Semester, Year, 2024-2025');
    });

    it('should handle all multi-line in-progress courses', () => {
      const result = parseTranscriptText(FULL_REAL_TRANSCRIPT);

      const langConcepts = result.allCourses.find(c => c.code === '05506237');
      expect(langConcepts?.title).toBe('PROGRAMMING LANGUAGE CONCEPTS AND PARADIGMS');
      expect(langConcepts?.grade).toBe('');
      expect(langConcepts?.isCompleted).toBe(false);

      const cloud = result.allCourses.find(c => c.code === '05506258');
      expect(cloud?.title).toBe('CLOUD COMPUTING AND VIRTUALIZATION TECHNOLOGY');
      expect(cloud?.grade).toBe('');
      expect(cloud?.isCompleted).toBe(false);
    });
  });

  describe('Edge Cases & Fallbacks', () => {
    it('should handle empty or whitespace text gracefully', () => {
      const result = parseTranscriptText('   ');
      expect(result.studentInfo).toEqual({
        name: '',
        studentId: '',
        degree: '',
        program: '',
      });
      expect(result.allCourses).toEqual([]);
      expect(result.summary).toEqual({
        totalCreditsEarned: 0,
        cumulativeGPA: 0,
      });
    });

    it('should mark grade F or U as not completed', () => {
      const text = `
1st Semester, Year, 2024-2025
05506099 SPECIAL PROJECT 3 F
05506098 SPECIAL TOPICS 3 U
      `;
      const result = parseTranscriptText(text);
      expect(result.allCourses.length).toBe(2);

      const failed = result.allCourses.find(c => c.code === '05506099');
      expect(failed?.grade).toBe('F');
      expect(failed?.isCompleted).toBe(false);

      const uCourse = result.allCourses.find(c => c.code === '05506098');
      expect(uCourse?.grade).toBe('U');
      expect(uCourse?.isCompleted).toBe(false);
    });

    it('should calculate totalCreditsEarned fallback from completed courses when summary is missing', () => {
      const text = `
1st Semester, Year, 2024-2025
05506003 PROGRAMMING FUNDAMENTALS 3 C+
05506005 COMPUTER SCIENCE 3 B
05506014 COMPUTER GRAPHICS 3
      `;
      const result = parseTranscriptText(text);
      expect(result.allCourses.length).toBe(3);
      expect(result.summary.totalCreditsEarned).toBe(6);
      expect(result.summary.cumulativeGPA).toBe(0);
    });
  });
});
