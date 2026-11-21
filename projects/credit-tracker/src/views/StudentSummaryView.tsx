import React from 'react';
import { GraduationCap, Award, BookOpen, Clock, User } from 'lucide-react';
import { StudentInfo } from '../models/types';

export interface StudentSummaryViewProps {
  studentInfo: StudentInfo;
  totalEarned: number;
  totalRequired: number;
  cumulativeGPA: number;
}

export const StudentSummaryView: React.FC<StudentSummaryViewProps> = ({
  studentInfo,
  totalEarned,
  totalRequired,
  cumulativeGPA,
}) => {
  const percentage = Math.min(
    100,
    totalRequired > 0 ? Math.round((totalEarned / totalRequired) * 100) : 0
  );

  const remainingCredits = Math.max(0, totalRequired - totalEarned);
  const isComplete = totalEarned >= totalRequired;

  // Circular progress calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl backdrop-blur-md">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left Section: Student Details */}
        <div className="space-y-4 flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>หลักสูตรวิทยาศาสตรบัณฑิต วท.บ. (วิทยาการคอมพิวเตอร์) ปรับปรุง 2564</span>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-100 tracking-tight flex items-center justify-center lg:justify-start gap-2.5">
              <User className="w-6 h-6 text-indigo-400 shrink-0 hidden sm:inline" />
              <span>{studentInfo.name || 'ไม่ระบุชื่อนักศึกษา'}</span>
            </h2>
            <div className="mt-1 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-1 text-sm text-slate-400">
              <span className="font-mono text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                รหัสนักศึกษา: {studentInfo.studentId || '-'}
              </span>
              <span>{studentInfo.program || 'สาขาวิชาวิทยาการคอมพิวเตอร์'}</span>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 text-center">
              <div className="text-xs text-slate-400 flex items-center justify-center gap-1 mb-1">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                หน่วยกิตสะสม
              </div>
              <div className="text-xl font-bold text-slate-100">
                {totalEarned}{' '}
                <span className="text-xs font-normal text-slate-400">/ {totalRequired}</span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 text-center">
              <div className="text-xs text-slate-400 flex items-center justify-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                หน่วยกิตคงเหลือ
              </div>
              <div className="text-xl font-bold text-amber-400">
                {remainingCredits} <span className="text-xs font-normal text-slate-400">นก.</span>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 text-center">
              <div className="text-xs text-slate-400 flex items-center justify-center gap-1 mb-1">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                เกรดเฉลี่ยสะสม (GPA)
              </div>
              <div className="text-xl font-bold text-emerald-400">
                {cumulativeGPA > 0 ? cumulativeGPA.toFixed(2) : '-'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Circular Progress Ring */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 130 130">
              {/* Background Track */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                className="stroke-slate-800 fill-none"
                strokeWidth="10"
              />
              {/* Progress Ring */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                className={`fill-none transition-all duration-1000 ease-out ${
                  isComplete ? 'stroke-emerald-400' : 'stroke-indigo-500'
                }`}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
                {percentage}%
              </span>
              <span className="text-xs text-slate-400 font-medium mt-0.5">
                {totalEarned} / {totalRequired} นก.
              </span>
            </div>
          </div>
          <span className="text-xs text-slate-400 mt-2 font-medium">ความคืบหน้ารวม</span>
        </div>
      </div>
    </div>
  );
};
