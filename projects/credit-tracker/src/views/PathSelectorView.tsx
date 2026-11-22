import React from 'react';
import { Compass, CheckCircle2, FileCode, Briefcase } from 'lucide-react';
import type { AlternativePath } from '../models/types';

export interface PathSelectorViewProps {
  currentPath: AlternativePath;
  onSelectPath: (path: AlternativePath) => void;
}

export const PathSelectorView: React.FC<PathSelectorViewProps> = ({
  currentPath,
  onSelectPath,
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-sm space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Compass className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-100">
            แผนการศึกษาทางเลือก (Alternative Study Track)
          </h3>
          <p className="text-xs text-slate-400">
            หมวดวิชาเฉพาะ - การศึกษาทางเลือก (6 หน่วยกิต) กรุณาเลือกแผนการศึกษาที่ต้องการตรวจสอบ
          </p>
        </div>
      </div>

      <div role="radiogroup" aria-label="เลือกแผนการศึกษาทางเลือก" className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* Option 1: Special Problem */}
        <button
          type="button"
          role="radio"
          aria-checked={currentPath === 'special_problem'}
          onClick={() => onSelectPath('special_problem')}
          className={`relative text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none ${
            currentPath === 'special_problem'
              ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/40 shadow-lg shadow-indigo-500/10 text-slate-100'
              : 'bg-slate-950/50 border-slate-800/90 text-slate-400 hover:border-slate-700 hover:bg-slate-900/60'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              currentPath === 'special_problem'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'bg-slate-800/80 text-slate-400 border border-slate-700/60'
            }`}
          >
            <FileCode className="w-5 h-5" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-slate-200">
                ปัญหาพิเศษ 1 & 2 (Special Problem)
              </span>
              {currentPath === 'special_problem' && (
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              โครงงานวิจัยและพัฒนาซอฟต์แวร์ 2 ภาคเรียน (05506098 ปัญหาพิเศษ 1 และ 05506099 ปัญหาพิเศษ 2 รวม 6 หน่วยกิต)
            </p>
          </div>
        </button>

        {/* Option 2: Cooperative Education */}
        <button
          type="button"
          role="radio"
          aria-checked={currentPath === 'coop'}
          onClick={() => onSelectPath('coop')}
          className={`relative text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none ${
            currentPath === 'coop'
              ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/40 shadow-lg shadow-indigo-500/10 text-slate-100'
              : 'bg-slate-950/50 border-slate-800/90 text-slate-400 hover:border-slate-700 hover:bg-slate-900/60'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              currentPath === 'coop'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'bg-slate-800/80 text-slate-400 border border-slate-700/60'
            }`}
          >
            <Briefcase className="w-5 h-5" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-slate-200">
                สหกิจศึกษา (Cooperative Education)
              </span>
              {currentPath === 'coop' && (
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              การปฏิบัติงานในสถานประกอบการเต็มเวลา 1 ภาคการศึกษา (05506117 สหกิจศึกษา รวม 6 หน่วยกิต)
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
