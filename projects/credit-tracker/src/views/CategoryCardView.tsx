import React, { useState } from 'react';
import { CheckCircle2, Clock, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import type { CategoryProgress } from '../models/types';

export interface CategoryCardViewProps {
  category: CategoryProgress;
}

const getGroupBadgeClass = (group?: string): string => {
  if (group?.includes('ศึกษาทั่วไป')) {
    return 'text-sky-400 bg-sky-500/10 border-sky-500/25';
  }
  if (group?.includes('เฉพาะ')) {
    return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/25';
  }
  if (group?.includes('เลือกเสรี')) {
    return 'text-purple-400 bg-purple-500/10 border-purple-500/25';
  }
  return 'text-slate-400 bg-slate-800 border-slate-700/60';
};

export const CategoryCardView: React.FC<CategoryCardViewProps> = ({ category }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    nameTH,
    shortNameTH,
    groupTH,
    nameEN,
    requiredCredits,
    earnedCredits,
    inProgressCredits,
    isMet,
    courses,
  } = category;

  const displayNameTH = shortNameTH || nameTH;

  const earnedPercentage = Math.min(
    100,
    requiredCredits > 0 ? Math.round((earnedCredits / requiredCredits) * 100) : 0
  );

  const inProgressPercentage = Math.min(
    100 - earnedPercentage,
    requiredCredits > 0 ? Math.round((inProgressCredits / requiredCredits) * 100) : 0
  );

  return (
    <div
      className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-lg backdrop-blur-sm transition-all hover:border-slate-700 hover:shadow-indigo-500/5 flex flex-col justify-between"
      title={nameTH}
    >
      <div>
        {/* Row 1: Group Pill on Left & Status Badge on Right */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span
            className={`text-[11px] font-medium tracking-wide px-2.5 py-0.5 rounded-full border truncate max-w-[170px] ${getGroupBadgeClass(
              groupTH
            )}`}
          >
            {groupTH || 'หมวดวิชา'}
          </span>

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

        {/* Row 2: Full-Width Title and English Subtitle */}
        <div className="mb-3.5">
          <h3 className="text-base font-bold text-slate-100 leading-snug break-words">
            {displayNameTH}
          </h3>
          {nameEN && (
            <p className="text-xs text-indigo-400/90 font-medium mt-0.5 truncate">
              {nameEN}
            </p>
          )}
        </div>

        {/* Row 3: Credits progress text */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="text-2xl font-black text-slate-100 tracking-tight">
            <span>{earnedCredits} / {requiredCredits}</span>
            <span className="text-xs font-normal text-slate-400 ml-1.5">หน่วยกิต</span>
          </div>
          {inProgressCredits > 0 && (
            <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/25 shrink-0 inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              กำลังเรียน {inProgressCredits} นก.
            </span>
          )}
        </div>

        {/* Row 4: Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex mb-3.5">
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

      {/* Footer Area: Stats & Course Accordion */}
      <div>
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            {courses.length > 0 ? `ผ่านแล้ว ${courses.length} วิชา` : 'ยังไม่มีวิชาที่ผ่าน'}
          </span>
          <span className="font-mono text-slate-400 font-semibold">
            {earnedPercentage}%
          </span>
        </div>

        {courses.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              className="w-full mt-2.5 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-xs text-slate-400 hover:text-slate-200 transition-colors border border-slate-700/40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <span>{isExpanded ? 'ซ่อนรายวิชา' : `ดูรายวิชาที่นับแล้ว (${courses.length})`}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {isExpanded && (
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {courses.map((course) => (
                  <div
                    key={course.code}
                    className="flex items-center justify-between text-xs bg-slate-950/60 p-2 rounded-lg border border-slate-800/60"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-indigo-400 font-semibold text-[11px]">
                          {course.code}
                        </span>
                        <span className="text-slate-300 text-[11px] truncate">
                          {course.title}
                        </span>
                      </div>
                      {course.semester && (
                        <span className="text-[10px] text-slate-500">
                          ภาค {course.semester}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-emerald-400 text-xs px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                        {course.grade}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {course.credits} นก.
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
