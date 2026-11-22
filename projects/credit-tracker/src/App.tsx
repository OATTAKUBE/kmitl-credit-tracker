import React from 'react';
import {
  GraduationCap,
  RotateCcw,
  ShieldCheck,
  Code2,
} from 'lucide-react';
import { useCreditTrackerController } from './controllers/useCreditTrackerController';
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
    hasLoadedData,
    handleFileUpload,
    handleDemoLoad,
    handlePathChange,
    handleReset,
  } = useCreditTrackerController();

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0b0f19]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
                  B.Sc. 2564
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                ระบบตรวจสอบหน่วยกิตตามหลักสูตร วท.บ. วิทยาการคอมพิวเตอร์ 2564
              </p>
            </div>
          </div>

          {hasLoadedData && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-xl transition-colors cursor-pointer shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>รีเซ็ต / อัปโหลดใหม่</span>
              </button>
            </div>
          )}
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

            {/* Two-Column Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column / Sidebar */}
              <div className="lg:col-span-5 space-y-6">
                <StudentSummaryView
                  studentInfo={auditResult.studentInfo}
                  totalEarned={auditResult.totalEarned}
                  totalRequired={auditResult.totalRequired}
                  cumulativeGPA={auditResult.cumulativeGPA}
                />
                <PathSelectorView
                  currentPath={currentPath}
                  onSelectPath={handlePathChange}
                />
              </div>

              {/* Right Column / Category Grid */}
              <div className="lg:col-span-7">
                <CategoryGridView categories={auditResult.categories} />
              </div>
            </div>

            {/* Bottom Section: Missing and In-Progress Courses */}
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
            <span>KMITL Computer Science 2564 Curriculum Model</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
