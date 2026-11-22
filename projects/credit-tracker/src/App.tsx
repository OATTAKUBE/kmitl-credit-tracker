import React from 'react';
import {
  GraduationCap,
  RotateCcw,
  ShieldCheck,
  Code2,
  BookCheck,
} from 'lucide-react';
import { useCreditTrackerController } from './controllers/useCreditTrackerController';
import { AVAILABLE_CURRICULUMS, getCurriculum } from './models/curriculum';
import type { CurriculumId } from './models/types';
import {
  UploadView,
  StudentSummaryView,
  PathSelectorView,
  CategoryGridView,
  MissingCoursesView,
  InProgressView,
  GraduationBannerView,
} from './views';

export const App: React.FC = () => {
  const {
    auditResult,
    isProcessing,
    error,
    currentPath,
    currentCurriculum,
    hasLoadedData,
    handleFileUpload,
    handleDemoLoad,
    handlePathChange,
    handleCurriculumChange,
    handleReset,
  } = useCreditTrackerController();

  const activeCurriculum = getCurriculum(currentCurriculum).metadata;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0b0f19]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-100">
                  KMITL CS Credit Tracker
                </h1>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {activeCurriculum.badgeLabel}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                ระบบตรวจสอบหน่วยกิตตาม {activeCurriculum.nameTH}
              </p>
            </div>
          </div>

          {/* Header Actions: Curriculum Selector & Reset Button */}
          <div className="flex items-center gap-3">
            {/* Curriculum Selector Dropdown */}
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800/90 px-3 py-1.5 rounded-xl">
              <BookCheck className="w-4 h-4 text-indigo-400 hidden sm:block" />
              <label htmlFor="curriculum-select" className="text-xs text-slate-400 sr-only">
                เลือกหลักสูตรการศึกษา
              </label>
              <select
                id="curriculum-select"
                aria-label="เลือกหลักสูตรการศึกษา"
                value={currentCurriculum}
                onChange={(e) => handleCurriculumChange(e.target.value as CurriculumId)}
                className="bg-transparent text-xs font-medium text-slate-200 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-400 border-none pr-1"
              >
                {AVAILABLE_CURRICULUMS.map((curr) => (
                  <option key={curr.id} value={curr.id} className="bg-slate-900 text-slate-100 py-1">
                    {curr.nameTH} ({curr.totalRequired} นก.)
                  </option>
                ))}
              </select>
            </div>

            {hasLoadedData && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-xl transition-colors cursor-pointer shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">รีเซ็ต / อัปโหลดใหม่</span>
                <span className="sm:hidden">รีเซ็ต</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!auditResult ? (
          <div className="max-w-2xl mx-auto my-8">
            <UploadView
              onFileUpload={handleFileUpload}
              onDemoLoad={handleDemoLoad}
              isProcessing={isProcessing}
              error={error}
            />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Graduation Eligibility Status Banner */}
            <GraduationBannerView
              isEligible={auditResult.isEligibleToGraduate}
              totalEarned={auditResult.totalEarned}
              totalRequired={auditResult.totalRequired}
              missingCount={auditResult.missingMandatory.length}
            />

            {/* Student Profile & Plan Track Selection (Side-by-side) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-7 flex flex-col">
                <StudentSummaryView
                  studentInfo={auditResult.studentInfo}
                  totalEarned={auditResult.totalEarned}
                  totalRequired={auditResult.totalRequired}
                  cumulativeGPA={auditResult.cumulativeGPA}
                />
              </div>
              <div className="lg:col-span-5 flex flex-col">
                <PathSelectorView
                  currentPath={currentPath}
                  onSelectPath={handlePathChange}
                  curriculumId={currentCurriculum}
                />
              </div>
            </div>

            {/* Full-width Category Progress Grid (Adapts to Active Curriculum Categories) */}
            <CategoryGridView
              categories={auditResult.categories}
              orderedCategoryIds={auditResult.orderedCategoryIds}
            />

            {/* Missing and In-Progress Courses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <MissingCoursesView missing={auditResult.missingMandatory} />
              <InProgressView courses={auditResult.inProgressCourses} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#090d16] py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              ข้อมูลทรานสคริปต์ของคุณถูกประมวลผลบนเบราว์เซอร์ภายในเครื่อง 100% ไม่มีการบันทึกหรือส่งข้อมูลไปยังเซิร์ฟเวอร์ภายนอก
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <Code2 className="w-3.5 h-3.5" />
            <span>KMITL Science Multi-Curriculum Model ({activeCurriculum.badgeLabel})</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
