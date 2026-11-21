# Credit Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-based static web app that parses a KMITL CS student's unofficial transcript PDF, matches completed and in-progress courses against the CS B.Sc. 2564 curriculum (135 credits), and displays visual category progress, missing requirements, and graduation forecasts.

**Architecture:** Vanilla HTML5, modern CSS3 (custom properties, dark academic theme), and ES6 modules. PDF parsing is handled client-side using PDF.js CDN extracting plain text lines matched by regex against known KMITL registrar patterns. Domain logic is decoupled into a static curriculum definitions module, a parser module, and a credit calculator/audit engine module, all fully testable under Node.js test scripts before binding to DOM and `localStorage`.

**Tech Stack:** HTML5, CSS3, ES6 JavaScript, Bootstrap Icons CDN, PDF.js CDN (v4.x), Node.js for CLI test verification.

**Spec:** `c:\Users\oatxx\kmitl\Tracnscript\projects\credit-tracker\docs\superpowers\specs\2026-11-21-credit-tracker-design.md`

## Global Constraints

- Standalone static web application — runs entirely client-side without any server or backend dependencies.
- No external heavy frameworks (no React, Vue, or Angular) — pure vanilla ES6 JavaScript and standard CSS.
- Strictly offline-capable once loaded; no student data or transcript text leaves the user's browser.
- Use Bootstrap Icons CDN for all icons; no raw emoji in the UI.
- All curriculum course codes, categories, and credit rules must conform strictly to KMITL CS 2564 curriculum (`Job.pdf`).
- Graceful handling of courses with blank or missing grades (flagged as "กำลังศึกษา / In-Progress").

## Review Focus

- Transcript contains multi-line course titles (e.g. `DIGITAL INNOVATION AND TECHNOLOGY\nMANAGEMENT IN DISRUPTIVE ERA`) — ensure titles are concatenated properly so credits and grades are not mismatched.
- Courses with no grade yet (e.g., in-progress semester) must not be counted towards earned graduation credits, but should be shown in an "กำลังศึกษา" section.
- Course code aliases (e.g. `90641007` DIGITAL CITIZEN vs `90641002` ความฉลาดทางดิจิทัล) must resolve to the same curriculum item.
- Alternative study path (การศึกษาทางเลือก): special problem 1 & 2 (3+3 = 6 credits) vs cooperative education (6 credits) must dynamically adapt target requirements based on user preference or auto-detection.
- Corrupted or non-transcript PDF uploads must display clear, non-cryptic error feedback in Thai.

---

### Task 1: Authoritative Curriculum Data Module

**Files:**
- Create: `projects/credit-tracker/assets/js/curriculum-data.js`
- Test: `projects/credit-tracker/tests/test-curriculum.js`

**Interfaces:**
- Produces:
  - `CURRICULUM_STRUCTURE`: Object defining total credits (135), categories, targets, and course lists.
  - `COURSE_CATALOG`: Map of course code -> `{ code, titleTH, titleEN, credits, category, yearSem, isMandatory }`.
  - `CODE_ALIASES`: Map of alternative course codes -> canonical code.
  - `ALTERNATIVE_PATHS`: Definitions of Path A (Special Problem 1 & 2) and Path B (Cooperative Education).

- [ ] **Step 1: Write the test verifying curriculum data integrity**

```javascript
// projects/credit-tracker/tests/test-curriculum.js
const assert = require('assert');
const { CURRICULUM_STRUCTURE, COURSE_CATALOG, CODE_ALIASES } = require('../assets/js/curriculum-data.js');

// Verify total credits
assert.strictEqual(CURRICULUM_STRUCTURE.totalCredits, 135, 'Total curriculum credits must be 135');

// Verify mandatory Math (18 credits)
const mathCourses = Object.values(COURSE_CATALOG).filter(c => c.category === 'math_mandatory');
const mathCredits = mathCourses.reduce((sum, c) => sum + c.credits, 0);
assert.strictEqual(mathCredits, 18, 'Math mandatory courses must total 18 credits');

// Verify mandatory CS (57 credits)
const csMandatory = Object.values(COURSE_CATALOG).filter(c => c.category === 'cs_mandatory');
const csCredits = csMandatory.reduce((sum, c) => sum + c.credits, 0);
assert.strictEqual(csCredits, 57, 'CS mandatory courses must total 57 credits');

// Verify code alias mapping exists
assert.strictEqual(CODE_ALIASES['90641007'], '90641002', 'Digital Citizen alias must map to canonical code');

console.log('✓ Curriculum data test passed!');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node projects/credit-tracker/tests/test-curriculum.js`
Expected: FAIL with `Cannot find module '../assets/js/curriculum-data.js'`

- [ ] **Step 3: Implement `projects/credit-tracker/assets/js/curriculum-data.js`**

Implement complete dictionary of all courses from `Job.pdf`, categorizing:
- `ge_foundation` (6 credits)
- `ge_language` (9 credits)
- `ge_elective` (15 credits)
- `math_mandatory` (18 credits)
- `cs_mandatory` (57 credits)
- `cs_elective` (18 credits)
- `alternative_study` (6 credits: Special Problem vs Coop)
- `free_elective` (6 credits)
Support both CommonJS (`module.exports`) and ES Module (`export`) compatibility.

- [ ] **Step 4: Run test to verify it passes**

Run: `node projects/credit-tracker/tests/test-curriculum.js`
Expected: Output `✓ Curriculum data test passed!`

- [ ] **Step 5: Commit**

```bash
git add projects/credit-tracker/assets/js/curriculum-data.js projects/credit-tracker/tests/test-curriculum.js
git commit -m "feat: add curriculum data definitions and validation test"
```

---

### Task 2: KMITL Transcript Text Parser

**Files:**
- Create: `projects/credit-tracker/assets/js/parser.js`
- Test: `projects/credit-tracker/tests/test-parser.js`

**Interfaces:**
- Consumes: Raw text extracted from KMITL transcript PDF.
- Produces: `parseTranscriptText(rawText: string) -> TranscriptResult`
  Where `TranscriptResult` contains:
  - `studentInfo: { name: string, studentId: string, degree: string, program: string }`
  - `semesters: Array<{ name: string, courses: Array<CourseEntry>, gps: number, gpa: number }>`
  - `allCourses: Array<CourseEntry>`
  - `summary: { totalCreditsEarned: number, cumulativeGPA: number }`
  `CourseEntry`: `{ code: string, title: string, credits: number, grade: string, isCompleted: boolean }`

- [ ] **Step 1: Write test for transcript parsing using extracted sample text**

```javascript
// projects/credit-tracker/tests/test-parser.js
const assert = require('assert');
const fs = require('fs');
const { parseTranscriptText } = require('../assets/js/parser.js');

// Load sample extracted text from actual transcript.pdf
const sampleRaw = `
Name Mr. Teerasak Khlaiphet Student ID 67050252
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
Total number of credit earned: 85
Cumulative GPA: 3.03
`;

const res = parseTranscriptText(sampleRaw);

assert.strictEqual(res.studentInfo.studentId, '67050252');
assert.strictEqual(res.studentInfo.name, 'Mr. Teerasak Khlaiphet');
assert.strictEqual(res.summary.totalCreditsEarned, 85);
assert.strictEqual(res.summary.cumulativeGPA, 3.03);

// Verify multi-line title concatenation
const mgmtCourse = res.allCourses.find(c => c.code === '05506235');
assert(mgmtCourse, 'Should parse multi-line course 05506235');
assert.strictEqual(mgmtCourse.grade, '', 'Should have blank grade for in-progress course');
assert.strictEqual(mgmtCourse.isCompleted, false, 'In-progress course is not completed');

// Verify completed course
const progCourse = res.allCourses.find(c => c.code === '05506003');
assert.strictEqual(progCourse.grade, 'C+');
assert.strictEqual(progCourse.isCompleted, true);

console.log('✓ Transcript parser test passed!');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node projects/credit-tracker/tests/test-parser.js`
Expected: FAIL with `Cannot find module '../assets/js/parser.js'`

- [ ] **Step 3: Implement `projects/credit-tracker/assets/js/parser.js`**

Implement regex parser that:
1. Extracts student metadata header.
2. Identifies semester headers (`1st Semester, Year, 2024-2025`).
3. Handles multi-line course titles before credit/grade column.
4. Distinguishes completed courses (grades A, B+, B, C+, C, D+, D, S) from in-progress courses (no grade or empty grade).
5. Extracts final total credits earned and cumulative GPA.

- [ ] **Step 4: Run test to verify it passes**

Run: `node projects/credit-tracker/tests/test-parser.js`
Expected: Output `✓ Transcript parser test passed!`

- [ ] **Step 5: Commit**

```bash
git add projects/credit-tracker/assets/js/parser.js projects/credit-tracker/tests/test-parser.js
git commit -m "feat: implement transcript text parser with multi-line title support"
```

---

### Task 3: Credit Matching, Category Audit & Graduation Engine

**Files:**
- Create: `projects/credit-tracker/assets/js/calculator.js`
- Test: `projects/credit-tracker/tests/test-calculator.js`

**Interfaces:**
- Consumes:
  - `parsedCourses: Array<CourseEntry>`
  - `curriculum: CURRICULUM_STRUCTURE`
  - `selectedPath: 'special_problem' | 'coop' | 'auto'`
- Produces: `auditGraduation(parsedCourses, selectedPath) -> AuditResult`
  Where `AuditResult` contains:
  - `totalEarnedCredits: number`
  - `totalTargetCredits: number` (135)
  - `overallPercentage: number`
  - `inProgressCredits: number`
  - `predictedTotalCredits: number`
  - `categories: Map<CategoryId, CategoryProgress>`
    `CategoryProgress`: `{ id, titleTH, earned, target, percentage, completedCourses, inProgressCourses, missingCourses }`
  - `graduationStatus: { isEligible: boolean, remainingCredits: number, remainingMandatoryCount: number, path: string }`

- [ ] **Step 1: Write unit test for graduation audit calculation**

```javascript
// projects/credit-tracker/tests/test-calculator.js
const assert = require('assert');
const { auditGraduation } = require('../assets/js/calculator.js');
const fs = require('fs');

// Use the parsed transcript data from the real user's transcript
const transcriptData = JSON.parse(fs.readFileSync('transcript_data.json', 'utf8'));

// Convert to CourseEntry format
const parsedCourses = transcriptData.map(c => ({
  code: c.code,
  title: c.title,
  credits: c.credits,
  grade: c.grade,
  isCompleted: ['A','B+','B','C+','C','D+','D','S'].includes(c.grade)
}));

const result = auditGraduation(parsedCourses, 'special_problem');

assert.strictEqual(result.categories.math_mandatory.earned, 18, 'Math should be 18/18');
assert.strictEqual(result.categories.math_mandatory.missingCourses.length, 0, 'Math should have 0 missing courses');
assert(result.totalEarnedCredits >= 80, 'Total credits earned should be calculated');
assert.strictEqual(result.graduationStatus.isEligible, false, 'Year 3 student should not yet be eligible to graduate');
assert(result.graduationStatus.remainingCredits > 0, 'Should have remaining credits');

console.log('✓ Calculator audit test passed!');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node projects/credit-tracker/tests/test-calculator.js`
Expected: FAIL with `Cannot find module '../assets/js/calculator.js'`

- [ ] **Step 3: Implement `projects/credit-tracker/assets/js/calculator.js`**

Implement course categorizer:
1. Lookup canonical code through `CODE_ALIASES`.
2. Categorize into:
   - `math_mandatory` (18 cr)
   - `cs_mandatory` (57 cr)
   - `ge_foundation` (6 cr)
   - `ge_language` (9 cr)
   - `ge_elective` (15 cr)
   - `cs_elective` (18 cr)
   - `alternative_study` (6 cr)
   - `free_elective` (6 cr)
3. Calculate missing mandatory courses per category.
4. Calculate in-progress units.
5. Provide graduation forecast (remaining credits, missing courses by semester).

- [ ] **Step 4: Run test to verify it passes**

Run: `node projects/credit-tracker/tests/test-calculator.js`
Expected: Output `✓ Calculator audit test passed!`

- [ ] **Step 5: Commit**

```bash
git add projects/credit-tracker/assets/js/calculator.js projects/credit-tracker/tests/test-calculator.js
git commit -m "feat: implement credit audit engine and graduation calculator"
```

---

### Task 4: UI Design, Layout & Responsive Styles

**Files:**
- Create: `projects/credit-tracker/index.html`
- Create: `projects/credit-tracker/assets/css/style.css`

**Interfaces:**
- HTML DOM elements:
  - `#drop-zone`: Drag-and-drop / file input area for PDF.
  - `#load-sample-btn`: Quick button to load user's existing parsed transcript.
  - `#student-info-card`: Displays student name, ID, GPA, and total credits.
  - `#progress-ring`: Circular SVG progress indicator.
  - `#category-grid`: Container for category progress cards.
  - `#path-toggle`: Radio/Toggle for Path A (ปัญหาพิเศษ) vs Path B (สหกิจ).
  - `#missing-courses-section`: Filterable checklist of missing mandatory & elective subjects.
  - `#in-progress-section`: Badge list of courses currently being studied.
  - `#graduation-banner`: Clear graduation readiness banner.

- [ ] **Step 1: Create `projects/credit-tracker/index.html`**

Write standard semantic HTML5 structure with Bootstrap Icons CDN, Google Fonts (Noto Sans Thai & JetBrains Mono), and container sections for upload, summary, circular progress, category breakdown, missing subjects, and graduation analysis.

- [ ] **Step 2: Create `projects/credit-tracker/assets/css/style.css`**

Implement responsive dark theme styling:
- Palette: Dark navy/slate background (`#0b0f19`, `#111827`), indigo primary (`#6366f1`), emerald success (`#10b981`), amber warning (`#f59e0b`), rose danger (`#ef4444`).
- Circular SVG progress ring styling.
- Responsive grid: 1 col on mobile, 2-3 cols on desktop.
- Drag-and-drop hover and active state effects.
- Clean typography and badge components.

- [ ] **Step 3: Verification**

Check HTML syntax and verify asset links.

- [ ] **Step 4: Commit**

```bash
git add projects/credit-tracker/index.html projects/credit-tracker/assets/css/style.css
git commit -m "feat: create responsive UI layout and modern dark theme stylesheets"
```

---

### Task 5: App Controller, PDF.js Integration & LocalStorage Persistence

**Files:**
- Create: `projects/credit-tracker/assets/js/app.js`
- Modify: `projects/credit-tracker/index.html` (integrate scripts)

**Interfaces:**
- Consumes:
  - `pdfjsLib` (from CDN)
  - `parseTranscriptText` (from `parser.js`)
  - `auditGraduation` (from `calculator.js`)
  - `CURRICULUM_STRUCTURE` (from `curriculum-data.js`)
- Produces: Interactive web application handling file drops, re-rendering UI on path changes, and caching results in `localStorage`.

- [ ] **Step 1: Implement PDF extraction and application lifecycle in `app.js`**

Implement:
1. `initApp()`: Check `localStorage` for cached transcript data; if found, render immediately; also provide button to load pre-bundled current student data (`transcript_data.json`).
2. PDF file handler: Read dropped/uploaded file using `pdfjsLib.getDocument`, extract text from all pages into one string, pass to `parseTranscriptText`.
3. Audit executor: Run `auditGraduation`, store result, and render:
   - Total credits counter animation.
   - SVG circular progress update.
   - Category progress cards with colored progress bars.
   - Missing courses accordion/table with semester badges.
   - In-progress course badges.
   - Graduation status banner.
4. Interactive Path Selector: Switch between "ปัญหาพิเศษ" (6 cr) and "สหกิจศึกษา" (6 cr) with instant recalculation.

- [ ] **Step 2: Test in browser using local server or file load**

Verify loading states, error handling on non-PDF files, drag & drop visual feedback, and responsive layout.

- [ ] **Step 3: Commit**

```bash
git add projects/credit-tracker/assets/js/app.js projects/credit-tracker/index.html
git commit -m "feat: wire PDF.js extractor, state controller and UI renderer"
```

---

### Task 6: End-to-End Verification, Documentation & Final Polish

**Files:**
- Create: `projects/credit-tracker/README.md`
- Test: Verify with `c:\Users\oatxx\kmitl\Tracnscript\transcript.pdf`

- [ ] **Step 1: Write project documentation `README.md`**

Provide clear explanation:
- What the app does.
- How to open (e.g. VS Code Live Server or python http.server).
- How to upload transcripts or use pre-loaded data.
- Breakdown of CS KMITL 2564 curriculum rules used.

- [ ] **Step 2: Run all automated tests**

Run: `node projects/credit-tracker/tests/test-curriculum.js && node projects/credit-tracker/tests/test-parser.js && node projects/credit-tracker/tests/test-calculator.js`
Expected: All tests pass.

- [ ] **Step 3: Launch local HTTP server and verify live preview**

Verify real transcript upload in browser, confirm 85 credits earned + in-progress courses, and check category math.

- [ ] **Step 4: Commit**

```bash
git add projects/credit-tracker/README.md
git commit -m "docs: add comprehensive README and finalize credit tracker webapp"
```
