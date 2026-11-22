import type {
  CurriculumDefinition,
  CurriculumCourse,
  AlternativePath,
  AlternativePathOption,
  CategoryRequirement,
  CategoryId,
} from '../types';

export const CS_REQUIREMENTS: Record<string, CategoryRequirement> = {
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
  ge_elective: {
    groupTH: 'หมวดวิชาศึกษาทั่วไป',
    nameTH: 'หมวดวิชาศึกษาทั่วไป - กลุ่มวิชาเลือก',
    shortNameTH: 'กลุ่มวิชาเลือกทั่วไป',
    nameEN: 'GE Electives',
    requiredCredits: 15,
  },
  math_mandatory: {
    groupTH: 'หมวดวิชาเฉพาะ',
    nameTH: 'หมวดวิชาเฉพาะ - วิชาบังคับทางคณิตศาสตร์และสถิติ',
    shortNameTH: 'วิชาบังคับคณิตศาสตร์และสถิติ',
    nameEN: 'Math & Statistics Mandatory',
    requiredCredits: 18,
  },
  cs_mandatory: {
    groupTH: 'หมวดวิชาเฉพาะ',
    nameTH: 'หมวดวิชาเฉพาะ - วิชาบังคับทางวิทยาการคอมพิวเตอร์',
    shortNameTH: 'วิชาบังคับวิทยาการคอมพิวเตอร์',
    nameEN: 'Computer Science Mandatory',
    requiredCredits: 57,
  },
  cs_elective: {
    groupTH: 'หมวดวิชาเฉพาะ',
    nameTH: 'หมวดวิชาเฉพาะ - วิชาเลือก',
    shortNameTH: 'วิชาเลือกวิทยาการคอมพิวเตอร์',
    nameEN: 'CS Electives',
    requiredCredits: 18,
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

export const CS_ORDERED_CATEGORIES: CategoryId[] = [
  'ge_foundation',
  'ge_lang',
  'ge_elective',
  'math_mandatory',
  'cs_mandatory',
  'cs_elective',
  'alternative_study',
  'free_elective',
];

export const CS_MANDATORY_COURSES: CurriculumCourse[] = [
  // --- Math Mandatory (6 courses, 18 credits) ---
  {
    code: '05506232',
    titleTH: 'คณิตศาสตร์สำหรับวิทยาการคอมพิวเตอร์',
    titleEN: 'MATHEMATICS FOR COMPUTER SCIENCE',
    credits: 3,
    category: 'math_mandatory',
    yearSem: 'ชั้นปี 1 ภาคเรียนที่ 1',
    isMandatory: true,
  },
  {
    code: '05506231',
    titleTH: 'สถิติและความน่าจะเป็น',
    titleEN: 'STATISTICS AND PROBABILITY',
    credits: 3,
    category: 'math_mandatory',
    yearSem: 'ชั้นปี 1 ภาคเรียนที่ 1',
    isMandatory: true,
  },
  {
    code: '05506233',
    titleTH: 'แคลคูลัสสำหรับวิทยาการคอมพิวเตอร์',
    titleEN: 'CALCULUS FOR COMPUTER SCIENCE',
    credits: 3,
    category: 'math_mandatory',
    yearSem: 'ชั้นปี 1 ภาคเรียนที่ 2',
    isMandatory: true,
  },
  {
    code: '05506001',
    titleTH: 'คณิตศาสตร์ดิสครีต',
    titleEN: 'DISCRETE MATHEMATICS',
    credits: 3,
    category: 'math_mandatory',
    yearSem: 'ชั้นปี 1 ภาคเรียนที่ 2',
    isMandatory: true,
  },
  {
    code: '05506250',
    titleTH: 'พีชคณิตเชิงเส้นสำหรับวิทยาการคอมพิวเตอร์',
    titleEN: 'LINEAR ALGEBRA FOR COMPUTER SCIENCE',
    credits: 3,
    category: 'math_mandatory',
    yearSem: 'ชั้นปี 2 ภาคเรียนที่ 1',
    isMandatory: true,
  },
  {
    code: '05506002',
    titleTH: 'ระเบียบวิธีเชิงตัวเลข',
    titleEN: 'METHODS OF NUMERICAL COMPUTATION',
    credits: 3,
    category: 'math_mandatory',
    yearSem: 'ชั้นปี 2 ภาคเรียนที่ 2',
    isMandatory: true,
  },
  // --- CS Mandatory (21 courses, 57 credits) ---
  {
    code: '05506003',
    titleTH: 'การโปรแกรมคอมพิวเตอร์พื้นฐาน',
    titleEN: 'FUNDAMENTAL COMPUTER PROGRAMMING',
    credits: 3,
    category: 'cs_mandatory',
    yearSem: 'ชั้นปี 1 ภาคเรียนที่ 1',
    isMandatory: true,
  },
  {
    code: '05506005',
    titleTH: 'วิทยาการคอมพิวเตอร์',
    titleEN: 'COMPUTER SCIENCE',
    credits: 3,
    category: 'cs_mandatory',
    yearSem: 'ชั้นปี 1 ภาคเรียนที่ 1',
    isMandatory: true,
  },
  {
    code: '05506004',
    titleTH: 'การโปรแกรมเชิงวัตถุ',
    titleEN: 'OBJECT-ORIENTED PROGRAMMING',
    credits: 3,
    category: 'cs_mandatory',
    yearSem: 'ชั้นปี 1 ภาคเรียนที่ 2',
    isMandatory: true,
  },
  {
    code: '05506008',
    titleTH: 'โครงสร้างและการจัดระบบคอมพิวเตอร์',
    titleEN: 'COMPUTER ORGANIZATION AND ARCHITECTURE',
    credits: 3,
    category: 'cs_mandatory',
    yearSem: 'ชั้นปี 1 ภาคเรียนที่ 2',
    isMandatory: true,
  },
  {
    code: '05506015',
    titleTH: 'จรรยาบรรณทางวิชาชีพและเชิงสังคม',
    titleEN: 'COMPUTER ETHICS: SOCIAL AND PROFESSIONAL ISSUES',
    credits: 3,
    category: 'cs_mandatory',
    yearSem: 'ชั้นปี 1 ภาคเรียนที่ 2',
    isMandatory: true,
  },
  {
    code: '05506006',
    titleTH: 'โครงสร้างข้อมูลและขั้นตอนวิธี',
    titleEN: 'DATA STRUCTURES AND ALGORITHMS',
    credits: 3,
    category: 'cs_mandatory',
    yearSem: 'ชั้นปี 2 ภาคเรียนที่ 1',
    isMandatory: true,
  },
  {
    code: '05506007',
    titleTH: 'ระบบปฏิบัติการ',
    titleEN: 'OPERATING SYSTEMS',
    credits: 3,
    category: 'cs_mandatory',
    yearSem: 'ชั้นปี 2 ภาคเรียนที่ 1',
    isMandatory: true,
  },
  {
    code: '05506012',
    titleTH: 'ระบบฐานข้อมูล',
    titleEN: 'DATABASE SYSTEMS',
    credits: 3,
    category: 'cs_mandatory',
    yearSem: 'ชั้นปี 2 ภาคเรียนที่ 1',
    isMandatory: true,
  },
  {
    code: '05506234',
    titleTH: 'การวิเคราะห์และจัดการกระบวนการทางธุรกิจ',
    titleEN: 'BUSINESS ANALYSIS AND PROCESS MANAGEMENT',
    credits: 3,
    category: 'cs_mandatory',
    yearSem: 'ชั้นปี 2 ภาคเรียนที่ 1',
    isMandatory: true,
  },
  {
    code: '05506017',
    titleTH: 'วิศวกรรมซอฟต์แวร์',
    titleEN: 'SOFTWARE ENGINEERING',
    credits: 3,
    category: 'cs_mandatory',
    yearSem: 'ชั้นปี 2 ภาคเรียนที่ 1',
    isMandatory: true,
  },
  {
    code: '05506238',
    titleTH: 'สัมมนาด้านเทคโนโลยีแพลตฟอร์มสมัยใหม่',
    titleEN: 'SEMINAR IN MODERN PLATFORM TECHNOLOGIES',
    credits: 1,
    category: 'cs_mandatory',
    yearSem: 'ชั้นปี 2 ภาคเรียนที่ 1',
    isMandatory: true,
  },
  {
    code: '05506236',
    titleTH: 'การวิเคราะห์และการออกแบบขั้นตอนวิธี',
    titleEN: 'ANALYSIS AND DESIGN OF ALGORITHMS',
    credits: 3,
    category: 'cs_mandatory',
    yearSem: 'ชั้นปี 2 ภาคเรียนที่ 2',
    isMandatory: true,
  },
  {
    code: '05506113',
    titleTH: 'การวิเคราะห์และออกแบบซอฟต์แวร์',
    titleEN: 'SOFTWARE ANALYSIS AND DESIGN',
    credits: 3,
    category: 'cs_mandatory',
    yearSem: 'ชั้นปี 2 ภาคเรียนที่ 2',
    isMandatory: true,
  },
  {
    code: '05506016',
    titleTH: 'การสื่อสารข้อมูล และระบบเครือข่าย',
    titleEN: 'DATA COMMUNICATION AND NETWORK SYSTEMS',
    credits: 3,
    category: 'cs_mandatory',
    yearSem: 'ชั้นปี 2 ภาคเรียนที่ 2',
    isMandatory: true,
  },
  {
    code: '05506011',
    titleTH: 'ปฏิสัมพันธ์ระหว่างมนุษย์และคอมพิวเตอร์',
    titleEN: 'HUMAN-COMPUTER INTERACTION',
    credits: 3,
    category: 'cs_mandatory',
    yearSem: 'ชั้นปี 2 ภาคเรียนที่ 2',
    isMandatory: true,
  },
  {
    code: '05506210',
    titleTH: 'ปัญญาประดิษฐ์',
    titleEN: 'ARTIFICIAL INTELLIGENCE',
    credits: 3,
    category: 'cs_mandatory',
    yearSem: 'ชั้นปี 3 ภาคเรียนที่ 1',
    isMandatory: true,
  },
  {
    code: '05506014',
    titleTH: 'คอมพิวเตอร์กราฟิกส์',
    titleEN: 'COMPUTER GRAPHICS',
    credits: 3,
    category: 'cs_mandatory',
    yearSem: 'ชั้นปี 3 ภาคเรียนที่ 1',
    isMandatory: true,
  },
  {
    code: '05506237',
    titleTH: 'แนวคิดและตัวแบบของภาษาโปรแกรม',
    titleEN: 'CONCEPTS AND MODELS OF PROGRAMMING LANGUAGES',
    credits: 3,
    category: 'cs_mandatory',
    yearSem: 'ชั้นปี 3 ภาคเรียนที่ 1',
    isMandatory: true,
  },
  {
    code: '05506235',
    titleTH: 'การจัดการนวัตกรรมดิจิทัลและเทคโนโลยีในยุคการเปลี่ยนแปลงอย่างรวดเร็ว',
    titleEN: 'DIGITAL INNOVATION AND TECHNOLOGY MANAGEMENT IN DISRUPTIVE ERA',
    credits: 3,
    category: 'cs_mandatory',
    yearSem: 'ชั้นปี 3 ภาคเรียนที่ 2',
    isMandatory: true,
  },
  {
    code: '05506239',
    titleTH: 'โครงงานเชิงปฏิบัติ',
    titleEN: 'PRACTICAL PROJECT',
    credits: 1,
    category: 'cs_mandatory',
    yearSem: 'ชั้นปี 3 ภาคเรียนที่ 1',
    isMandatory: true,
  },
  {
    code: '05506013',
    titleTH: 'สัมมนา',
    titleEN: 'SEMINAR',
    credits: 1,
    category: 'cs_mandatory',
    yearSem: 'ชั้นปี 3 ภาคเรียนที่ 2',
    isMandatory: true,
  },
];

export const CS_ALTERNATIVE_PATHS: Record<AlternativePath, AlternativePathOption | undefined> = {
  special_problem: {
    nameTH: 'ปัญหาพิเศษ 1 & 2 (Special Problem)',
    nameEN: 'Special Problem',
    credits: 6,
    courses: [
      {
        code: '05506098',
        titleTH: 'ปัญหาพิเศษ 1',
        titleEN: 'SPECIAL PROBLEM 1',
        credits: 3,
        category: 'alternative_study',
        yearSem: 'ชั้นปี 4 ภาคเรียนที่ 1',
        isMandatory: false,
      },
      {
        code: '05506099',
        titleTH: 'ปัญหาพิเศษ 2',
        titleEN: 'SPECIAL PROBLEM 2',
        credits: 3,
        category: 'alternative_study',
        yearSem: 'ชั้นปี 4 ภาคเรียนที่ 2',
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
        code: '05506117',
        titleTH: 'สหกิจศึกษา',
        titleEN: 'COOPERATIVE EDUCATION',
        credits: 6,
        category: 'alternative_study',
        yearSem: 'ชั้นปี 4 ภาคเรียนที่ 1',
        isMandatory: false,
      },
    ],
  },
  overseas_training: undefined,
};

export const CS_CODE_ALIASES: Record<string, string> = {
  '90641007': '90641002', // DIGITAL CITIZEN -> ความฉลาดทางดิจิทัล
  '05506009': '05506236', // Algorithm Analysis (legacy) -> 05506236
  '05506018': '05506013', // Seminar (Job.pdf 05506018 alias to 05506013)
};

const CS_MATH_MANDATORY_CODES = new Set(
  CS_MANDATORY_COURSES.filter((c) => c.category === 'math_mandatory').map((c) => c.code)
);
const CS_MANDATORY_CODES = new Set(
  CS_MANDATORY_COURSES.filter((c) => c.category === 'cs_mandatory').map((c) => c.code)
);
const GE_FOUNDATION_CODES = new Set(['90642999', '90641002', '90641001', '90641003']);

export function classifyCsCourse(code: string): CategoryId {
  const canonical = CS_CODE_ALIASES[code] || code;

  if (CS_MATH_MANDATORY_CODES.has(canonical)) {
    return 'math_mandatory';
  }
  if (CS_MANDATORY_CODES.has(canonical)) {
    return 'cs_mandatory';
  }
  if (GE_FOUNDATION_CODES.has(canonical)) {
    return 'ge_foundation';
  }
  if (/^90644\d{3}$/.test(canonical)) {
    return 'ge_lang';
  }
  if (/^9064\d{4}$/.test(canonical)) {
    return 'ge_elective';
  }
  if (/^05506\d{3}$/.test(canonical)) {
    return 'cs_elective';
  }
  return 'free_elective';
}

export const CS_2564_CURRICULUM: CurriculumDefinition = {
  metadata: {
    id: 'cs_2564',
    nameTH: 'วท.บ. วิทยาการคอมพิวเตอร์ (หลักสูตร 2564)',
    nameEN: 'B.Sc. in Computer Science (2564)',
    facultyTH: 'คณะวิทยาศาสตร์ สจล.',
    degreeTH: 'วิทยาศาสตรบัณฑิต',
    degreeEN: 'Bachelor of Science',
    year: 2564,
    totalRequired: 135,
    badgeLabel: 'CS 2564',
  },
  orderedCategoryIds: CS_ORDERED_CATEGORIES,
  requirements: CS_REQUIREMENTS,
  mandatoryCourses: CS_MANDATORY_COURSES,
  alternativePaths: CS_ALTERNATIVE_PATHS,
  codeAliases: CS_CODE_ALIASES,
  classifyCourse: classifyCsCourse,
};
