import { describe, it, expect } from 'vitest';
import { auditGraduation } from './calculator';
import { parseTranscriptText } from './parser';
import { CourseEntry, StudentInfo } from './types';

const mockStudent: StudentInfo = {
  name: 'Mr. Teerasak Khlaiphet',
  studentId: '67050252',
  degree: 'Bachelor of Science',
  program: 'Computer Science',
};

const mockCourses: CourseEntry[] = [
  // Math mandatory (9 cr completed)
  { code: '05506231', title: 'STATISTICS AND PROBABILITY', credits: 3, grade: 'C', semester: '1/2024', isCompleted: true },
  { code: '05506232', title: 'MATHEMATICS FOR COMPUTER SCIENCE', credits: 3, grade: 'B+', semester: '1/2024', isCompleted: true },
  { code: '05506001', title: 'DISCRETE MATHEMATICS', credits: 3, grade: 'C', semester: '2/2024', isCompleted: true },
  // CS mandatory (6 cr completed, 3 cr in-progress)
  { code: '05506003', title: 'PROGRAMMING FUNDAMENTALS', credits: 3, grade: 'C+', semester: '1/2024', isCompleted: true },
  { code: '05506005', title: 'COMPUTER SCIENCE', credits: 3, grade: 'B', semester: '1/2024', isCompleted: true },
  { code: '05506014', title: 'COMPUTER GRAPHICS', credits: 3, grade: '', semester: '1/2026', isCompleted: false },
  // GE with alias (90641007 -> 90641002 Digital Citizen)
  { code: '90641007', title: 'DIGITAL CITIZEN', credits: 3, grade: 'S', semester: '2/2024', isCompleted: true },
];

const FULL_REAL_TRANSCRIPT = `
( Unofficial Transcript )
Photo
Name Mr. Teerasak Khlaiphet Student ID 67050252
Date of Birth July 5, 2005 Date of Admission 2024
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

describe('Credit Audit Calculator Model', () => {
  describe('Basic Categorization and Credit Summation', () => {
    it('should categorize math and cs mandatory courses correctly', () => {
      const audit = auditGraduation(mockStudent, mockCourses, 'special_problem');
      expect(audit.categories.math_mandatory.earnedCredits).toBe(9);
      expect(audit.categories.cs_mandatory.earnedCredits).toBe(6);
      expect(audit.categories.cs_mandatory.inProgressCredits).toBe(3);
    });

    it('should resolve course aliases (90641007 -> 90641002 in GE Foundation)', () => {
      const audit = auditGraduation(mockStudent, mockCourses, 'special_problem');
      expect(audit.categories.ge_foundation.earnedCredits).toBe(3);
      expect(audit.categories.ge_foundation.isMet).toBe(false); // requires 6
    });

    it('should list missing mandatory courses', () => {
      const audit = auditGraduation(mockStudent, mockCourses, 'special_problem');
      const missingCodes = audit.missingMandatory.map(c => c.code);
      expect(missingCodes).toContain('05506233'); // Calculus 2
      expect(missingCodes).toContain('05506239'); // Practical Project
      expect(missingCodes).toContain('05506014'); // Computer Graphics (in-progress, not yet completed)
      expect(missingCodes).not.toContain('05506003'); // Completed
    });

    it('should accurately calculate total graduation eligibility for partial transcript', () => {
      const audit = auditGraduation(mockStudent, mockCourses, 'special_problem');
      expect(audit.isEligibleToGraduate).toBe(false);
      expect(audit.totalEarned).toBe(18); // 9 + 6 + 3
      expect(audit.totalRequired).toBe(135);
      expect(audit.currentPath).toBe('special_problem');
      expect(audit.inProgressCourses.length).toBe(1);
      expect(audit.inProgressCourses[0].code).toBe('05506014');
    });
  });

  describe('Legacy Course Code Aliases', () => {
    it('should resolve legacy algorithm analysis code 05506009 to 05506236', () => {
      const courses: CourseEntry[] = [
        { code: '05506009', title: 'ALGORITHM ANALYSIS', credits: 3, grade: 'B', semester: '2/2024', isCompleted: true },
      ];
      const audit = auditGraduation(mockStudent, courses, 'special_problem');
      expect(audit.categories.cs_mandatory.earnedCredits).toBe(3);
      const missingCodes = audit.missingMandatory.map(c => c.code);
      expect(missingCodes).not.toContain('05506236');
    });

    it('should resolve legacy seminar code 05506018 to 05506013', () => {
      const courses: CourseEntry[] = [
        { code: '05506018', title: 'SEMINAR', credits: 1, grade: 'A', semester: '2/2025', isCompleted: true },
      ];
      const audit = auditGraduation(mockStudent, courses, 'special_problem');
      expect(audit.categories.cs_mandatory.earnedCredits).toBe(1);
      const missingCodes = audit.missingMandatory.map(c => c.code);
      expect(missingCodes).not.toContain('05506013');
    });
  });

  describe('Alternative Study Path Switching', () => {
    it('should require Special Problem 1 and 2 when special_problem is selected', () => {
      const audit = auditGraduation(mockStudent, mockCourses, 'special_problem');
      const missingCodes = audit.missingMandatory.map(c => c.code);
      expect(missingCodes).toContain('05506098'); // Special Problem 1
      expect(missingCodes).toContain('05506099'); // Special Problem 2
      expect(missingCodes).not.toContain('05506117'); // Coop
    });

    it('should require Cooperative Education when coop is selected', () => {
      const audit = auditGraduation(mockStudent, mockCourses, 'coop');
      const missingCodes = audit.missingMandatory.map(c => c.code);
      expect(missingCodes).toContain('05506117'); // Coop
      expect(missingCodes).not.toContain('05506098'); // Special Problem 1
      expect(missingCodes).not.toContain('05506099'); // Special Problem 2
    });

    it('should satisfy alternative study when completed on the active path', () => {
      const spCourses: CourseEntry[] = [
        { code: '05506098', title: 'SPECIAL PROBLEM 1', credits: 3, grade: 'A', semester: '1/2026', isCompleted: true },
        { code: '05506099', title: 'SPECIAL PROBLEM 2', credits: 3, grade: 'A', semester: '2/2026', isCompleted: true },
      ];
      const auditSP = auditGraduation(mockStudent, spCourses, 'special_problem');
      expect(auditSP.categories.alternative_study.earnedCredits).toBe(6);
      expect(auditSP.categories.alternative_study.isMet).toBe(true);
      const missingSP = auditSP.missingMandatory.map(c => c.code);
      expect(missingSP).not.toContain('05506098');
      expect(missingSP).not.toContain('05506099');

      // But on coop path, SP courses count towards CS Elective and coop is missing
      const auditCoop = auditGraduation(mockStudent, spCourses, 'coop');
      expect(auditCoop.categories.alternative_study.earnedCredits).toBe(0);
      expect(auditCoop.categories.alternative_study.isMet).toBe(false);
      expect(auditCoop.categories.cs_elective.earnedCredits).toBe(6);
      const missingCoop = auditCoop.missingMandatory.map(c => c.code);
      expect(missingCoop).toContain('05506117');
    });
  });

  describe('Full Real Transcript Verification (Teerasak Khlaiphet)', () => {
    it('should calculate audit metrics matching official transcript values exactly', () => {
      const parsed = parseTranscriptText(FULL_REAL_TRANSCRIPT);
      const audit = auditGraduation(parsed.studentInfo, parsed.allCourses, 'special_problem', parsed.summary.cumulativeGPA);

      expect(audit.studentInfo.name).toBe('Mr. Teerasak Khlaiphet');
      expect(audit.studentInfo.studentId).toBe('67050252');
      expect(audit.totalEarned).toBe(85);
      expect(audit.totalRequired).toBe(135);
      expect(audit.cumulativeGPA).toBe(3.03);
      expect(audit.isEligibleToGraduate).toBe(false);

      // Verify categories
      // GE Foundation: Charm School (3) + Digital Citizen (3) = 6 cr (Met)
      expect(audit.categories.ge_foundation.earnedCredits).toBe(6);
      expect(audit.categories.ge_foundation.requiredCredits).toBe(6);
      expect(audit.categories.ge_foundation.isMet).toBe(true);

      // GE Language: FE1 (3) + FE2 (3) = 6 cr, 1 in-progress (3 cr) (Not met)
      expect(audit.categories.ge_lang.earnedCredits).toBe(6);
      expect(audit.categories.ge_lang.inProgressCredits).toBe(3);
      expect(audit.categories.ge_lang.requiredCredits).toBe(9);
      expect(audit.categories.ge_lang.isMet).toBe(false);

      // GE Electives: Magic Mirror (3) + Coding with Python (3) + Fun with Coding (3) + From Dev to the Moon (3) = 12 cr (Not met)
      expect(audit.categories.ge_elective.earnedCredits).toBe(12);
      expect(audit.categories.ge_elective.requiredCredits).toBe(15);
      expect(audit.categories.ge_elective.isMet).toBe(false);

      // Math Mandatory: 5 courses completed = 15 cr (missing Calculus 2)
      expect(audit.categories.math_mandatory.earnedCredits).toBe(15);
      expect(audit.categories.math_mandatory.requiredCredits).toBe(18);
      expect(audit.categories.math_mandatory.isMet).toBe(false);

      // CS Mandatory: 16 courses completed = 46 cr, 3 in-progress (9 cr)
      expect(audit.categories.cs_mandatory.earnedCredits).toBe(46);
      expect(audit.categories.cs_mandatory.inProgressCredits).toBe(9);
      expect(audit.categories.cs_mandatory.requiredCredits).toBe(57);
      expect(audit.categories.cs_mandatory.isMet).toBe(false);

      // CS Elective: 0 completed, 1 in-progress (Cloud Computing, 3 cr)
      expect(audit.categories.cs_elective.earnedCredits).toBe(0);
      expect(audit.categories.cs_elective.inProgressCredits).toBe(3);
      expect(audit.categories.cs_elective.requiredCredits).toBe(18);
      expect(audit.categories.cs_elective.isMet).toBe(false);

      // Alternative Study & Free Elective
      expect(audit.categories.alternative_study.earnedCredits).toBe(0);
      expect(audit.categories.free_elective.earnedCredits).toBe(0);

      // In-progress tracking
      expect(audit.inProgressCourses.length).toBe(5);
      const inProgressCodes = audit.inProgressCourses.map(c => c.code);
      expect(inProgressCodes).toEqual(expect.arrayContaining([
        '05506014', // Computer Graphics
        '05506235', // Digital Innovation
        '05506237', // Prog Lang Concepts
        '05506258', // Cloud Computing
        '90644010', // Reading & Writing English
      ]));

      // Missing mandatory courses (8 courses on special_problem path)
      const missingCodes = audit.missingMandatory.map(c => c.code);
      expect(missingCodes).toEqual(expect.arrayContaining([
        '05506233', // Calculus
        '05506014', // Computer Graphics (in progress)
        '05506235', // Digital Innovation (in progress)
        '05506237', // Prog Lang Concepts (in progress)
        '05506239', // Practical Project
        '05506013', // Seminar
        '05506098', // Special Problem 1
        '05506099', // Special Problem 2
      ]));
      expect(audit.missingMandatory.length).toBe(8);
    });
  });

  describe('Elective Overflow to Free Elective', () => {
    it('should overflow excess GE electives into free electives', () => {
      // 5 courses in GE elective (15 cr) + 1 extra GE elective (3 cr) + 1 regular free elective (3 cr)
      const courses: CourseEntry[] = [
        { code: '90642101', title: 'GE ELEC 1', credits: 3, grade: 'A', semester: '1/2024', isCompleted: true },
        { code: '90642102', title: 'GE ELEC 2', credits: 3, grade: 'A', semester: '1/2024', isCompleted: true },
        { code: '90642103', title: 'GE ELEC 3', credits: 3, grade: 'A', semester: '1/2024', isCompleted: true },
        { code: '90642104', title: 'GE ELEC 4', credits: 3, grade: 'A', semester: '1/2024', isCompleted: true },
        { code: '90642105', title: 'GE ELEC 5', credits: 3, grade: 'A', semester: '1/2024', isCompleted: true },
        { code: '90642106', title: 'GE ELEC 6', credits: 3, grade: 'A', semester: '2/2024', isCompleted: true },
        { code: '01006001', title: 'ENGINEERING ELECTIVE', credits: 3, grade: 'B', semester: '2/2024', isCompleted: true },
      ];
      const audit = auditGraduation(mockStudent, courses, 'special_problem');
      expect(audit.categories.ge_elective.earnedCredits).toBe(15);
      expect(audit.categories.ge_elective.isMet).toBe(true);
      expect(audit.categories.free_elective.earnedCredits).toBe(6); // 3 from GE overflow + 3 from other faculty
      expect(audit.categories.free_elective.isMet).toBe(true);
      expect(audit.totalEarned).toBe(21);
    });

    it('should overflow excess CS electives into free electives', () => {
      // 6 CS electives (18 cr) + 2 extra CS electives (6 cr)
      const courses: CourseEntry[] = Array.from({ length: 8 }, (_, i) => ({
        code: `055069${String(i).padStart(2, '0')}`,
        title: `CS ELECTIVE ${i + 1}`,
        credits: 3,
        grade: 'B+',
        semester: '1/2025',
        isCompleted: true,
      }));
      const audit = auditGraduation(mockStudent, courses, 'special_problem');
      expect(audit.categories.cs_elective.earnedCredits).toBe(18);
      expect(audit.categories.cs_elective.isMet).toBe(true);
      expect(audit.categories.free_elective.earnedCredits).toBe(6);
      expect(audit.categories.free_elective.isMet).toBe(true);
      expect(audit.totalEarned).toBe(24);
    });
  });

  describe('Graduation Eligibility (135 Credits Fully Satisfied)', () => {
    it('should mark eligible to graduate when all 135 credits and mandatory courses are completed', () => {
      // Build a complete 135 credit course set:
      // Math: 6 courses (18 cr)
      const mathCourses: CourseEntry[] = [
        { code: '05506232', title: 'MATH CS', credits: 3, grade: 'A', semester: '1/2024', isCompleted: true },
        { code: '05506231', title: 'STATS', credits: 3, grade: 'A', semester: '1/2024', isCompleted: true },
        { code: '05506233', title: 'CALCULUS', credits: 3, grade: 'A', semester: '2/2024', isCompleted: true },
        { code: '05506001', title: 'DISCRETE', credits: 3, grade: 'A', semester: '2/2024', isCompleted: true },
        { code: '05506250', title: 'LINEAR ALGEBRA', credits: 3, grade: 'A', semester: '1/2025', isCompleted: true },
        { code: '05506002', title: 'NUMERICAL', credits: 3, grade: 'A', semester: '2/2025', isCompleted: true },
      ];

      // CS Mandatory: 21 courses (57 cr)
      const csMandatoryCodes = [
        ['05506003', 3], ['05506005', 3], ['05506004', 3], ['05506008', 3],
        ['05506015', 3], ['05506006', 3], ['05506007', 3], ['05506012', 3],
        ['05506234', 3], ['05506017', 3], ['05506238', 1], ['05506236', 3],
        ['05506113', 3], ['05506016', 3], ['05506011', 3], ['05506210', 3],
        ['05506014', 3], ['05506237', 3], ['05506235', 3], ['05506239', 1],
        ['05506013', 1],
      ] as const;
      const csCourses: CourseEntry[] = csMandatoryCodes.map(([code, credits]) => ({
        code,
        title: `CS MANDATORY ${code}`,
        credits,
        grade: 'A',
        semester: '1/2025',
        isCompleted: true,
      }));

      // Alternative Study: Coop (6 cr)
      const coopCourses: CourseEntry[] = [
        { code: '05506117', title: 'COOPERATIVE EDUCATION', credits: 6, grade: 'A', semester: '1/2027', isCompleted: true },
      ];

      // GE Foundation: 2 courses (6 cr)
      const geFoundationCourses: CourseEntry[] = [
        { code: '90642999', title: 'CHARM SCHOOL', credits: 3, grade: 'S', semester: '1/2024', isCompleted: true },
        { code: '90641002', title: 'DIGITAL CITIZEN', credits: 3, grade: 'S', semester: '2/2024', isCompleted: true },
      ];

      // GE Language: 3 courses (9 cr)
      const geLangCourses: CourseEntry[] = [
        { code: '90644007', title: 'FE 1', credits: 3, grade: 'S', semester: '1/2024', isCompleted: true },
        { code: '90644008', title: 'FE 2', credits: 3, grade: 'S', semester: '2/2024', isCompleted: true },
        { code: '90644010', title: 'EN ELEC', credits: 3, grade: 'A', semester: '1/2026', isCompleted: true },
      ];

      // GE Electives: 5 courses (15 cr)
      const geElecCourses: CourseEntry[] = Array.from({ length: 5 }, (_, i) => ({
        code: `9064210${i + 1}`,
        title: `GE ELEC ${i + 1}`,
        credits: 3,
        grade: 'A',
        semester: '2/2025',
        isCompleted: true,
      }));

      // CS Electives: 6 courses (18 cr)
      const csElecCourses: CourseEntry[] = Array.from({ length: 6 }, (_, i) => ({
        code: `0550680${i}`,
        title: `CS ELEC ${i + 1}`,
        credits: 3,
        grade: 'A',
        semester: '2/2026',
        isCompleted: true,
      }));

      // Free Electives: 2 courses (6 cr)
      const freeElecCourses: CourseEntry[] = [
        { code: '01006001', title: 'FREE ELEC 1', credits: 3, grade: 'A', semester: '2/2026', isCompleted: true },
        { code: '01006002', title: 'FREE ELEC 2', credits: 3, grade: 'A', semester: '2/2026', isCompleted: true },
      ];

      const allCompletedCourses = [
        ...mathCourses,
        ...csCourses,
        ...coopCourses,
        ...geFoundationCourses,
        ...geLangCourses,
        ...geElecCourses,
        ...csElecCourses,
        ...freeElecCourses,
      ];

      const audit = auditGraduation(mockStudent, allCompletedCourses, 'coop');
      expect(audit.totalEarned).toBe(135);
      expect(audit.missingMandatory.length).toBe(0);
      expect(Object.values(audit.categories).every(c => c.isMet)).toBe(true);
      expect(audit.isEligibleToGraduate).toBe(true);
    });
  });

  describe('GPA Calculation Fallback', () => {
    it('should calculate weighted GPA correctly when summaryGPA is not provided', () => {
      const courses: CourseEntry[] = [
        { code: '05506003', title: 'PROG FUND', credits: 3, grade: 'A', semester: '1/2024', isCompleted: true }, // 4 * 3 = 12
        { code: '05506005', title: 'CS', credits: 3, grade: 'B', semester: '1/2024', isCompleted: true },        // 3 * 3 = 9
        { code: '90642999', title: 'CHARM SCHOOL', credits: 3, grade: 'S', semester: '1/2024', isCompleted: true }, // S ignored
      ];
      // (12 + 9) / 6 = 21 / 6 = 3.50
      const audit = auditGraduation(mockStudent, courses, 'special_problem');
      expect(audit.cumulativeGPA).toBe(3.50);
    });

    it('should prioritize summaryGPA when provided', () => {
      const courses: CourseEntry[] = [
        { code: '05506003', title: 'PROG FUND', credits: 3, grade: 'A', semester: '1/2024', isCompleted: true },
      ];
      const audit = auditGraduation(mockStudent, courses, 'special_problem', 3.88);
      expect(audit.cumulativeGPA).toBe(3.88);
    });
  });

  describe('Edge Cases and Resiliency', () => {
    it('should handle empty courses array gracefully', () => {
      const audit = auditGraduation(mockStudent, [], 'special_problem');
      expect(audit.totalEarned).toBe(0);
      expect(audit.totalRequired).toBe(135);
      expect(audit.cumulativeGPA).toBe(0);
      expect(audit.isEligibleToGraduate).toBe(false);
      expect(audit.inProgressCourses).toEqual([]);
      // 27 mandatory (6 math + 21 cs) + 2 special problem = 29
      expect(audit.missingMandatory.length).toBe(29);
      expect(Object.values(audit.categories).every(c => c.earnedCredits === 0)).toBe(true);
      expect(Object.values(audit.categories).every(c => !c.isMet)).toBe(true);
    });

    it('should not double-count earned credits for retaken completed courses', () => {
      const courses: CourseEntry[] = [
        { code: '05506001', title: 'DISCRETE MATH', credits: 3, grade: 'D', semester: '1/2024', isCompleted: true },
        { code: '05506001', title: 'DISCRETE MATH', credits: 3, grade: 'B', semester: '2/2024', isCompleted: true },
      ];
      const audit = auditGraduation(mockStudent, courses, 'special_problem');
      expect(audit.categories.math_mandatory.earnedCredits).toBe(3);
      expect(audit.totalEarned).toBe(3);
    });

    it('should not count failed courses towards earned credits', () => {
      const courses: CourseEntry[] = [
        { code: '05506003', title: 'PROG FUND', credits: 3, grade: 'F', semester: '1/2024', isCompleted: false },
      ];
      const audit = auditGraduation(mockStudent, courses, 'special_problem');
      expect(audit.categories.cs_mandatory.earnedCredits).toBe(0);
      expect(audit.categories.cs_mandatory.inProgressCredits).toBe(3);
      expect(audit.missingMandatory.map(c => c.code)).toContain('05506003');
    });
  });
});
