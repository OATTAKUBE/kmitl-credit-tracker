import React from 'react';
import { Compass, CheckCircle2, FileCode, Briefcase, Globe } from 'lucide-react';
import type { AlternativePath, CurriculumId } from '../models/types';
import { getCurriculum } from '../models/curriculums/registry';

export interface PathSelectorViewProps {
  currentPath: AlternativePath;
  onSelectPath: (path: AlternativePath) => void;
  curriculumId?: CurriculumId;
}

export const PathSelectorView: React.FC<PathSelectorViewProps> = ({
  currentPath,
  onSelectPath,
  curriculumId = 'cs_2564',
}) => {
  const curriculum = getCurriculum(curriculumId);
  const availablePaths = Object.entries(curriculum.alternativePaths).filter(
    (entry): entry is [AlternativePath, NonNullable<(typeof entry)[1]>] => entry[1] !== undefined
  );

  const getPathIcon = (pathKey: AlternativePath) => {
    switch (pathKey) {
      case 'special_problem':
        return <FileCode className="w-5 h-5" />;
      case 'coop':
        return <Briefcase className="w-5 h-5" />;
      case 'overseas_training':
        return <Globe className="w-5 h-5" />;
      default:
        return <Compass className="w-5 h-5" />;
    }
  };

  const getPathDescription = (pathKey: AlternativePath) => {
    if (curriculumId === 'stat_2564') {
      switch (pathKey) {
        case 'special_problem':
          return 'โครงงานปัญหาพิเศษ (05406167 ปัญหาพิเศษ 2 รวม 6 หน่วยกิต)';
        case 'coop':
          return 'การปฏิบัติงานสหกิจศึกษาในสถานประกอบการเต็มเวลา 1 ภาคเรียน (05406168 สหกิจศึกษา รวม 6 หน่วยกิต)';
        case 'overseas_training':
          return 'การปฏิบัติการฝึกงานต่างประเทศ (05406169 & 05406170 รวม 6 หน่วยกิต)';
      }
    }
    // Default to CS 2564 descriptions
    switch (pathKey) {
      case 'special_problem':
        return 'โครงงานวิจัยและพัฒนาซอฟต์แวร์ 2 ภาคเรียน (05506098 ปัญหาพิเศษ 1 และ 05506099 ปัญหาพิเศษ 2 รวม 6 หน่วยกิต)';
      case 'coop':
        return 'การปฏิบัติงานในสถานประกอบการเต็มเวลา 1 ภาคการศึกษา (05506117 สหกิจศึกษา รวม 6 หน่วยกิต)';
      default:
        return 'การศึกษาทางเลือก 6 หน่วยกิต';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl backdrop-blur-md flex flex-col justify-between h-full">
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              แผนการศึกษาทางเลือก (Alternative Study Track)
            </h3>
            <p className="text-xs text-slate-400">
              หมวดวิชาเฉพาะ - การศึกษาทางเลือก (6 หน่วยกิต) กรุณาเลือกแผนการศึกษา
            </p>
          </div>
        </div>

        <div role="radiogroup" aria-label="เลือกแผนการศึกษาทางเลือก" className="flex flex-col gap-2.5">
          {availablePaths.map(([pathKey, pathOption]) => {
            const isSelected = currentPath === pathKey;
            return (
              <button
                key={pathKey}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelectPath(pathKey)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/40 shadow-lg shadow-indigo-500/10 text-slate-100'
                    : 'bg-slate-950/50 border-slate-800/90 text-slate-400 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                        : 'bg-slate-800/80 text-slate-400 border border-slate-700/60'
                    }`}
                  >
                    {getPathIcon(pathKey)}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <span className="font-semibold text-sm text-slate-200 block truncate">
                      {pathOption.nameTH}
                    </span>
                    <p className="text-xs text-slate-400 leading-normal line-clamp-2">
                      {getPathDescription(pathKey)}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pl-1">
                  {isSelected ? (
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
