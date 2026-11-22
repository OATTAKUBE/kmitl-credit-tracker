# Credit Tracker (React + TypeScript - MVC Architecture) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-based static web app in React 19 + TypeScript + Vite following the **Model-View-Controller (MVC)** architectural pattern to parse a KMITL CS student's unofficial transcript PDF, audit completed and in-progress courses against the CS B.Sc. 2564 curriculum (135 credits), and display category progress, missing requirements, and graduation forecasts.

**Architecture:** Strict Model-View-Controller (MVC) separation on client-side React 19 + TypeScript 5:
- **Model (`src/models/`):** Pure TypeScript domain logic, curriculum specifications, transcript parsing regexes, credit calculation engine, and storage adapters. Free from React dependencies; 100% unit-tested with Vitest.
- **View (`src/views/`):** Pure presentational React components using Tailwind CSS v4 and Lucide icons. Views receive data and event handlers via props only, without performing direct business calculations or side effects.
- **Controller (`src/controllers/`):** React controller hooks (e.g. `useCreditTrackerController`) and orchestrators that manage application state, coordinate Model calls (parsing, auditing, persistence), and supply data and callback handlers to Views.

**Tech Stack:** React 19, TypeScript 5, Vite, Tailwind CSS v4, Lucide React, pdfjs-dist, Vitest.

**Spec:** `c:\Users\oatxx\kmitl\Tracnscript\projects\credit-tracker\docs\superpowers\specs\2026-11-21-credit-tracker-design.md`

## MVC Directory Structure

```
projects/credit-tracker/src/
├── models/                         # [M] Pure domain logic, types & data
│   ├── types.ts                    # Domain interfaces & types
│   ├── curriculum.ts               # CS KMITL 2564 curriculum catalog, categories & rules
│   ├── parser.ts                   # KMITL transcript text parser & title normalizer
│   ├── calculator.ts               # Credit audit & graduation eligibility engine
│   └── storage.ts                  # LocalStorage data persistence adapter
│
├── views/                          # [V] Pure presentation components (Props-driven)
│   ├── UploadView.tsx              # Drag & drop upload area + demo button
│   ├── StudentSummaryView.tsx      # Student details, GPA badge & progress ring
│   ├── PathSelectorView.tsx        # Toggle between Special Problem & Cooperative Ed
│   ├── CategoryCardView.tsx        # Single category progress card
│   ├── CategoryGridView.tsx        # Responsive grid of category cards
│   ├── MissingCoursesView.tsx      # List of missing mandatory courses
│   ├── InProgressView.tsx          # List of courses currently enrolled
│   └── GraduationBannerView.tsx    # Graduation eligibility status banner
│
├── controllers/                    # [C] Application controllers & hooks
│   ├── useCreditTrackerController.ts # Coordinates Model logic, state & view actions
│   └── pdfExtractor.ts             # pdfjs-dist wrapper to extract text from PDF
│
├── App.tsx                         # Root layout composing Views with Controller
├── main.tsx                        # Entry point
└── index.css                       # Tailwind CSS v4 styles & theme
```

## Global Constraints

- Standalone static web application — runs 100% client-side with no server or backend API dependencies.
- Strict MVC architectural boundary: Views MUST NOT contain audit calculation algorithms; Models MUST NOT import React or DOM.
- Modern React 19 + TypeScript 5 + Vite architecture with strict type safety (no `any` types for domain models).
- Tailwind CSS v4 with dark academic theme (`#0b0f19` background, `#6366f1` indigo accent, `#10b981` emerald success, `#f59e0b` amber warning).
- Strictly offline-capable once loaded; no student data or transcript text leaves the user's browser.
- Use Lucide React icons for all UI iconography; no raw emoji in the UI.
- All curriculum course codes, categories, and credit rules must conform strictly to KMITL CS 2564 curriculum (`Job.pdf`).
- Graceful handling of courses with blank or missing grades (flagged as "กำลังศึกษา / In-Progress").

## Review Focus

- Transcript contains multi-line course titles (e.g. `DIGITAL INNOVATION AND TECHNOLOGY\nMANAGEMENT IN DISRUPTIVE ERA`) — ensure Model parser concatenates lines properly before matching credit and grade columns.
- Courses with no grade yet (current semester) must not be counted towards earned graduation credits in Model calculator, but must be passed to `InProgressView`.
- Course code aliases (e.g. `90641007` DIGITAL CITIZEN vs `90641002` ความฉลาดทางดิจิทัล) must resolve to the same curriculum item in Model calculator.
- Alternative study path: switching between Special Problem (3+3 = 6 cr) and Cooperative Education (6 cr) via `PathSelectorView` must trigger Controller to recalculate Model audit results dynamically.
- Corrupted or non-transcript PDF uploads must display clear, non-cryptic error feedback in Thai in `UploadView` without crashing the app.

---

### Task 1: [Model] Project Scaffolding, TypeScript Domain Types & Curriculum Model

**Files:**
- Create: `projects/credit-tracker/package.json`
- Create: `projects/credit-tracker/vite.config.ts`
- Create: `projects/credit-tracker/tsconfig.json`
- Create: `projects/credit-tracker/src/models/types.ts`
- Create: `projects/credit-tracker/src/models/curriculum.ts`
- Test: `projects/credit-tracker/src/models/curriculum.test.ts`

**Interfaces:**
- Produces `projects/credit-tracker/src/models/types.ts`:
  - `CourseEntry`: `{ code: string; title: string; credits: number; grade: string; semester: string; isCompleted: boolean; }`
  - `CurriculumCourse`: `{ code: string; titleTH: string; titleEN: string; credits: number; category: CategoryId; yearSem?: string; isMandatory: boolean; }`
  - `CategoryId`: `'ge_foundation' | 'ge_lang' | 'ge_elective' | 'math_mandatory' | 'cs_mandatory' | 'cs_elective' | 'alternative_study' | 'free_elective'`
  - `AlternativePath`: `'special_problem' | 'coop'`
  - `CategoryProgress`: `{ id: CategoryId; nameTH: string; requiredCredits: number; earnedCredits: number; inProgressCredits: number; courses: CourseEntry[]; isMet: boolean; }`
  - `StudentInfo`: `{ name: string; studentId: string; degree: string; program: string; }`
  - `AuditResult`: `{ studentInfo: StudentInfo; totalEarned: number; totalRequired: number; cumulativeGPA: number; isEligibleToGraduate: boolean; categories: Record<CategoryId, CategoryProgress>; missingMandatory: CurriculumCourse[]; inProgressCourses: CourseEntry[]; currentPath: AlternativePath; }`
- Produces `projects/credit-tracker/src/models/curriculum.ts`:
  - `CURRICULUM_REQUIREMENTS: Record<CategoryId, { nameTH: string; requiredCredits: number }>` (Total = 135)
  - `MANDATORY_COURSES: CurriculumCourse[]` (Math 18 credits, CS 57 credits)
  - `ALTERNATIVE_PATHS: Record<AlternativePath, { nameTH: string; credits: number; courses: CurriculumCourse[] }>`
  - `CODE_ALIASES: Record<string, string>`

- [ ] **Step 1: Initialize Vite React-TS project and Vitest configuration**

Create `package.json` in `projects/credit-tracker/` with React 19, TypeScript, Tailwind CSS v4, Lucide React, pdfjs-dist, and Vitest.
Run `npm install` inside `projects/credit-tracker/`.

- [ ] **Step 2: Write failing test for curriculum data catalog integrity**

Create `projects/credit-tracker/src/models/curriculum.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { CURRICULUM_REQUIREMENTS, MANDATORY_COURSES, ALTERNATIVE_PATHS, CODE_ALIASES } from './curriculum';

describe('Curriculum Model Integrity', () => {
  it('should have total required credits equal to 135', () => {
    const total = Object.values(CURRICULUM_REQUIREMENTS).reduce((sum, c) => sum + c.requiredCredits, 0);
    expect(total).toBe(135);
  });

  it('should have 18 credits for math mandatory and 57 credits for cs mandatory', () => {
    const math = MANDATORY_COURSES.filter(c => c.category === 'math_mandatory');
    const cs = MANDATORY_COURSES.filter(c => c.category === 'cs_mandatory');
    expect(math.reduce((s, c) => s + c.credits, 0)).toBe(18);
    expect(cs.reduce((s, c) => s + c.credits, 0)).toBe(57);
  });

  it('should define alternative paths correctly', () => {
    expect(ALTERNATIVE_PATHS.special_problem.credits).toBe(6);
    expect(ALTERNATIVE_PATHS.coop.credits).toBe(6);
    expect(ALTERNATIVE_PATHS.special_problem.courses.length).toBe(2);
    expect(ALTERNATIVE_PATHS.coop.courses.length).toBe(1);
  });

  it('should map alias 90641007 to canonical 90641002', () => {
    expect(CODE_ALIASES['90641007']).toBe('90641002');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd projects/credit-tracker && npx vitest run src/models/curriculum.test.ts`
Expected: FAIL with missing module error.

- [ ] **Step 4: Implement `src/models/types.ts` and `src/models/curriculum.ts`**

Define all types and curriculum constants strictly matching CS KMITL 2564:
- Math mandatory (6 courses): 05506232, 05506231, 05506233, 05506001, 05506250, 05506002.
- CS mandatory (21 courses): 05506003, 05506004, 05506005, 05506006, 05506007, 05506008, 05506011, 05506012, 05506013, 05506014, 05506015, 05506016, 05506017, 05506113, 05506210, 05506234, 05506235, 05506236, 05506237, 05506238, 05506239.
- GE categories and Alternative paths.

- [ ] **Step 5: Run test to verify it passes**

Run: `cd projects/credit-tracker && npx vitest run src/models/curriculum.test.ts`
Expected: PASS (4 tests passing).

- [ ] **Step 6: Commit**

```bash
git add projects/credit-tracker/package.json projects/credit-tracker/vite.config.ts projects/credit-tracker/tsconfig.json projects/credit-tracker/src/models/types.ts projects/credit-tracker/src/models/curriculum.ts projects/credit-tracker/src/models/curriculum.test.ts
git commit -m "feat(model): scaffold Vite React-TS project, domain types, and curriculum model"
```

---

### Task 2: [Model] KMITL Transcript Text Parser Model

**Files:**
- Create: `projects/credit-tracker/src/models/parser.ts`
- Test: `projects/credit-tracker/src/models/parser.test.ts`

**Interfaces:**
- Consumes: Raw text string extracted from transcript PDF.
- Produces `parseTranscriptText(rawText: string): ParsedTranscript`:
  - `studentInfo: StudentInfo` (`name`, `studentId`, `degree`, `program`)
  - `allCourses: CourseEntry[]`
  - `summary: { totalCreditsEarned: number; cumulativeGPA: number; }`

- [ ] **Step 1: Write failing test with realistic sample transcript text**

Create `projects/credit-tracker/src/models/parser.test.ts`:
```typescript
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

describe('Transcript Parser Model', () => {
  it('should parse student metadata correctly', () => {
    const result = parseTranscriptText(SAMPLE_TRANSCRIPT);
    expect(result.studentInfo.studentId).toBe('65050000');
    expect(result.studentInfo.name).toBe('Mr. Sample Student');
    expect(result.studentInfo.program).toBe('Computer Science');
    expect(result.summary.totalCreditsEarned).toBe(85);
    expect(result.summary.cumulativeGPA).toBe(3.03);
  });

  it('should concatenate multi-line course titles correctly', () => {
    const result = parseTranscriptText(SAMPLE_TRANSCRIPT);
    const multiLine = result.allCourses.find(c => c.code === '05506235');
    expect(multiLine).toBeDefined();
    expect(multiLine?.title).toContain('MANAGEMENT IN DISRUPTIVE ERA');
    expect(multiLine?.credits).toBe(3);
    expect(multiLine?.grade).toBe('');
    expect(multiLine?.isCompleted).toBe(false);
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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd projects/credit-tracker && npx vitest run src/models/parser.test.ts`
Expected: FAIL with `Cannot find module './parser'`.

- [ ] **Step 3: Implement `src/models/parser.ts`**

Implement pure `parseTranscriptText(rawText: string)`:
1. Parse header fields (`Name`, `Student ID`, `Program`).
2. Match semester headers (`\d+(?:st|nd|rd|th)\s+Semester[^\n]*`).
3. Pre-process text lines to combine wrapped title lines.
4. Parse course rows with regex: `^(\d{8})\s+(.+?)\s+(\d+)(?:\s+([A-Z][+-]?|S|F))?\s*$`
   - If grade is present and in `['A','B+','B','C+','C','D+','D','S']`: `isCompleted = true`, `grade = match[4]`.
   - If grade is absent: `isCompleted = false`, `grade = ''`.
5. Parse footer: `Total number of credit earned:\s*(\d+)` and `Cumulative GPA:\s*([\d.]+)`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd projects/credit-tracker && npx vitest run src/models/parser.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add projects/credit-tracker/src/models/parser.ts projects/credit-tracker/src/models/parser.test.ts
git commit -m "feat(model): implement transcript text parser with multi-line title and in-progress course handling"
```

---

### Task 3: [Model] Credit Matching, Category Audit & Graduation Engine Model

**Files:**
- Create: `projects/credit-tracker/src/models/calculator.ts`
- Test: `projects/credit-tracker/src/models/calculator.test.ts`

**Interfaces:**
- Consumes:
  - `studentInfo: StudentInfo`
  - `courses: CourseEntry[]` from parser
  - `selectedPath: AlternativePath` ('special_problem' | 'coop')
  - `CURRICULUM_REQUIREMENTS`, `MANDATORY_COURSES`, `ALTERNATIVE_PATHS`, `CODE_ALIASES`
- Produces: `auditGraduation(studentInfo: StudentInfo, courses: CourseEntry[], selectedPath: AlternativePath): AuditResult`

- [ ] **Step 1: Write failing test using parsed course data**

Create `projects/credit-tracker/src/models/calculator.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { auditGraduation } from './calculator';
import { CourseEntry, StudentInfo } from './types';

const mockStudent: StudentInfo = {
  name: 'Mr. Sample Student',
  studentId: '65050000',
  degree: 'B.Sc.',
  program: 'Computer Science'
};

const mockCourses: CourseEntry[] = [
  // Math mandatory (9 cr completed)
  { code: '05506231', title: 'DISCRETE MATHEMATICS', credits: 3, grade: 'C', semester: '1/2024', isCompleted: true },
  { code: '05506232', title: 'CALCULUS 1', credits: 3, grade: 'B+', semester: '1/2024', isCompleted: true },
  { code: '05506001', title: 'LINEAR ALGEBRA', credits: 3, grade: 'C', semester: '2/2024', isCompleted: true },
  // CS mandatory (6 cr completed, 3 cr in-progress)
  { code: '05506003', title: 'PROGRAMMING FUNDAMENTALS', credits: 3, grade: 'C+', semester: '1/2024', isCompleted: true },
  { code: '05506005', title: 'COMPUTER SCIENCE', credits: 3, grade: 'B', semester: '1/2024', isCompleted: true },
  { code: '05506014', title: 'COMPUTER GRAPHICS', credits: 3, grade: '', semester: '1/2026', isCompleted: false },
  // GE with alias
  { code: '90641007', title: 'DIGITAL CITIZEN', credits: 3, grade: 'S', semester: '2/2024', isCompleted: true }
];

describe('Credit Audit Calculator Model', () => {
  it('should categorize math and cs mandatory courses correctly', () => {
    const audit = auditGraduation(mockStudent, mockCourses, 'special_problem');
    expect(audit.categories.math_mandatory.earnedCredits).toBe(9);
    expect(audit.categories.cs_mandatory.earnedCredits).toBe(6);
    expect(audit.categories.cs_mandatory.inProgressCredits).toBe(3);
  });

  it('should resolve course aliases (90641007 -> 90641002 in GE Foundation)', () => {
    const audit = auditGraduation(mockStudent, mockCourses, 'special_problem');
    expect(audit.categories.ge_foundation.earnedCredits).toBe(3);
  });

  it('should list missing mandatory courses', () => {
    const audit = auditGraduation(mockStudent, mockCourses, 'special_problem');
    const missingCodes = audit.missingMandatory.map(c => c.code);
    expect(missingCodes).toContain('05506233'); // Calculus 2
    expect(missingCodes).toContain('05506239'); // Practical Project
    expect(missingCodes).not.toContain('05506003'); // Completed
  });

  it('should accurately calculate total graduation eligibility', () => {
    const audit = auditGraduation(mockStudent, mockCourses, 'special_problem');
    expect(audit.isEligibleToGraduate).toBe(false);
    expect(audit.totalEarned).toBe(18); // 9 + 6 + 3
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd projects/credit-tracker && npx vitest run src/models/calculator.test.ts`
Expected: FAIL with `Cannot find module './calculator'`.

- [ ] **Step 3: Implement `src/models/calculator.ts`**

Implement pure domain logic `auditGraduation`:
1. Normalize course codes using `CODE_ALIASES`.
2. Filter completed courses (`isCompleted === true`) and in-progress courses (`isCompleted === false`).
3. Categorize completed courses into 8 buckets:
   - GE Foundation (90642999 & 90641002/90641007, up to 6 cr)
   - GE Language (90644xxx, up to 9 cr)
   - GE Electives (90642xxx, up to 15 cr)
   - Math Mandatory (6 courses, 18 cr)
   - CS Mandatory (21 courses, 57 cr)
   - Alternative Study (Special Problem: 05506098+05506099 or Coop: 05506117, 6 cr)
   - CS Elective (05506xxx not in mandatory, up to 18 cr)
   - Free Elective (overflow and other courses, up to 6 cr)
4. Compute missing mandatory courses.
5. Determine graduation eligibility: `totalEarned >= 135 && missingMandatory.length === 0`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd projects/credit-tracker && npx vitest run src/models/calculator.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add projects/credit-tracker/src/models/calculator.ts projects/credit-tracker/src/models/calculator.test.ts
git commit -m "feat(model): implement credit audit engine with code aliases and graduation checks"
```

---

### Task 4: [View] Pure Presentational UI Components (Tailwind CSS v4 & Lucide Icons)

**Files:**
- Create: `projects/credit-tracker/src/views/UploadView.tsx`
- Create: `projects/credit-tracker/src/views/StudentSummaryView.tsx`
- Create: `projects/credit-tracker/src/views/PathSelectorView.tsx`
- Create: `projects/credit-tracker/src/views/CategoryCardView.tsx`
- Create: `projects/credit-tracker/src/views/CategoryGridView.tsx`
- Create: `projects/credit-tracker/src/views/MissingCoursesView.tsx`
- Create: `projects/credit-tracker/src/views/InProgressView.tsx`
- Create: `projects/credit-tracker/src/views/GraduationBannerView.tsx`
- Test: `projects/credit-tracker/src/views/CategoryCardView.test.tsx`

**Interfaces:**
- Views are stateless/props-driven components:
  - `CategoryCardViewProps`: `{ category: CategoryProgress }`
  - `StudentSummaryViewProps`: `{ studentInfo: StudentInfo; totalEarned: number; totalRequired: number; cumulativeGPA: number; }`
  - `PathSelectorViewProps`: `{ currentPath: AlternativePath; onSelectPath: (path: AlternativePath) => void; }`
  - `MissingCoursesViewProps`: `{ missing: CurriculumCourse[] }`
  - `InProgressViewProps`: `{ courses: CourseEntry[] }`
  - `UploadViewProps`: `{ onFileUpload: (file: File) => void; onDemoLoad: () => void; isProcessing: boolean; error: string | null; }`
  - `GraduationBannerViewProps`: `{ isEligible: boolean; totalEarned: number; totalRequired: number; missingCount: number; }`

- [ ] **Step 1: Write component test for `CategoryCardView`**

Create `projects/credit-tracker/src/views/CategoryCardView.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { CategoryCardView } from './CategoryCardView';
import { CategoryProgress } from '../models/types';

const mockCategory: CategoryProgress = {
  id: 'math_mandatory',
  nameTH: 'วิชาบังคับ คณิตศาสตร์/สถิติ',
  requiredCredits: 18,
  earnedCredits: 12,
  inProgressCredits: 3,
  courses: [],
  isMet: false
};

describe('CategoryCardView Component', () => {
  it('should render category name and credit counts', () => {
    render(<CategoryCardView category={mockCategory} />);
    expect(screen.getByText('วิชาบังคับ คณิตศาสตร์/สถิติ')).toBeDefined();
    expect(screen.getByText(/12 \/ 18/)).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd projects/credit-tracker && npx vitest run src/views/CategoryCardView.test.tsx`
Expected: FAIL with `Cannot find module './CategoryCardView'`.

- [ ] **Step 3: Implement presentational components in `src/views/`**

1. `UploadView.tsx`: Drag-and-drop zone with UploadCloud icon, demo button, processing spinner, and Thai error alert.
2. `StudentSummaryView.tsx`: Student metadata cards, GPA pill, and animated SVG circular credit progress ring.
3. `PathSelectorView.tsx`: Toggle buttons for Special Problem vs Cooperative Education with visual active state.
4. `CategoryCardView.tsx`: Progress bar with earned vs required credits, in-progress indicator, and completion badge.
5. `CategoryGridView.tsx`: Responsive grid rendering all 8 category cards.
6. `MissingCoursesView.tsx`: Accordion/table of missing mandatory courses.
7. `InProgressView.tsx`: List of currently enrolled courses with "กำลังศึกษา" badge.
8. `GraduationBannerView.tsx`: Prominent graduation forecast indicator banner.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd projects/credit-tracker && npx vitest run src/views/CategoryCardView.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add projects/credit-tracker/src/views/
git commit -m "feat(view): implement MVC presentational components with Tailwind CSS v4 and Lucide icons"
```

---

### Task 5: [Controller & Storage] App Controller, PDF Extractor & LocalStorage Adapter

**Files:**
- Create: `projects/credit-tracker/src/models/storage.ts`
- Create: `projects/credit-tracker/src/controllers/pdfExtractor.ts`
- Create: `projects/credit-tracker/src/controllers/useCreditTrackerController.ts`
- Modify: `projects/credit-tracker/src/App.tsx`
- Modify: `projects/credit-tracker/src/main.tsx`
- Modify: `projects/credit-tracker/src/index.css`
- Test: `projects/credit-tracker/src/models/storage.test.ts`

**Interfaces:**
- `storage.ts`:
  - `saveAuditState(data: { studentInfo: StudentInfo; courses: CourseEntry[]; path: AlternativePath }): void`
  - `loadAuditState(): { studentInfo: StudentInfo; courses: CourseEntry[]; path: AlternativePath } | null`
  - `clearAuditState(): void`
- `pdfExtractor.ts`:
  - `extractTextFromPdf(file: File): Promise<string>`
- `useCreditTrackerController`:
  - Returns: `{ auditResult, isProcessing, error, currentPath, handleFileUpload, handleDemoLoad, handlePathChange, handleReset }`

- [ ] **Step 1: Write test for storage adapter model**

Create `projects/credit-tracker/src/models/storage.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { saveAuditState, loadAuditState, clearAuditState } from './storage';

describe('Storage Adapter Model', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save and load audit state from localStorage', () => {
    const payload = {
      studentInfo: { name: 'Sample Student', studentId: '65050000', degree: 'B.Sc.', program: 'CS' },
      courses: [{ code: '05506003', title: 'PROG', credits: 3, grade: 'C+', semester: '1/2024', isCompleted: true }],
      path: 'special_problem' as const
    };
    saveAuditState(payload);
    const loaded = loadAuditState();
    expect(loaded).toEqual(payload);
  });

  it('should return null when storage is cleared', () => {
    clearAuditState();
    expect(loadAuditState()).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd projects/credit-tracker && npx vitest run src/models/storage.test.ts`
Expected: FAIL with `Cannot find module './storage'`.

- [ ] **Step 3: Implement `storage.ts`, `pdfExtractor.ts`, `useCreditTrackerController.ts`, and wire `App.tsx`**

1. `src/models/storage.ts`: Pure localStorage save/load/clear under key `kmitl_credit_tracker_v1`.
2. `src/controllers/pdfExtractor.ts`: Configures `pdfjs-dist` worker and iterates PDF pages to extract plain text lines.
3. `src/controllers/useCreditTrackerController.ts`: Custom React hook acting as the Controller:
   - On mount: loads cached state from `storage.ts` and calculates initial audit.
   - `handleFileUpload(file)`: calls `pdfExtractor.extractTextFromPdf` -> calls `parser.parseTranscriptText` -> calls `calculator.auditGraduation` -> updates state & persists to `storage`.
   - `handleDemoLoad()`: loads sample transcript data -> updates state & persists.
   - `handlePathChange(path)`: switches `selectedPath` -> recalculates audit with `calculator.auditGraduation`.
   - `handleReset()`: clears state and removes localStorage cache.
4. `src/App.tsx`: Acts as the root view composition, binding `useCreditTrackerController` outputs directly into `UploadView`, `StudentSummaryView`, `PathSelectorView`, `CategoryGridView`, `MissingCoursesView`, and `GraduationBannerView`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd projects/credit-tracker && npx vitest run src/models/storage.test.ts`
Expected: PASS.

- [ ] **Step 5: Run application build check**

Run: `cd projects/credit-tracker && npm run build`
Expected: Vite and TypeScript build passes cleanly.

- [ ] **Step 6: Commit**

```bash
git add projects/credit-tracker/src/models/storage.ts projects/credit-tracker/src/controllers/ projects/credit-tracker/src/App.tsx projects/credit-tracker/src/main.tsx projects/credit-tracker/src/index.css
git commit -m "feat(controller): implement MVC controller hooks, PDF extractor, storage adapter, and App wiring"
```

---

### Task 6: End-to-End Verification with Real Transcript & Final Polish

**Files:**
- Create: `projects/credit-tracker/src/test/e2e-transcript.test.ts`
- Documentation: `projects/credit-tracker/README.md`

- [ ] **Step 1: Write E2E integration test using actual student transcript data**

Create `projects/credit-tracker/src/test/e2e-transcript.test.ts`:
Verify that using the sample raw text / parsed courses of Sample Student (Student ID 65050000):
1. Exactly 85 credits are recognized as earned.
2. In-progress courses (e.g. 05506014, 05506235, 05506237, 05506258, 90644010) are identified with 0 earned credits and listed in In-Progress.
3. Path A (Special Problem) requires 05506098 + 05506099 (both missing).
4. Path B (Cooperative Education) requires 05506117 (missing).
5. Toggling path correctly updates the graduation forecast.
6. GPA equals 3.03.

- [ ] **Step 2: Run all test suites across the project**

Run: `cd projects/credit-tracker && npx vitest run`
Expected: All test suites PASS (Curriculum Model, Parser Model, Calculator Model, View Component, Storage Adapter, E2E).

- [ ] **Step 3: Verify production build and preview**

Run: `cd projects/credit-tracker && npm run build`
Expected: Vite build generates `dist/` directory cleanly without errors.

- [ ] **Step 4: Commit and finalize**

```bash
git add projects/credit-tracker/src/test/ projects/credit-tracker/README.md
git commit -m "test: add E2E verification with real transcript and complete MVC project documentation"
```
