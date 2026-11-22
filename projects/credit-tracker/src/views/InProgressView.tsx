import React from 'react';
import { Clock, BookOpen, Calendar } from 'lucide-react';
import type { CourseEntry } from '../models/types';

export interface InProgressViewProps {
  courses: CourseEntry[];
}

export const InProgressView: React.FC<InProgressViewProps> = ({ courses }) => {
  const totalInProgressCredits = courses.reduce((sum, c) => sum + c.credits, 0);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              รายวิชาที่กำลังศึกษา (In-Progress Courses)
            </h3>
            <p className="text-xs text-slate-400">
              รายวิชาที่ลงทะเบียนเรียนในภาคการศึกษาปัจจุบันและยังไม่มีผลการเรียน (ยังไม่คิดเป็นหน่วยกิตสะสม)
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
          {courses.length} วิชา ({totalInProgressCredits} หน่วยกิต)
        </span>
      </div>

      {/* Content */}
      {courses.length === 0 ? (
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-6 text-center text-slate-400 text-xs">
          <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          ไม่มีรายวิชาที่กำลังศึกษาอยู่ในขณะนี้ (บันทึกผลการเรียนครบทุกภาคการศึกษาแล้ว)
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {courses.map((course, idx) => (
            <div
              key={`${course.code}-${course.semester}-${idx}`}
              className="bg-slate-950/50 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-3.5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-semibold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                    {course.code}
                  </span>
                  <span className="text-xs text-slate-400">
                    {course.credits} หน่วยกิต
                  </span>
                  {course.semester && (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/60">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {course.semester}
                    </span>
                  )}
                </div>
                <div className="text-sm font-medium text-slate-200">
                  {course.title}
                </div>
              </div>

              <div className="shrink-0">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Clock className="w-3.5 h-3.5" />
                  กำลังศึกษา
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
