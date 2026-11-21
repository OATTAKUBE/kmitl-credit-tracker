import React from 'react';
import { CheckCircle2, Clock, BookOpen } from 'lucide-react';
import { CategoryProgress } from '../models/types';

export interface CategoryCardViewProps {
  category: CategoryProgress;
}

export const CategoryCardView: React.FC<CategoryCardViewProps> = ({ category }) => {
  const { nameTH, requiredCredits, earnedCredits, inProgressCredits, isMet, courses } = category;

  const earnedPercentage = Math.min(
    100,
    requiredCredits > 0 ? Math.round((earnedCredits / requiredCredits) * 100) : 0
  );

  const inProgressPercentage = Math.min(
    100 - earnedPercentage,
    requiredCredits > 0 ? Math.round((inProgressCredits / requiredCredits) * 100) : 0
  );

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm transition-all hover:border-slate-700/80 hover:shadow-indigo-500/5 flex flex-col justify-between">
      <div>
        {/* Header: Title and Status Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-sm font-semibold text-slate-100 leading-snug line-clamp-2">
            {nameTH}
          </h3>
          {isMet ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              ผ่านแล้ว
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
              <Clock className="w-3.5 h-3.5" />
              ยังไม่ครบ
            </span>
          )}
        </div>

        {/* Credits progress text */}
        <div className="flex items-baseline justify-between mb-2">
          <div className="text-2xl font-bold text-slate-100">
            <span>{earnedCredits} / {requiredCredits}</span>
            <span className="text-sm font-normal text-slate-400 ml-1.5">หน่วยกิต</span>
          </div>
          {inProgressCredits > 0 && (
            <div className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              กำลังเรียน {inProgressCredits} นก.
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex mb-3">
          <div
            className={`h-full transition-all duration-500 ${
              isMet ? 'bg-emerald-500' : 'bg-indigo-500'
            }`}
            style={{ width: `${earnedPercentage}%` }}
          />
          {inProgressPercentage > 0 && (
            <div
              className="h-full bg-amber-500 transition-all duration-500"
              style={{ width: `${inProgressPercentage}%` }}
            />
          )}
        </div>
      </div>

      {/* Footer: Passed courses count */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-slate-500" />
          {courses.length > 0 ? `ผ่านแล้ว ${courses.length} วิชา` : 'ยังไม่มีวิชาที่ผ่าน'}
        </span>
        <span className="font-mono text-slate-500">
          {earnedPercentage}%
        </span>
      </div>
    </div>
  );
};
