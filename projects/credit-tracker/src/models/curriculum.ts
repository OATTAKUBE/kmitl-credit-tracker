import type {
  CategoryId,
  CurriculumCourse,
  AlternativePath,
  AlternativePathOption,
} from './types';

/**
 * Total 135 credits required for B.Sc. in Computer Science (Curriculum 2564), KMITL.
 */
export const CURRICULUM_REQUIREMENTS: Record<
  CategoryId,
  { nameTH: string; requiredCredits: number }
> = {
  ge_foundation: {
    nameTH: 'หมวดวิชาศึกษาทั่วไป - กลุ่มวิชาพื้นฐาน',
    requiredCredits: 6,
  },
  ge_lang: {
    nameTH: 'หมวดวิชาศึกษาทั่วไป - กลุ่มวิชาด้านภาษาและการสื่อสาร',
    requiredCredits: 9,
  },
  ge_elective: {
    nameTH: 'หมวดวิชาศึกษาทั่วไป - กลุ่มวิชาเลือก',
    requiredCredits: 15,
  },
  math_mandatory: {
    nameTH: 'หมวดวิชาเฉพาะ - วิชาบังคับทางคณิตศาสตร์และสถิติ',
    requiredCredits: 18,
  },
  cs_mandatory: {
    nameTH: 'หมวดวิชาเฉพาะ - วิชาบังคับทางวิทยาการคอมพิวเตอร์',
    requiredCredits: 57,
  },
  cs_elective: {
    nameTH: 'หมวดวิชาเฉพาะ - วิชาเลือก',
    requiredCredits: 18,
  },
  alternative_study: {
    nameTH: 'หมวดวิชาเฉพาะ - การศึกษาทางเลือก',
    requiredCredits: 6,
  },
  free_elective: {
    nameTH: 'หมวดวิชาเลือกเสรี',
    requiredCredits: 6,
  },
};

/**
 * Authoritative Mandatory Courses (27 courses total: 6 Math + 21 CS = 75 credits)
 */
export const MANDATORY_COURSES: CurriculumCourse[] = [
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
    titleTH: 'กรรมวิธีคำนวณเชิงตัวเลข',
    titleEN: 'METHODS OF NUMERICAL COMPUTATION',
    credits: 3,
    category: 'math_mandatory',
    yearSem: 'ชั้นปี 2 ภาคเรียนที่ 2',
    isMandatory: true,
  },

  // --- CS Mandatory (21 courses, 57 credits) ---
  {
    code: '05506003',
    titleTH: 'การเขียนโปรแกรมขั้นพื้นฐาน',
    titleEN: 'PROGRAMMING FUNDAMENTALS',
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
    titleTH: 'การเขียนโปรแกรมเชิงออบเจกต์',
    titleEN: 'OBJECT-ORIENTED PROGRAMMING',
    credits: 3,
    category: 'cs_mandatory',
    yearSem: 'ชั้นปี 1 ภาคเรียนที่ 2',
    isMandatory: true,
  },
  {
    code: '05506008',
    titleTH: 'โครงสร้างและสถาปัตยกรรมคอมพิวเตอร์',
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

/**
 * Alternative Study Paths (6 credits each)
 */
export const ALTERNATIVE_PATHS: Record<AlternativePath, AlternativePathOption> = {
  special_problem: {
    nameTH: 'โครงงานปัญหาพิเศษ',
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
    nameTH: 'สหกิจศึกษา',
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
};

/**
 * Legacy code to canonical 2564 curriculum code mapping
 */
export const CODE_ALIASES: Record<string, string> = {
  '90641007': '90641002', // DIGITAL CITIZEN -> ความฉลาดทางดิจิทัล
  '05506009': '05506236', // Algorithm Analysis (legacy) -> 05506236
  '05506018': '05506013', // Seminar (Job.pdf 05506018 alias to 05506013)
};
