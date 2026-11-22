import React from 'react';
import { GraduationCap, CheckCircle2, AlertTriangle, BookOpen, Clock } from 'lucide-react';

export interface GraduationBannerViewProps {
  isEligible: boolean;
  totalEarned: number;
  totalRequired: number;
  missingCount: number;
  curriculumName?: string;
}

export const GraduationBannerView: React.FC<GraduationBannerViewProps> = ({
  isEligible,
  totalEarned,
  totalRequired,
  missingCount,
  curriculumName,
}) => {
  const remainingCredits = Math.max(0, totalRequired - totalEarned);

  if (isEligible) {
    return (
      <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-3xl p-6 md:p-8 shadow-xl shadow-emerald-950/30 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
            <GraduationCap className="w-8 h-8" />
          </div>

          <div className="space-y-2 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              มีคุณสมบัติครบถ้วนตามเกณฑ์
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-emerald-100 tracking-tight">
              ยินดีด้วย! คุณมีคุณสมบัติครบถ้วนตามเกณฑ์สำเร็จการศึกษา
            </h2>
            <p className="text-sm text-emerald-200/80 leading-relaxed max-w-2xl">
              คุณได้สะสมหน่วยกิตครบถ้วนตามโครงสร้างหลักสูตร ({totalEarned} / {totalRequired} หน่วยกิต)
              และผ่านรายวิชาบังคับครบทุกรายวิชาของ{curriculumName ? `หลักสูตร ${curriculumName}` : 'หลักสูตร'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2.5 flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            ยังไม่ผ่านเกณฑ์สำเร็จการศึกษา
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">
            ยังไม่ผ่านเกณฑ์สำเร็จการศึกษา
          </h2>

          <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
            คุณยังต้องสะสมหน่วยกิตหรือลงทะเบียนเรียนวิชาบังคับให้ครบถ้วนตามโครงสร้างหลักสูตร {totalRequired} หน่วยกิต
          </p>

          <div className="flex flex-wrap gap-3 pt-1 justify-center sm:justify-start">
            {remainingCredits > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-300 bg-amber-950/50 px-3 py-1.5 rounded-xl border border-amber-500/20">
                <Clock className="w-3.5 h-3.5" />
                ขาดอีก {remainingCredits} หน่วยกิต (สะสมได้ {totalEarned} / {totalRequired})
              </span>
            )}
            {missingCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-rose-300 bg-rose-950/50 px-3 py-1.5 rounded-xl border border-rose-500/20">
                <BookOpen className="w-3.5 h-3.5" />
                มีวิชาบังคับที่ยังไม่ผ่าน {missingCount} วิชา
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ผ่านวิชาบังคับครบทุกวิชาแล้ว
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
