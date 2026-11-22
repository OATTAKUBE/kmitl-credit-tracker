import type {
  CurriculumDefinition,
  CurriculumCourse,
  AlternativePath,
  AlternativePathOption,
  CategoryRequirement,
  CategoryId,
} from '../types';

/**
 * Requirements for B.Sc. in Applied Statistics and Data Analytics (Curriculum 2564), KMITL
 * Total: 127 credits
 */
export const STAT_REQUIREMENTS: Record<string, CategoryRequirement> = {
  ge_foundation: {
    groupTH: 'หมวดวิชาศึกษาทั่วไป',
    nameTH: 'หมวดวิชาศึกษาทั่วไป - กลุ่มวิชาพื้นฐาน',
    shortNameTH: 'กลุ่มวิชาพื้นฐาน',
    nameEN: 'GE Foundation',
    requiredCredits: 6,
  },
  ge_lang: {
    groupTH: 'หมวดวิชาศึกษาทั่วไป',
    nameTH: 'หมวดวิชาศึกษาทั่วไป - กลุ่มวิชาด้านภาษาและการสื่อสาร',
    shortNameTH: 'กลุ่มภาษาและการสื่อสาร',
    nameEN: 'GE Language & Communication',
    requiredCredits: 9,
  },
  ge_science: {
    groupTH: 'หมวดวิชาศึกษาทั่วไป',
    nameTH: 'หมวดวิชาศึกษาทั่วไป - กลุ่มวิชาตามเกณฑ์คณะวิทยาศาสตร์',
    shortNameTH: 'กลุ่มเกณฑ์คณะวิทยาศาสตร์',
    nameEN: 'Faculty of Science General Courses',
    requiredCredits: 9,
  },
  ge_elective: {
    groupTH: 'หมวดวิชาศึกษาทั่วไป',
    nameTH: 'หมวดวิชาศึกษาทั่วไป - กลุ่มวิชาเลือก',
    shortNameTH: 'กลุ่มวิชาเลือกทั่วไป',
    nameEN: 'GE Electives',
    requiredCredits: 6,
  },
  stat_core: {
    groupTH: 'หมวดวิชาเฉพาะ',
    nameTH: 'หมวดวิชาเฉพาะ - กลุ่มวิชาแกน',
    shortNameTH: 'กลุ่มวิชาแกนวิทยาศาสตร์และคณิตศาสตร์',
    nameEN: 'Core Courses',
    requiredCredits: 15,
  },
  stat_mandatory: {
    groupTH: 'หมวดวิชาเฉพาะ',
    nameTH: 'หมวดวิชาเฉพาะ - กลุ่มวิชาบังคับ',
    shortNameTH: 'วิชาบังคับสถิติประยุกต์',
    nameEN: 'Applied Statistics Mandatory',
    requiredCredits: 55,
  },
  stat_elective: {
    groupTH: 'หมวดวิชาเฉพาะ',
    nameTH: 'หมวดวิชาเฉพาะ - กลุ่มวิชาเลือก',
    shortNameTH: 'วิชาเลือกสถิติประยุกต์',
    nameEN: 'Statistics Electives',
    requiredCredits: 15,
  },
  alternative_study: {
    groupTH: 'หมวดวิชาเฉพาะ',
    nameTH: 'หมวดวิชาเฉพาะ - การศึกษาทางเลือก',
    shortNameTH: 'การศึกษาทางเลือก',
    nameEN: 'Alternative Study',
    requiredCredits: 6,
  },
  free_elective: {
    groupTH: 'หมวดวิชาเลือกเสรี',
    nameTH: 'หมวดวิชาเลือกเสรี',
    shortNameTH: 'วิชาเลือกเสรี',
    nameEN: 'Free Electives',
    requiredCredits: 6,
  },
};

export const STAT_ORDERED_CATEGORIES: CategoryId[] = [
  'ge_foundation',
  'ge_lang',
  'ge_science',
  'ge_elective',
  'stat_core',
  'stat_mandatory',
  'stat_elective',
  'alternative_study',
  'free_elective',
];

/**
 * Core Courses (15 credits required)
 */
export const STAT_CORE_COURSES: CurriculumCourse[] = [
  {
    code: '05016201',
    titleTH: 'แคลคูลัส 1',
    titleEN: 'CALCULUS 1',
    credits: 3,
    category: 'stat_core',
    isMandatory: true,
  },
  {
    code: '05016210',
    titleTH: 'พีชคณิตเชิงเส้น 1',
    titleEN: 'LINEAR ALGEBRA 1',
    credits: 3,
    category: 'stat_core',
    isMandatory: true,
  },
  {
    code: '05406002',
    titleTH: 'หลักสถิติ',
    titleEN: 'PRINCIPLES OF STATISTICS',
    credits: 3,
    category: 'stat_core',
    isMandatory: true,
  },
  {
    code: '05406003',
    titleTH: 'ความน่าจะเป็น',
    titleEN: 'PROBABILITY',
    credits: 3,
    category: 'stat_core',
    isMandatory: true,
  },
  {
    code: '05106030',
    titleTH: 'เคมีทั่วไป',
    titleEN: 'GENERAL CHEMISTRY',
    credits: 3,
    category: 'stat_core',
    isMandatory: false,
  },
  {
    code: '05206500',
    titleTH: 'ชีววิทยาทั่วไป',
    titleEN: 'GENERAL BIOLOGY',
    credits: 3,
    category: 'stat_core',
    isMandatory: false,
  },
  {
    code: '05306003',
    titleTH: 'ฟิสิกส์ทั่วไป',
    titleEN: 'GENERAL PHYSICS',
    credits: 3,
    category: 'stat_core',
    isMandatory: false,
  },
];

/**
 * Mandatory Statistics Courses (19 courses, 55 credits)
 */
export const STAT_MANDATORY_COURSES: CurriculumCourse[] = [
  {
    code: '05406096',
    titleTH: 'สถิติวิเคราะห์',
    titleEN: 'STATISTICAL ANALYSIS',
    credits: 3,
    category: 'stat_mandatory',
    isMandatory: true,
  },
  {
    code: '05406097',
    titleTH: 'การวิจัยดำเนินงาน',
    titleEN: 'OPERATIONS RESEARCH',
    credits: 3,
    category: 'stat_mandatory',
    isMandatory: true,
  },
  {
    code: '05406098',
    titleTH: 'การวิเคราะห์การถดถอยและสหสัมพันธ์',
    titleEN: 'REGRESSION AND CORRELATION ANALYSIS',
    credits: 3,
    category: 'stat_mandatory',
    isMandatory: true,
  },
  {
    code: '05406099',
    titleTH: 'การควบคุมคุณภาพเชิงสถิติ',
    titleEN: 'STATISTICAL QUALITY CONTROL',
    credits: 3,
    category: 'stat_mandatory',
    isMandatory: true,
  },
  {
    code: '05406100',
    titleTH: 'สถิติคณิตศาสตร์',
    titleEN: 'MATHEMATICAL STATISTICS',
    credits: 3,
    category: 'stat_mandatory',
    isMandatory: true,
  },
  {
    code: '05406102',
    titleTH: 'การทำเหมืองข้อมูลและการประยุกต์ใช้',
    titleEN: 'DATA MINING AND APPLICATIONS',
    credits: 3,
    category: 'stat_mandatory',
    isMandatory: true,
  },
  {
    code: '05406136',
    titleTH: 'อนุกรมเวลาและการพยากรณ์',
    titleEN: 'TIME SERIES AND FORECASTING',
    credits: 3,
    category: 'stat_mandatory',
    isMandatory: true,
  },
  {
    code: '05406137',
    titleTH: 'การวิเคราะห์ความแปรปรวนและการวางแผนการทดลอง',
    titleEN: 'ANALYSIS OF VARIANCE AND DESIGN OF EXPERIMENTS',
    credits: 3,
    category: 'stat_mandatory',
    isMandatory: true,
  },
  {
    code: '05406138',
    titleTH: 'ระเบียบวิธีวิจัย',
    titleEN: 'RESEARCH METHODOLOGY',
    credits: 3,
    category: 'stat_mandatory',
    isMandatory: true,
  },
  {
    code: '05406139',
    titleTH: 'สถิติประกันชีวิต',
    titleEN: 'ACTUARIAL STATISTICS',
    credits: 3,
    category: 'stat_mandatory',
    isMandatory: true,
  },
  {
    code: '05406140',
    titleTH: 'หัวข้อพิเศษทางด้านสถิติเชิงธุรกิจ',
    titleEN: 'SPECIAL TOPICS IN BUSINESS STATISTICS',
    credits: 3,
    category: 'stat_mandatory',
    isMandatory: true,
  },
  {
    code: '05406141',
    titleTH: 'การคิดเชิงสถิติเพื่อธุรกิจ',
    titleEN: 'STATISTICAL THINKING FOR BUSINESS',
    credits: 3,
    category: 'stat_mandatory',
    isMandatory: true,
  },
  {
    code: '05406142',
    titleTH: 'การวิเคราะห์ธุรกิจเบื้องต้น',
    titleEN: 'INTRODUCTION TO BUSINESS ANALYTICS',
    credits: 3,
    category: 'stat_mandatory',
    isMandatory: true,
  },
  {
    code: '05406143',
    titleTH: 'การเขียนโปรแกรมไพธอนเบื้องต้น',
    titleEN: 'INTRODUCTION TO PYTHON PROGRAMMING',
    credits: 3,
    category: 'stat_mandatory',
    isMandatory: true,
  },
  {
    code: '05406144',
    titleTH: 'การเขียนโปรแกรมเชิงออบเจกต์ด้วยภาษาจาวา',
    titleEN: 'OBJECT-ORIENTED PROGRAMMING IN JAVA',
    credits: 3,
    category: 'stat_mandatory',
    isMandatory: true,
  },
  {
    code: '05406145',
    titleTH: 'การจัดการฐานข้อมูล',
    titleEN: 'DATABASE MANAGEMENT',
    credits: 3,
    category: 'stat_mandatory',
    isMandatory: true,
  },
  {
    code: '05406146',
    titleTH: 'การเขียนโปรแกรมเชิงสถิติและการวิเคราะห์ข้อมูล',
    titleEN: 'STATISTICAL PROGRAMMING AND DATA ANALYSIS',
    credits: 3,
    category: 'stat_mandatory',
    isMandatory: true,
  },
  {
    code: '05406147',
    titleTH: 'โปรแกรมสำเร็จรูปเชิงสถิติ',
    titleEN: 'STATISTICAL SOFTWARE PACKAGES',
    credits: 3,
    category: 'stat_mandatory',
    isMandatory: true,
  },
  {
    code: '05406148',
    titleTH: 'สัมมนา',
    titleEN: 'SEMINAR',
    credits: 1,
    category: 'stat_mandatory',
    isMandatory: true,
  },
];

/**
 * Alternative Study Paths for Applied Statistics (6 credits each)
 */
export const STAT_ALTERNATIVE_PATHS: Record<AlternativePath, AlternativePathOption | undefined> = {
  special_problem: {
    nameTH: 'ปัญหาพิเศษ (Special Problem)',
    nameEN: 'Special Problem',
    credits: 6,
    courses: [
      {
        code: '05406167',
        titleTH: 'ปัญหาพิเศษ 2',
        titleEN: 'SPECIAL PROBLEM 2',
        credits: 6,
        category: 'alternative_study',
        isMandatory: false,
      },
    ],
  },
  coop: {
    nameTH: 'สหกิจศึกษา (Cooperative Education)',
    nameEN: 'Cooperative Education',
    credits: 6,
    courses: [
      {
        code: '05406168',
        titleTH: 'สหกิจศึกษา',
        titleEN: 'COOPERATIVE EDUCATION',
        credits: 6,
        category: 'alternative_study',
        isMandatory: false,
      },
    ],
  },
  overseas_training: {
    nameTH: 'การฝึกงานต่างประเทศ (Overseas Internship)',
    nameEN: 'Overseas Internship',
    credits: 6,
    courses: [
      {
        code: '05406169',
        titleTH: 'การปฏิบัติการฝึกงานต่างประเทศ 1',
        titleEN: 'OVERSEAS PRACTICAL TRAINING 1',
        credits: 3,
        category: 'alternative_study',
        isMandatory: false,
      },
      {
        code: '05406170',
        titleTH: 'การปฏิบัติการฝึกงานต่างประเทศ 2',
        titleEN: 'OVERSEAS PRACTICAL TRAINING 2',
        credits: 3,
        category: 'alternative_study',
        isMandatory: false,
      },
    ],
  },
};

const GE_FOUNDATION_CODES = new Set(['90641001', '90641002', '90641003']);
const STAT_CORE_CODES = new Set(['05016201', '05016210', '05406002', '05406003', '05106030', '05206500', '05306003']);
const STAT_MANDATORY_CODES = new Set(STAT_MANDATORY_COURSES.map((c) => c.code));
const STAT_ALTERNATIVE_CODES = new Set(['05406167', '05406168', '05406169', '05406170']);

export function classifyStatCourse(code: string): CategoryId {
  if (GE_FOUNDATION_CODES.has(code)) {
    return 'ge_foundation';
  }
  if (/^90644\d{3}$/.test(code) || code === '90644007' || code === '90644008') {
    return 'ge_lang';
  }
  if (/^9064[23]\d{3}$/.test(code)) {
    return 'ge_science';
  }
  if (/^9064\d{4}$/.test(code)) {
    return 'ge_elective';
  }
  if (STAT_CORE_CODES.has(code)) {
    return 'stat_core';
  }
  if (STAT_MANDATORY_CODES.has(code)) {
    return 'stat_mandatory';
  }
  if (STAT_ALTERNATIVE_CODES.has(code)) {
    return 'alternative_study';
  }
  if (/^05406\d{3}$/.test(code)) {
    return 'stat_elective';
  }
  return 'free_elective';
}

export const STAT_2564_CURRICULUM: CurriculumDefinition = {
  metadata: {
    id: 'stat_2564',
    nameTH: 'วท.บ. สถิติประยุกต์และการวิเคราะห์ข้อมูล (หลักสูตร 2564)',
    nameEN: 'B.Sc. in Applied Statistics and Data Analytics (2564)',
    facultyTH: 'คณะวิทยาศาสตร์ สจล.',
    degreeTH: 'วิทยาศาสตรบัณฑิต',
    degreeEN: 'Bachelor of Science',
    year: 2564,
    totalRequired: 127,
    badgeLabel: 'STAT 2564',
  },
  orderedCategoryIds: STAT_ORDERED_CATEGORIES,
  requirements: STAT_REQUIREMENTS,
  mandatoryCourses: [...STAT_CORE_COURSES.filter((c) => c.isMandatory), ...STAT_MANDATORY_COURSES],
  alternativePaths: STAT_ALTERNATIVE_PATHS,
  codeAliases: {},
  classifyCourse: classifyStatCourse,
};
