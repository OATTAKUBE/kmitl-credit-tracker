import React from 'react';
import { LayoutGrid } from 'lucide-react';
import type { CategoryId, CategoryProgress } from '../models/types';
import { CategoryCardView } from './CategoryCardView';

export interface CategoryGridViewProps {
  categories: Record<CategoryId, CategoryProgress>;
}

const ORDERED_CATEGORY_IDS: CategoryId[] = [
  'ge_foundation',
  'ge_lang',
  'ge_elective',
  'math_mandatory',
  'cs_mandatory',
  'cs_elective',
  'alternative_study',
  'free_elective',
];

export const CategoryGridView: React.FC<CategoryGridViewProps> = ({ categories }) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <LayoutGrid className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100 tracking-tight">
            ความคืบหน้ารายหมวดวิชา (Curriculum Categories)
          </h2>
          <p className="text-xs text-slate-400">
            ตรวจสอบสัดส่วนหน่วยกิตที่ผ่านแล้วและกำลังศึกษาตามเกณฑ์ 8 หมวดวิชา
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ORDERED_CATEGORY_IDS.map((catId) => {
          const category = categories[catId];
          if (!category) return null;
          return <CategoryCardView key={catId} category={category} />;
        })}
      </div>
    </section>
  );
};
