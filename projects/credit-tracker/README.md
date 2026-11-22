# KMITL CS Credit Tracker (Curriculum 2564)

> A modern, browser-based static web application designed for students of King Mongkut's Institute of Technology Ladkrabang (KMITL) enrolled in the Bachelor of Science in Computer Science (Curriculum 2564 / หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ ฉบับปรับปรุง พ.ศ. 2564).

The application audits unofficial transcript PDFs, tracks earned and in-progress credits across 8 curriculum categories, identifies missing mandatory courses, and forecasts graduation eligibility based on the student's chosen study track (Special Problem vs. Cooperative Education).

---

## 🏛️ Architectural Overview: Model-View-Controller (MVC)

The codebase strictly adheres to the **Model-View-Controller (MVC)** architectural pattern to ensure clean separation of concerns, testability, and maintainability:

```
src/
├── models/                         # [M] Pure Domain Logic & Types (Zero React / DOM dependencies)
│   ├── types.ts                    # Core TypeScript domain types & interfaces
│   ├── curriculum.ts               # CS 2564 curriculum catalog, rules & credit requirements (135 credits)
│   ├── parser.ts                   # Unofficial transcript text parsing & multi-line title normalization
│   ├── calculator.ts               # Credit audit engine, alias mapping & graduation eligibility verification
│   ├── storage.ts                  # LocalStorage data persistence adapter
│   └── sampleTranscript.ts         # Embedded real student transcript data for testing and demo
│
├── views/                          # [V] Pure Presentational Components (Props-driven)
│   ├── UploadView.tsx              # Drag & drop PDF upload zone, demo loader & error banner
│   ├── StudentSummaryView.tsx      # Student profile, GPA badge & visual credit progress ring
│   ├── PathSelectorView.tsx        # Alternative study track toggle (Special Problem vs Coop)
│   ├── CategoryCardView.tsx        # Individual curriculum category card with course breakdown
│   ├── CategoryGridView.tsx        # Responsive grid of all 8 curriculum categories
│   ├── MissingCoursesView.tsx      # Actionable list of remaining mandatory courses
│   ├── InProgressView.tsx          # Current semester enrolled courses (credits pending)
│   └── GraduationBannerView.tsx    # Graduation eligibility status banner & forecast checklist
│
├── controllers/                    # [C] Application Orchestration & Controllers
│   ├── useCreditTrackerController.ts # Coordinates Model logic, application state & view handlers
│   └── pdfExtractor.ts             # pdfjs-dist wrapper extracting plain text from PDF client-side
│
├── test/                           # End-to-End & Integration Test Suites
│   ├── e2e-transcript.test.ts      # Full-pipeline verification against real KMITL transcript
│   └── setup.ts                    # Vitest environment & mock localStorage setup
│
├── App.tsx                         # Root layout composing Views with Controller
├── main.tsx                        # React application entry point
└── index.css                       # Tailwind CSS v4 design tokens & base styles
```

### 1. Model Layer (`src/models/`)
- **Independent & Headless**: Completely free of React, browser DOM, or external framework dependencies.
- **Curriculum Catalog (`curriculum.ts`)**: Defines all 135 credits required across 8 categories, 27 mandatory courses (18 cr Math + 57 cr CS), and code aliases.
- **Text Parser (`parser.ts`)**: Robust regex tokenizer parsing student metadata, multi-line course titles, credit weights, letter grades, and semesters.
- **Calculation Engine (`calculator.ts`)**: Audits student progress, resolves course aliases (e.g. `90641007` Digital Citizen $\rightarrow$ `90641002`), handles elective credit overflow into Free Electives, and verifies graduation criteria (135+ credits, GPA $\ge$ 2.00, all mandatory courses satisfied).
- **Storage Adapter (`storage.ts`)**: Manages safe JSON serialization to browser `localStorage`.

### 2. View Layer (`src/views/`)
- **Pure & Props-Driven**: Contains zero business calculations, state machines, or data manipulation logic.
- **Tailwind CSS v4 & Lucide Icons**: Designed with an academic dark theme (`#0b0f19` canvas, indigo accent, emerald success, amber warning).
- **Modular Components**: Each view corresponds to a discrete visual section of the dashboard, making UI adjustments isolated and safe.

### 3. Controller Layer (`src/controllers/`)
- **Controller Hook (`useCreditTrackerController.ts`)**: Acts as the single coordinator. On initialization, it restores cached data from `storage.ts`. It delegates PDF text extraction to `pdfExtractor.ts`, invokes `parser.ts` to tokenize transcripts, triggers `calculator.ts` to produce `AuditResult`, and exposes clean callbacks (`handleFileUpload`, `handleDemoLoad`, `handlePathChange`, `handleReset`) to the view hierarchy.

---

## ✨ Key Features

- **100% Client-Side PDF Parsing**: Upload any KMITL unofficial transcript PDF (`.pdf`). Text is extracted locally using `pdfjs-dist` in the browser without any server upload.
- **CS 2564 Curriculum Compliance**: Pre-configured with the complete KMITL Computer Science 2564 curriculum requirements (135 total credits):
  1. หมวดวิชาศึกษาทั่วไป - กลุ่มวิชาพื้นฐาน (GE Foundation): 6 Credits
  2. หมวดวิชาศึกษาทั่วไป - กลุ่มวิชาด้านภาษาและการสื่อสาร (GE Language): 9 Credits
  3. หมวดวิชาศึกษาทั่วไป - กลุ่มวิชาเลือก (GE Electives): 15 Credits
  4. หมวดวิชาเฉพาะ - วิชาบังคับทางคณิตศาสตร์และสถิติ (Math Mandatory): 18 Credits
  5. หมวดวิชาเฉพาะ - วิชาบังคับทางวิทยาการคอมพิวเตอร์ (CS Mandatory): 57 Credits
  6. หมวดวิชาเฉพาะ - วิชาเลือก (CS Electives): 18 Credits
  7. หมวดวิชาเฉพาะ - การศึกษาทางเลือก (Alternative Study): 6 Credits
  8. หมวดวิชาเลือกเสรี (Free Electives): 6 Credits
- **In-Progress Semester Tracking**: Courses with blank grades (currently enrolled) are detected automatically, excluded from earned graduation credits, and highlighted separately in the In-Progress dashboard.
- **Elective Overflow Handling**: Automatically credits excess GE or CS elective credits toward the Free Elective requirement (6 credits).
- **Alternative Study Track Selector**: Switch effortlessly between:
  - **Track A (Special Problem)**: Special Problem 1 & 2 (`05506098` + `05506099`, 6 credits).
  - **Track B (Cooperative Education)**: Cooperative Education (`05506117`, 6 credits).
  Recalculates missing courses and eligibility in real time upon switching.
- **Graduation Forecast & Missing Course Checklist**: Actionable breakdown of outstanding mandatory courses with color-coded chips distinguishing incomplete courses from in-progress enrollments.
- **Local Cache Persistence**: Transcript audit results persist automatically across browser tabs and refreshes using `localStorage`.

---

## 🔒 Privacy & Offline Guarantee

- **Zero Server Uploads**: The application has no backend server or external API endpoints.
- **Private & Safe**: Your academic records, transcript text, grades, and student ID remain entirely inside your browser sandbox.
- **Fully Offline-Capable**: Once the static assets are loaded, all parsing and auditing work 100% offline.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **PDF Extraction**: [pdfjs-dist v4](https://mozilla.github.io/pdf.js/)
- **Testing**: [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.x or higher)
- `npm` (version 9.x or higher)

### Installation

Clone the repository and install dependencies:

```bash
cd projects/credit-tracker
npm install
```

### Development Server

Start the local development server with hot-module replacement (HMR):

```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

### Running Tests

Execute the full Vitest unit and integration test suite:

```bash
npm test
```

Run test suite in watch mode:

```bash
npx vitest
```

### Production Build

Compile TypeScript and build the optimized production bundle:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## 🧪 Testing & Verification

The project maintains 100% test pass rates across all layers:

- **Model Unit Tests**:
  - `curriculum.test.ts`: Verifies curriculum credit totals (135 cr), mandatory course lists, and alternative paths.
  - `parser.test.ts`: Tests transcript metadata extraction, multi-line course title stitching, letter grade parsing, and in-progress course detection.
  - `calculator.test.ts`: Tests credit summation, alias mapping, category fulfillment, elective overflow, and graduation rule enforcement.
  - `storage.test.ts`: Tests `localStorage` roundtrips, corruption handling, and cache eviction.
- **View Unit Tests**:
  - `CategoryCardView.test.tsx` & `Views.test.tsx`: Tests rendering of badges, progress bars, course lists, empty states, and accessibility attributes.
- **Controller & App Integration Tests**:
  - `useCreditTrackerController.test.ts`: Tests state lifecycle, file processing, error handling, path switching, and cache restoration.
  - `App.test.tsx`: Tests complete root view mounting and user interactions.
- **End-to-End Transcript Verification (`src/test/e2e-transcript.test.ts`)**:
  - Validates the entire pipeline from raw transcript text to full audit on student **Sample Student (65050000)**.
  - Confirms exact values: **85 credits earned** (29 completed courses), **15 credits in-progress** (5 courses), **3.03 cumulative GPA**, and accurate missing mandatory course counts across Special Problem (8 missing) and Cooperative Education (7 missing).

---

## 📄 License

This project is developed for educational and academic tracking purposes for students of the Department of Computer Science, School of Science, King Mongkut's Institute of Technology Ladkrabang (KMITL).
