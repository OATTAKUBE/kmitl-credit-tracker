import React from 'react';
import { AlertCircle, CheckCircle2, Calendar, Clock } from 'lucide-react';
import type { CurriculumCourse } from '../models/types';

export interface MissingCoursesViewProps {
  missing: CurriculumCourse[];
  curriculumName?: string;
  categoryLabels?: Record<string, string>;
  inProgressCourseCodes?: Set<string>;
}

export const MissingCoursesView: React.FC<MissingCoursesViewProps> = ({
  missing,
  curriculumName,
  categoryLabels,
  inProgressCourseCodes,
}) => {
  const getCategoryLabel = (category: string): string => {
    if (categoryLabels && categoryLabels[category]) {
      return categoryLabels[category];
    }
    switch (category) {
      case 'math_mandatory':
        return 'บังคับคณิตศาสตร์และสถิติ';
      case 'cs_mandatory':
        return 'บังคับวิทยาการคอมพิวเตอร์';
      case 'stat_core':
        return 'กลุ่มวิชาแกน';
      case 'stat_mandatory':
        return 'วิชาบังคับสถิติประยุกต์';
      case 'alternative_study':
      case 'stat_track':
        return 'การศึกษาทางเลือก';
      default:
        return 'วิชาบังคับ';
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              วิชาบังคับที่ยังไม่ผ่าน (Missing Mandatory Courses)
            </h3>
            <p className="text-xs text-slate-400">
              รายวิชาบังคับตามโครงสร้าง{curriculumName ? ` ${curriculumName}` : 'หลักสูตร'} ที่ยังไม่มีประวัติผลการเรียนผ่าน
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            missing.length === 0
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
          }`}
        >
          {missing.length === 0 ? 'ผ่านครบทุกวิชา' : `ขาดอีก ${missing.length} วิชา`}
        </span>
      </div>

      {/* Content */}
      {missing.length === 0 ? (
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h4 className="text-sm font-semibold text-emerald-300">
            ผ่านวิชาบังคับครบถ้วนทุกรายวิชาแล้ว
          </h4>
          <p className="text-xs text-emerald-200/80 max-w-md mx-auto">
            คุณได้ผ่านรายวิชาบังคับครบถ้วนตามเกณฑ์โครงสร้าง{curriculumName ? ` ${curriculumName}` : 'หลักสูตร'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
          {missing.map((course) => {
            const isInProgress = inProgressCourseCodes?.has(course.code);
            return (
              <div
                key={course.code}
                className="bg-slate-950/50 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-3.5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-semibold text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                      {course.code}
                    </span>
                    <span className="text-xs text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                      {getCategoryLabel(course.category)}
                    </span>
                    {isInProgress && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-300 bg-amber-950/70 border border-amber-500/40 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3 text-amber-400" />
                        กำลังศึกษาเทอมนี้
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      {course.credits} หน่วยกิต
                    </span>
                  </div>
                  <div className="text-sm font-medium text-slate-200">
                    {course.titleTH}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {course.titleEN}
                  </div>
                </div>

                {course.yearSem && (
                  <div className="sm:text-right shrink-0">
                    <div className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{course.yearSem}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
